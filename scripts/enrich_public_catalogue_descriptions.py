#!/usr/bin/env python3
"""Enrichit les fiches publiques sans modifier les leçons ni dévoiler les évaluations.

Exécution : python3 scripts/enrich_public_catalogue_descriptions.py --workers 4
Pilote : python3 scripts/enrich_public_catalogue_descriptions.py --workers 1 --limit-batches 1
Les lots intermédiaires sont hors dépôt. Le JSON public final n'est écrit que si les
296 fiches et leurs deux langues sont complètes et validées.
"""
import argparse
import concurrent.futures
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import requests

ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "client/src/data/trainingIndex.json"
COURSES = ROOT / "client/public/data/courses"
WORK = Path("/home/ubuntu/catalogue-editorial-work")
OUTPUT = ROOT / "shared/publicCatalogueEditorial.generated.json"
MODEL = "gpt-5-mini"
BANNED = re.compile(r"\b(?:datacamp|skilljar|certsafari|coursera|udemy|cours partenaire|partner course|source du cours|source de la formation|formation partenaire)\b", re.I)
GENERIC = re.compile(r"^(what you will learn|introduction|conclusion|summary|quiz|checkpoint|learning objectives|ce que vous allez apprendre|résumé|sommaire)$", re.I)


def localized(value, lang):
    if isinstance(value, dict):
        return str(value.get(lang) or value.get("en") or value.get("fr") or "").strip()
    return str(value or "").strip()


def keep_text(text, max_len=240):
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    text = re.sub(r"\b(?:un(?:e)?\s+)?cours\s+partenaire(?:\s+(?:de\s+)?formation)?(?:\s+autorisée?)?\b", "une formation pratique", text, flags=re.I)
    text = re.sub(r"\b(?:an?\s+)?partner\s+course\b", "practical training", text, flags=re.I)
    text = re.sub(r"\b(?:source du cours|source de la formation|formation partenaire)\b", "formation", text, flags=re.I)
    text = re.sub(r"\b(?:DataCamp|Skilljar|CertSafari)\b", "", text, flags=re.I)
    return re.sub(r"\s{2,}", " ", text)[:max_len]


def source_for_course(course, cert):
    data = json.loads((COURSES / (course["id"] + ".json")).read_text())
    lessons = []
    for lesson in data.get("lessons", [])[:14]:
        titles = {lang: keep_text(localized(lesson.get("title"), lang), 110) for lang in ("fr", "en")}
        chapter_titles = []
        for chapter in (lesson.get("chapters") or [])[:5]:
            label = {lang: keep_text(localized(chapter.get("title"), lang), 95) for lang in ("fr", "en")}
            if not GENERIC.match(label["en"]) and not GENERIC.match(label["fr"]):
                chapter_titles.append(label)
        lessons.append({"title": titles, "topics": chapter_titles[:4]})
    return {
        "id": course["id"],
        "certId": course["certId"],
        "title": {lang: keep_text(localized(course.get("title"), lang), 150) for lang in ("fr", "en")},
        "existing": {lang: keep_text(localized(course.get("description"), lang)) for lang in ("fr", "en")},
        "programme": {lang: keep_text(localized(cert.get("title"), lang), 150) for lang in ("fr", "en")},
        "lessons": lessons,
        "lessonCount": len(data.get("lessons", [])),
        "exerciseCount": int(course.get("exerciseCount") or 0),
    }


def source_for_programme(cert, courses):
    return {
        "id": cert["id"],
        "title": {lang: keep_text(localized(cert.get("title"), lang), 150) for lang in ("fr", "en")},
        "existing": {lang: keep_text(localized(cert.get("description"), lang), 330) for lang in ("fr", "en")},
        "level": {lang: keep_text(localized(cert.get("level"), lang), 80) for lang in ("fr", "en")},
        "format": cert.get("trainingFormat") or "training",
        "courses": [{"title": {lang: keep_text(localized(course.get("title"), lang), 100) for lang in ("fr", "en")}, "description": {lang: keep_text(localized(course.get("description"), lang), 140) for lang in ("fr", "en")}} for course in courses[:18]],
        "courseCount": len(courses),
    }


def request_batch(kind, batch):
    url = os.environ["OPENAI_API_BASE"].rstrip("/") + "/chat/completions"
    key = os.environ["OPENAI_API_KEY"]
    aliases = {f"item-{index + 1}": item["id"] for index, item in enumerate(batch)}
    # L'identifiant technique peut contenir le nom de la source et contaminer
    # la rédaction. L'IA ne voit que des alias neutres, jamais les IDs internes.
    prompt_items = [{**{k: v for k, v in item.items() if k not in ("id", "certId")}, "id": alias}
                    for alias, item in zip(aliases, batch)]
    schema = {
        "type": "object", "additionalProperties": False,
        "properties": {"items": {"type": "array", "items": {"type": "object", "additionalProperties": False,
            "properties": {
                "id": {"type": "string"},
                "frSummary": {"type": "string"}, "enSummary": {"type": "string"},
                "frOverview": {"type": "array", "items": {"type": "string"}},
                "enOverview": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["id", "frSummary", "enSummary", "frOverview", "enOverview"]
        }}},
        "required": ["items"]
    }
    instructions = (
        "Tu rédiges pour le catalogue PUBLIC de Neopolis Akademy, pas pour les leçons. "
        "Pour CHAQUE item et dans le même ordre, produis deux résumés distincts (FR/EN, 170-330 caractères) "
        "et deux paragraphes de présentation par langue (130-380 caractères chacun). "
        "Reste fidèle aux seuls titres, plans de leçons, descriptions et métriques fournis. "
        "Chaque texte doit expliquer avec précision le sujet, la méthode ou l'application concrète, "
        "sans inventer de vidéos, de projets, d'évaluations, de compétences validées, de durée ni de certification garantie. "
        "Pour les préparations de certification, ne dis jamais que la formation elle-même est délivrée officiellement. "
        "Ne donne PAS le nom de la plateforme source des cours (DataCamp, Skilljar, CertSafari, etc.), "
        "ni de lien, citation, historique d'import, identifiant technique ou label fournisseur. "
        "Conserve les noms de produits utiles au sens pédagogique (Claude, Anthropic, n8n, Python, etc.). "
        "N'emploie pas de promesse médicale, financière ou de recrutement. "
        "La version anglaise doit avoir le MÊME sens et les MÊMES faits que la version française. "
        "Chaque formation/cours doit avoir des formulations spécifiques, sans gabarit répétitif, "
        "et sans reprendre mot pour mot les paragraphes pédagogiques. Retourne uniquement le JSON demandé."
    )
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": instructions},
            {"role": "user", "content": json.dumps({"type": kind, "items": prompt_items}, ensure_ascii=False, separators=(",", ":"))},
        ],
        "response_format": {"type": "json_schema", "json_schema": {"name": "catalogue_editorial", "strict": True, "schema": schema}},
        "max_completion_tokens": 6500,
        "reasoning": {"effort": "minimal"},
    }
    result = requests.post(url, headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}, json=payload, timeout=240)
    result.raise_for_status()
    message = result.json()["choices"][0]["message"]["content"]
    parsed = json.loads(message)
    for item in parsed["items"]:
        item["id"] = aliases.get(item.get("id"), item.get("id"))
    return parsed


def validate_item(output, source, kind):
    if output.get("id") != source["id"]:
        raise ValueError("identifiant décalé")
    expected = ("frSummary", "enSummary", "frOverview", "enOverview")
    for key in expected:
        value = output.get(key)
        parts = value if isinstance(value, list) else [value]
        if key.endswith("Overview") and not (1 <= len(parts) <= 12):
            raise ValueError(f"{key}: nombre de paragraphes invalide ({len(parts)})")
        for part in parts:
            if not isinstance(part, str) or len(part.strip()) < 45 or len(part) > (900 if key.endswith("Overview") else 430):
                raise ValueError(f"{key}: longueur invalide")
            forbidden = BANNED.search(part)
            if forbidden or re.search(r"https?://|www\.|<[^>]+>|[{}\\]", part, re.I):
                reason = forbidden.group(0) if forbidden else "URL/markup"
                raise ValueError(f"{source['id']} {key}: {reason} non admis")
    for lang in ("fr", "en"):
        if len(output[lang + "Summary"]) < 140:
            raise ValueError(f"résumé trop court en {lang}")
    return {
        "fr": {"summary": output["frSummary"].strip(), "overview": [v.strip() for v in output["frOverview"]]},
        "en": {"summary": output["enSummary"].strip(), "overview": [v.strip() for v in output["enOverview"]]},
    }


def verified_outline(source, kind):
    """Aucune autre IA que Claude ne rédige les descriptifs des cursus Anthropic."""
    result = {}
    programme_lessons = {"fr": [], "en": []}
    programme_topics = {"fr": [], "en": []}
    if kind == "programmes":
        # Le descriptif d'une formation à un seul cours ne doit pas répéter
        # trois fois son nom : les titres viennent des vraies leçons publiques.
        index = json.loads(CATALOGUE.read_text())
        for course in (entry for entry in index["courses"] if entry["certId"] == source["id"]):
            course_data = json.loads((COURSES / (course["id"] + ".json")).read_text())
            for lesson in course_data.get("lessons", [])[:6]:
                for lang in ("fr", "en"):
                    name = keep_text(localized(lesson.get("title"), lang), 105)
                    if name and not GENERIC.match(name) and name not in programme_lessons[lang]:
                        programme_lessons[lang].append(name)
                for chapter in (lesson.get("chapters") or [])[:3]:
                    for lang in ("fr", "en"):
                        name = keep_text(localized(chapter.get("title"), lang), 105)
                        if name and not GENERIC.match(name) and name not in programme_topics[lang]:
                            programme_topics[lang].append(name)
    for lang in ("fr", "en"):
        title = source["title"][lang]
        existing = source["existing"][lang].strip().rstrip(".")
        if kind == "courses":
            lessons = [lesson["title"][lang] for lesson in source["lessons"] if lesson["title"][lang]][:5]
            topics = [topic[lang] for lesson in source["lessons"] for topic in lesson["topics"] if topic[lang]][:6]
            if lang == "fr":
                summary = (existing + ". ") if existing else f"Le cours « {title} » se compose de {source['lessonCount']} leçons. "
                summary += ("Les thèmes abordés comprennent « " + " », « ".join(lessons[:2]) + " »." if lessons else "Le programme détaille les thèmes indiqués dans son plan pédagogique.")
                first = ("Le parcours suit notamment les leçons « " + " », « ".join(lessons) + " ».") if lessons else f"Ce cours fait partie de la formation « {source['programme'][lang]} »."
                second = ("Les chapitres présentent notamment « " + " », « ".join(topics) + " ».") if topics else "Le plan de cours décrit les notions étudiées dans chaque leçon."
            else:
                summary = (existing + ". ") if existing else f"The course “{title}” comprises {source['lessonCount']} lessons. "
                summary += ("Topics include “" + "”, “".join(lessons[:2]) + "”." if lessons else "Its published lesson outline lists the subjects covered.")
                first = ("The learning path includes the lessons “" + "”, “".join(lessons) + "”.") if lessons else f"This course belongs to the “{source['programme'][lang]}” programme."
                second = ("Chapter topics include “" + "”, “".join(topics) + "”.") if topics else "The course outline lists the subjects addressed in its lessons."
        else:
            names = [entry["title"][lang] for entry in source["courses"] if entry["title"][lang]][:7]
            lessons = programme_lessons[lang][:5]
            topics = programme_topics[lang][:6]
            if lang == "fr":
                summary = (existing + ". ") if existing else f"La formation « {title} » rassemble {source['courseCount']} cours. "
                summary += ("Les leçons abordent « " + " », « ".join(lessons[:2]) + " ».") if len(names) == 1 and lessons else ("Le parcours comprend notamment « " + " », « ".join(names[:2]) + " ».") if names else "Les modules figurent dans le catalogue public."
                first = ("Le parcours suit les leçons « " + " », « ".join(lessons) + " ».") if len(names) == 1 and lessons else ("Les cours inclus couvrent « " + " », « ".join(names) + " ».") if names else "Consultez le catalogue des cours de cette formation."
                second = ("Les chapitres explorent notamment « " + " », « ".join(topics) + " ».") if topics else "Chaque fiche de cours présente son plan pédagogique, ses thèmes et ses activités disponibles sur la plateforme."
            else:
                summary = (existing + ". ") if existing else f"The “{title}” programme brings together {source['courseCount']} courses. "
                summary += ("Lessons cover “" + "”, “".join(lessons[:2]) + "”.") if len(names) == 1 and lessons else ("Its courses include “" + "”, “".join(names[:2]) + "”.") if names else "Its modules are listed in the public catalogue."
                first = ("The programme follows the lessons “" + "”, “".join(lessons) + "”.") if len(names) == 1 and lessons else ("Included courses cover “" + "”, “".join(names) + "”.") if names else "Browse the public catalogue for this programme's courses."
                second = ("Chapter topics include “" + "”, “".join(topics) + "”.") if topics else "Each course page sets out its actual lesson outline, topics and available learning activities."
        result[lang] = {"summary": summary, "overview": [first, second]}
    return result


def polish_french(entry):
    replacements = (
        (r"\bproduction-grade\b", "fiables en production"),
        (r"\ble tool use\b", "l’utilisation des outils"),
        (r"\btool use\b", "utilisation des outils"),
        (r"\bcaching\b", "mise en cache"),
        (r"\bpassagers de recherche\b", "passages de recherche"),
        (r"\bgénérer meilleurs\b", "générer de meilleurs"),
    )
    def corrected(text):
        for pattern, replacement in replacements:
            text = re.sub(pattern, replacement, text, flags=re.I)
        return text
    entry["fr"]["summary"] = corrected(entry["fr"]["summary"])
    entry["fr"]["summary"] = re.sub(r"^une formation\b", "Une formation", entry["fr"]["summary"])
    entry["fr"]["overview"] = [corrected(text) for text in entry["fr"]["overview"]]
    return entry


def one_batch(kind, number, batch):
    key = hashlib.sha256(json.dumps(batch, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
    path = WORK / f"{kind}-{number:03d}-{key}.json"
    if path.exists():
        return kind, number, json.loads(path.read_text())["items"], "cache"
    last = None
    for attempt in range(3):
        try:
            response = request_batch(kind, batch)
            got = response["items"]
            if len(got) != len(batch):
                raise ValueError(f"lot incomplet: {len(got)}/{len(batch)}")
            output = {item["id"]: validate_item(item, source, kind) for item, source in zip(got, batch)}
            tmp = path.with_suffix(".tmp")
            tmp.write_text(json.dumps({"items": output, "model": MODEL}, ensure_ascii=False, indent=2) + "\n")
            tmp.replace(path)
            return kind, number, output, "généré"
        except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
            last = f"{type(exc).__name__}: {str(exc)[:160]}"
            time.sleep(2 ** attempt)
    raise RuntimeError(f"{kind} lot {number}: {last}")


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--limit-batches", type=int, default=0)
    args = parser.parse_args()
    if not os.getenv("OPENAI_API_KEY") or not os.getenv("OPENAI_API_BASE"):
        sys.exit("Proxy Manus Sandbox non configuré")
    WORK.mkdir(parents=True, exist_ok=True)
    data = json.loads(CATALOGUE.read_text())
    by_cert = {item["id"]: item for item in data["certifications"]}
    courses = [source_for_course(course, by_cert[course["certId"]]) for course in data["courses"]]
    programmes = [source_for_programme(cert, [c for c in data["courses"] if c["certId"] == cert["id"]]) for cert in data["certifications"]]
    protected_ids = {cert["id"] for cert in data["certifications"] if re.search(r"claude|anthropic", cert["id"] + " " + json.dumps(cert.get("title", "")), re.I)}
    protected = {
        "courses": {course["id"]: verified_outline(course, "courses") for course in courses if course["certId"] in protected_ids},
        "programmes": {item["id"]: verified_outline(item, "programmes") for item in programmes if item["id"] in protected_ids},
    }
    generated_sources = (("courses", [course for course in courses if course["id"] not in protected["courses"]]),
                         ("programmes", [item for item in programmes if item["id"] not in protected["programmes"]]))
    tasks = [(kind, n, items[n*4:(n+1)*4]) for kind, items in generated_sources for n in range((len(items)+3)//4)]
    if args.limit_batches:
        tasks = tasks[:args.limit_batches]
    complete = protected
    failures = []
    print(f"{len(tasks)} lots, {len(courses)} cours, {len(programmes)} formations", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(max(1,args.workers),6)) as pool:
        futures = {pool.submit(one_batch,*task): task for task in tasks}
        for index, future in enumerate(concurrent.futures.as_completed(futures),1):
            try:
                kind, n, values, status = future.result()
                complete[kind].update(values)
                print(f"{index}/{len(tasks)} {kind} {n}: {status} ({len(values)} fiches)",flush=True)
            except Exception as exc:
                failures.append(str(exc))
                print(f"{index}/{len(tasks)} ÉCHEC: {str(exc)[:180]}",flush=True)
    if failures:
        sys.exit(f"{len(failures)} lot(s) manquant(s) ; sortie publique inchangée")
    if args.limit_batches:
        print("Pilote validé ; aucun catalogue publié", flush=True)
        return
    for kind, source in (("courses", courses), ("programmes", programmes)):
        if set(complete[kind]) != {item["id"] for item in source}:
            sys.exit(f"Couverture incomplète de {kind} ; sortie publique inchangée")
    for kind in ("courses", "programmes"):
        for entry in complete[kind].values():
            polish_french(entry)
    document = {"schemaVersion": "1.0", "generatedAt": datetime.now(timezone.utc).isoformat(), "editorialModel": MODEL, "protectedCataloguesFromOutlines": sorted(protected_ids),
                "programmes": {p["id"]: complete["programmes"][p["id"]] for p in programmes},
                "courses": {c["id"]: complete["courses"][c["id"]] for c in courses}}
    tmp = OUTPUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n")
    tmp.replace(OUTPUT)
    print(f"JSON complet écrit: {len(programmes)} formations, {len(courses)} cours",flush=True)


if __name__ == "__main__":
    run()
