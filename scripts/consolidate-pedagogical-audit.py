#!/usr/bin/env python3
"""Consolide les rapports qualitatifs de formation en livrables d'audit sans toucher aux cours."""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean, median
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "pedagogical-audit"
RAW = AUDIT / "raw"
COURSES_DIR = ROOT / "client" / "public" / "data" / "courses"

REQUIRED_ISSUE_FIELDS = [
    "issue_id", "course_id", "chapter_id", "content_id", "content_type", "severity",
    "category", "description", "current_content", "proposed_content", "evidence",
    "confidence", "verification_status", "recommended_action",
]
ACTIVITY_TYPES = {
    "checkpoint", "checkpoint_exercise", "single_choice_exercise", "multi_choice_exercise",
    "resource_review", "cloud_exercise", "exercise", "matching", "bucket_sort", "fill_blank",
    "code_repl", "terminal_sim", "ai_evaluation", "ordering", "knowledge_check",
    "inline_myth_reality", "inline_multiple_choice_feedback", "inline_scenario_question_feedback",
    "course_final_quiz", "reflection", "guided_action", "chapter_quiz", "VisualExercise",
    "TabExercise", "LocalEnvironmentExercise", "DatalabExercise",
}


def md(value: Any) -> str:
    """Compact content safely for a Markdown table cell."""
    text = str(value or "").replace("\n", " ").replace("|", "\\|")
    return " ".join(text.split())


def heading(value: Any) -> str:
    return str(value or "Sans titre").replace("\n", " ").strip()


def stable_issue_ids(issues: list[dict[str, Any]]) -> None:
    seen: Counter[str] = Counter()
    for issue in issues:
        source_id = str(issue["issue_id"])
        seen[source_id] += 1
        if seen[source_id] > 1:
            issue["original_issue_id"] = source_id
            issue["issue_id"] = f"{source_id}:duplicate-{seen[source_id]}"


def load() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    reports: list[dict[str, Any]] = []
    chapters: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []
    for report_path in sorted(RAW.glob("*.json")):
        report = json.loads(report_path.read_text(encoding="utf-8"))
        reports.append(report)
        for course in report.get("courses", []):
            for chapter in course.get("chapters", []):
                chapter_entry = {
                    "formation_id": report.get("formation_id"),
                    "course_id": course.get("course_id"),
                    **chapter,
                }
                chapters.append(chapter_entry)
                for issue in chapter.get("issues") or []:
                    item = {"formation_id": report.get("formation_id"), **issue}
                    missing = [field for field in REQUIRED_ISSUE_FIELDS if field not in item]
                    if missing:
                        raise ValueError(f"{report_path.name}: issue missing {missing}")
                    issues.append(item)
    stable_issue_ids(issues)
    return reports, chapters, issues


def source_activity_metrics() -> dict[str, Any]:
    interactive_blocks = Counter()
    exercise_definitions = 0
    checkpoint_references = 0
    for course_path in COURSES_DIR.glob("*.json"):
        course = json.loads(course_path.read_text(encoding="utf-8"))
        exercise_definitions += len(course.get("exercises") or [])
        for lesson in course.get("lessons") or []:
            for chapter in lesson.get("chapters") or []:
                for block in chapter.get("blocks") or []:
                    if block.get("type") in ACTIVITY_TYPES:
                        interactive_blocks[block.get("type")] += 1
                    if block.get("exerciseId"):
                        checkpoint_references += 1
    return {
        "interactive_blocks": sum(interactive_blocks.values()),
        "interactive_blocks_by_type": dict(sorted(interactive_blocks.items())),
        "exercise_definitions": exercise_definitions,
        "checkpoint_exercise_references": checkpoint_references,
    }


def write(path: Path, content: str) -> None:
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def build_summary(reports: list[dict[str, Any]], chapters: list[dict[str, Any]], issues: list[dict[str, Any]], metrics: dict[str, Any]) -> dict[str, Any]:
    severity = Counter(issue["severity"] for issue in issues)
    confidence = Counter(issue["confidence"] for issue in issues)
    categories = Counter(issue["category"] for issue in issues)
    scores = [chapter["score_100"] for chapter in chapters if isinstance(chapter.get("score_100"), (int, float))]
    course_ids = sorted({chapter["course_id"] for chapter in chapters})
    issue_chapters = {issue["chapter_id"] for issue in issues}
    activities = [issue for issue in issues if issue["content_type"] in ACTIVITY_TYPES]
    course_counts = Counter(issue["course_id"] for issue in issues)
    p0_by_course = Counter(issue["course_id"] for issue in issues if issue["severity"] == "P0")
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "audit_type": "qualitative_pedagogical_and_learner_experience_audit",
        "verification_scope": "JSON de production, registre de blocs, chemins de rendu et logique de progression ; sans modification ni session apprenant authentifiée.",
        "coverage": {
            "formations": len(reports),
            "courses": len(course_ids),
            "chapters": len(chapters),
            "chapters_with_confirmed_issue": len(issue_chapters),
            "scored_chapters": len(scores),
            "scoring_coverage_percent": round(100 * len(scores) / len(chapters), 2) if chapters else 0,
            "activity_blocks_reviewed": metrics["interactive_blocks"],
            "exercise_definitions_reviewed": metrics["exercise_definitions"],
            "checkpoint_exercise_references_reviewed": metrics["checkpoint_exercise_references"],
        },
        "score": {
            "mean_100": round(mean(scores), 2) if scores else None,
            "median_100": median(scores) if scores else None,
            "distribution": {
                "0_39": sum(score < 40 for score in scores),
                "40_59": sum(40 <= score < 60 for score in scores),
                "60_79": sum(60 <= score < 80 for score in scores),
                "80_100": sum(score >= 80 for score in scores),
            },
            "method": "Scores 0–100 établis par chapitre, sur les dimensions vérifiables uniquement ; les dimensions non vérifiables ne sont pas notées et les pondérations sont renormalisées.",
        },
        "issues": {
            "total": len(issues),
            "activity_related": len(activities),
            "severity": {key: severity.get(key, 0) for key in ["P0", "P1", "P2", "P3"]},
            "confidence": dict(sorted(confidence.items())),
            "top_categories": categories.most_common(20),
        },
        "top_priority_courses": {
            "by_p0": [{"course_id": course_id, "p0": count} for course_id, count in p0_by_course.most_common(20)],
            "by_total_issues": [{"course_id": course_id, "issues": count} for course_id, count in course_counts.most_common(20)],
        },
        "limitations": [
            "Les rapports vérifient les données réellement lues par l’application et les chemins de rendu/progression ; ils ne remplacent pas un test E2E connecté sur desktop, tablette et mobile.",
            "Les vidéos, PDF, téléchargements, environnements externes et évaluations dynamiques non exécutés sont marqués non vérifiés, jamais présumés absents.",
            "Aucune correction de contenu, donnée ou code n’est effectuée dans cette phase d’audit.",
            "Six identifiants de constats du matériau brut étaient dupliqués ; le livrable normalise les doublons par le suffixe `:duplicate-n` et conserve `original_issue_id`.",
        ],
    }


def executive(summary: dict[str, Any]) -> str:
    severity = summary["issues"]["severity"]
    score = summary["score"]
    coverage = summary["coverage"]
    top_p0 = summary["top_priority_courses"]["by_p0"][:10]
    return f"""# Audit pédagogique et UX — Synthèse exécutive

> **Périmètre audité en lecture seule :** {coverage['formations']} formations, {coverage['courses']} cours et {coverage['chapters']} écrans. Aucun contenu, code applicatif ou enregistrement de base n’a été modifié.

## Résultat global

| Indicateur | Résultat |
|---|---:|
| Score moyen pédagogique (dimensions vérifiables) | **{score['mean_100']}/100** |
| Couverture des scores | {coverage['scored_chapters']} / {coverage['chapters']} écrans ({coverage['scoring_coverage_percent']} %) |
| Blocs interactifs audités | {coverage['activity_blocks_reviewed']} |
| Définitions d’exercices auditées | {coverage['exercise_definitions_reviewed']} |
| Références checkpoint → exercice auditées | {coverage['checkpoint_exercise_references_reviewed']} |
| Constats confirmés | **{summary['issues']['total']}** |
| Constats liés à une activité | {summary['issues']['activity_related']} |
| P0 — bloquants | **{severity['P0']}** |
| P1 — majeurs | **{severity['P1']}** |
| P2 — modérés | {severity['P2']} |
| P3 — mineurs | {severity['P3']} |

Le score est un **indicateur de qualité pédagogique observable**, pas une note de conformité académique : les médias externes, le comportement E2E authentifié et la correction dynamique ne sont pas inclus lorsqu’ils n’ont pas été exécutés.

## Diagnostic prioritaire

1. **L’intégrité de la progression est le défaut dominant.** Des checkpoints invisibles, des validations de réponses libres trop permissives, des médias obligatoires ignorés par le verrou et des activités pratiques déverrouillées après une saisie minimale empêchent de garantir l’acquisition avant passage.
2. **Les TPs ne sont pas toujours faisables dans Neopolis.** Plusieurs activités demandent un fichier, une interface, une session ou un environnement non fourni dans l’écran. C’est un P0 lorsque l’activité est obligatoire et ne peut être réalisée sans cet élément.
3. **Le feedback existe souvent dans les données mais pas dans l’expérience apprenant.** Les indices, corrections de tri et explications ne sont pas systématiquement transmis aux composants de rendu.
4. **Les cours techniques souffrent d’une fausse pratique.** Plusieurs `code_repl` comparent une saisie à une solution canonique sans exécuter le code ni valider le résultat attendu ; certains ne conditionnent pas la progression.
5. **La contextualisation multimédia et la localisation restent inégales.** Des vidéos isolées n’explicitent pas leur objectif ni leur réinvestissement ; des parcours français conservent des feedbacks, transcriptions ou critères visibles en anglais.

## Cours concentrant le plus de P0

| Cours | P0 | Risque principal |
|---|---:|---|
{chr(10).join(f"| `{item['course_id']}` | {item['p0']} | Validation ou activité bloquante non fiable / non rendue |" for item in top_p0)}

## Recommandations de pilotage

### Lot A — sécuriser l’apprentissage avant la navigation
- Unifier la clé de complétion entre les blocs, les événements de média et `chapterProgress`.
- Rendre tout checkpoint configuré soit avec un exercice valide, soit avec des questions directement affichables — jamais les deux contrats partiels.
- Empêcher un passage sur une réponse libre non qualifiée, une mauvaise réponse ou un simple caractère lorsqu’une preuve structurée est requise.

### Lot B — rendre les activités praticables et évaluables
- Fournir chaque fichier annoncé directement dans `resources`, ou déclarer clairement une alternative reproductible.
- Pour le code : exécuter dans un environnement sûr, ou évaluer une preuve manuelle/rubrique cohérente ; ne pas présenter une comparaison textuelle comme une pratique réelle.
- Pour les TPs externes : vérifier l’accès requis ou proposer un mode simulation/documentation qui reste équitable.

### Lot C — améliorer la clarté et le retour pédagogique
- Afficher le feedback déjà configuré pour les tris, associations et remises en ordre.
- Rendre visibles : objectif, action attendue, résultat/livrable et critère de réussite avant toute activité.
- Normaliser les chaînes visibles FR/EN, alternatives textuelles et métadonnées vidéo.

## Limites et statut de vérification

{chr(10).join(f'- {item}' for item in summary['limitations'])}

Les détails, preuves et corrections proposées sont disponibles dans `courses-audit.md`, `activities-audit.md` et `audit-data.json`.
"""


def course_audit(reports: list[dict[str, Any]], chapters: list[dict[str, Any]], issues: list[dict[str, Any]]) -> str:
    issues_by_formation: dict[str, list[dict[str, Any]]] = defaultdict(list)
    chapter_by_key = {(entry["course_id"], entry["chapter_id"]): entry for entry in chapters}
    for issue in issues:
        issues_by_formation[issue["formation_id"]].append(issue)
    out = ["# Audit détaillé par formation et par chapitre", "", "> Chaque constat ci-dessous est confirmé par lecture des sources de contenu et/ou du chemin de rendu. Les informations non exécutées sont distinguées dans le statut de vérification.", ""]
    for report in reports:
        formation_id = report["formation_id"]
        formation_issues = sorted(issues_by_formation.get(formation_id, []), key=lambda item: ({"P0": 0, "P1": 1, "P2": 2, "P3": 3}.get(item["severity"], 9), item["course_id"], item["chapter_id"], item["issue_id"]))
        formation_chapters = [chapter for chapter in chapters if chapter["formation_id"] == formation_id]
        sev = Counter(item["severity"] for item in formation_issues)
        mean_score = mean([item["score_100"] for item in formation_chapters if isinstance(item.get("score_100"), (int, float))]) if any(isinstance(item.get("score_100"), (int, float)) for item in formation_chapters) else None
        out += [f"## `{formation_id}`", "", f"**Couverture :** {len(report.get('courses', []))} cours · {len(formation_chapters)} écrans · score moyen vérifiable : {round(mean_score, 1) if mean_score is not None else 'non disponible'}/100 · P0 {sev['P0']} · P1 {sev['P1']} · P2 {sev['P2']} · P3 {sev['P3']}", "", f"> {md(report.get('formation_summary') or 'Synthèse détaillée dans les constats ci-dessous.')}", ""]
        if not formation_issues:
            out += ["**Aucun problème pédagogique étayé n’a été confirmé** dans le périmètre inspecté. Les dimensions non vérifiables sont documentées dans les rapports bruts.", ""]
            continue
        out += ["| ID | Cours / écran | Type | Gravité | Constat et conséquence | Preuve | Correction recommandée |", "|---|---|---|---|---|---|---|"]
        for issue in formation_issues:
            ch = chapter_by_key.get((issue["course_id"], issue["chapter_id"]), {})
            location = f"`{issue['course_id']}`<br>`{issue['chapter_id']}`<br>{md(ch.get('title'))}"
            out.append(f"| `{issue['issue_id']}` | {location} | `{issue['content_type']}` | **{issue['severity']}** | {md(issue['description'])} | {md(issue['evidence'])} | {md(issue['recommended_action'])} |")
        out.append("")
    return "\n".join(out)


def activities_audit(issues: list[dict[str, Any]]) -> str:
    activity_issues = [issue for issue in issues if issue["content_type"] in ACTIVITY_TYPES]
    activity_issues.sort(key=lambda item: ({"P0": 0, "P1": 1, "P2": 2, "P3": 3}.get(item["severity"], 9), item["course_id"], item["chapter_id"], item["issue_id"]))
    out = ["# Audit des activités interactives", "", f"> **{len(activity_issues)} constats liés à des activités**. Chaque ligne donne l’énoncé/contenu actuel observable, le défaut, une proposition utilisable lorsque les données le permettent et les compléments nécessaires.", "", "| ID | Cours / activité | Gravité | Énoncé ou contenu actuel | Problème | Énoncé / correction recommandée | Compléments nécessaires |", "|---|---|---|---|---|---|---|"]
    for issue in activity_issues:
        action = issue["proposed_content"] or issue["recommended_action"]
        out.append(f"| `{issue['issue_id']}` | `{issue['course_id']}`<br>`{issue['chapter_id']}`<br>`{issue['content_id']}` | **{issue['severity']}** | {md(issue['current_content'])} | {md(issue['description'])} | {md(action)} | Preuve : {md(issue['evidence'])}<br>Statut : `{issue['verification_status']}` |")
    return "\n".join(out)


def content_rewriting(issues: list[dict[str, Any]]) -> str:
    candidates = [issue for issue in issues if issue["severity"] in {"P0", "P1"} and issue.get("proposed_content") and not str(issue["proposed_content"]).lower().startswith("ne pas inventer")]
    candidates.sort(key=lambda item: (item["course_id"], item["chapter_id"], item["issue_id"]))
    out = ["# Propositions de réécriture et de restructuration pédagogique", "", "> Les propositions ci-dessous sont tirées uniquement des éléments réellement présents dans les cours. Lorsqu’une tâche ou un jeu de données n’est pas suffisamment défini, l’audit ne fabrique pas de contenu : il propose plutôt la donnée ou décision nécessaire.", ""]
    for issue in candidates:
        out += [f"## `{issue['issue_id']}` — {heading(issue['course_id'])} / {heading(issue['chapter_id'])}", "", f"**Constat :** {issue['description']}", "", "**Contenu actuel observable**", "", f"> {issue['current_content']}", "", "**Réécriture / correction directement exploitable**", "", issue["proposed_content"], "", "**Preuve et contrainte**", "", f"- Preuve : `{issue['evidence']}`", f"- Niveau de confiance : **{issue['confidence']}**", f"- Action finale : {issue['recommended_action']}", ""]
    if not candidates:
        out.append("Aucune réécriture fiable n’a été générée : les contenus ne permettaient pas de déterminer une tâche sans invention.")
    return "\n".join(out)


def ux_recommendations(issues: list[dict[str, Any]]) -> str:
    types = Counter(issue["content_type"] for issue in issues)
    return f"""# Recommandations UX et techniques

> Ces recommandations visent les causes structurelles qui expliquent plusieurs constats, plutôt qu’une correction isolée par écran.

| Priorité | Problème confirmé | Composants / données concernés | Correction proposée | Effort | Critères d’acceptation |
|---|---|---|---|---|---|
| P0 | Activité obligatoire absente, invisible ou non reliée à son exercice | `LessonViewer`, `ExerciseRenderer`, normalisation des checkpoints | Définir un contrat unique : un checkpoint doit avoir **soit** `exerciseId` valide, **soit** des questions directement rendues ; refuser le contenu à la publication lorsqu’aucun chemin de rendu n’existe. | M | Chaque checkpoint déclaré est visible, répondable, corrigé et son état est utilisé par le verrouillage. |
| P0 | Verrouillage incohérent entre média/activité et navigation | `LessonViewer`, `chapterProgress`, clés de complétion Projector/MP4/YouTube/IA/code | Centraliser la résolution des clés de complétion et couvrir tous les types requis ; rendre impossible un décalage entre la clé marquée complète et la clé vérifiée par Suivant. | L | Pour chaque type obligatoire, Suivant reste verrouillé avant réussite/visionnage et se déverrouille après ; reprise de session conservée. |
| P0 | Validation superficielle d’une réponse libre ou d’une preuve de TP | `CloudExerciseBlock`, services de correction, rubriques | Séparer « réponse saisie » de « activité réussie » ; appliquer une rubrique serveur, une longueur/structure minimale pertinente et une boucle de révision. | L | Une saisie d’un caractère ou une mauvaise réponse ne révèle pas la correction et ne déverrouille pas le chapitre. |
| P0 | Code présenté comme pratique sans exécution ni critère de résultat | `code_repl`, `terminal_sim`, activités Claude Code/API | Offrir un bac à sable contrôlé, ou requalifier en analyse guidée avec preuve manuelle/rubrique ; ne jamais comparer uniquement à une chaîne canonique. | XL | Plusieurs solutions valides passent, les erreurs donnent un feedback exploitable et la progression dépend de la réussite définie. |
| P1 | Ressource annoncée non fournie dans le TP | `cloud_exercise.resources`, médiathèque | Exiger que tout fichier explicitement nommé ait une ressource locale gérée ou une alternative clairement déclarée et indépendante d’un environnement source. | M | Chaque fichier cité est téléchargeable depuis l’écran ou remplacé par une table/donnée de substitution explicitement signalée. |
| P1 | Feedback, indice ou correction stockés mais non affichés | `MatchingExercise`, `OrderingBlock`, `CloudExerciseBlock`, renderers | Mapper systématiquement les propriétés de feedback vers le composant et afficher un retour après tentative ; distinguer réussite, erreur et remédiation. | M | Les champs `hint`, `feedback`, `explanation` et correction sont visibles au bon moment, testés par type de bloc. |
| P2 | Médias sans cadrage ni alternative adaptée à la langue | `YouTubePlayer`, `ProjectorPlayer`, métadonnées vidéo | Rendre obligatoires pour un média requis : objectif avant lecture, durée/langue, question ou synthèse après lecture et alternative textuelle localisée quand nécessaire. | M | Aucune vidéo requise ne peut être publiée sans objectif et stratégie d’accessibilité déclarés. |
| P2 | Localisation fragmentée dans des parcours français | champs i18n de blocs, assets VTT/transcriptions, rubriques | Ajouter un audit de parité des champs visibles et une liste de substitution assumée quand la ressource n’existe qu’en anglais. | M | Aucun texte visible non intentionnellement anglais dans une session FR ; les exceptions sont étiquetées. |
| P2 | Activités et écrans peu distingués visuellement | `LessonViewer`, badges de type, titres de blocs | Afficher de manière stable : **À apprendre**, **À regarder**, **À pratiquer**, **À valider**, puis l’objectif et l’état de complétion. | S | Un apprenant peut identifier le type d’écran, l’action attendue et la condition de passage sans lire le contenu intégral. |

## Éléments les plus touchés

| Type de contenu | Constats associés |
|---|---:|
{chr(10).join(f"| `{content_type}` | {count} |" for content_type, count in types.most_common(15))}

## Contrats de non-régression recommandés

1. **Contenu** : toute activité requise possède un énoncé, une action, un résultat attendu et un feedback possible.
2. **Rendu** : chaque type référencé par les JSON est rendu, sinon le pipeline échoue.
3. **Progression** : un test contractuel simule l’état incomplet puis complet pour chaque bloc obligatoire.
4. **Ressources** : tout nom de fichier cité dans un énoncé existe dans `resources` ou est explicitement déclaré indisponible avec alternative.
5. **Langues** : un parcours FR/EN/AR ne rend pas un champ vide ou un fallback non intentionnel dans une zone critique.
"""


def roadmap(summary: dict[str, Any]) -> str:
    sev = summary["issues"]["severity"]
    return f"""# Feuille de route de remédiation pédagogique

> Objectif : faire disparaître d’abord les **{sev['P0']} P0** puis les **{sev['P1']} P1**, sans altérer les progressions déjà enregistrées. Chaque lot doit être livré avec migration idempotente, test de parcours et contrôle de reprise.

| Lot | Actions | Priorité | Dépendances | Effort | Impact attendu |
|---|---|---|---|---|---|
| 1 — Parcours bloqués ou contournables | Réparer checkpoints invisibles, références `exerciseId` absentes, réponses erronées qui passent, clés de complétion média divergentes et activités obligatoires non rendues. | P0 | Inventaire des contrats de rendu et de progression | L | Le parcours ne bloque plus injustement et ne peut plus être contourné sans réaliser l’activité. |
| 2 — Évaluation réelle des TPs et du code | Remplacer les validations à un caractère / égalité textuelle par des rubriques, validations serveur, simulations ou modes preuve adaptés. | P0/P1 | Lot 1, décision par famille d’activité | XL | Les compétences évaluées deviennent mesurables ; le verrouillage retrouve une valeur pédagogique. |
| 3 — Ressources et environnement apprenant | Fournir les fichiers annoncés via la médiathèque, ajouter des alternatives, retirer/réécrire toute dépendance à un Desktop ou workspace source inaccessible. | P1 | Inventaire de médias/fichiers, gouvernance des droits | L | Les TPs deviennent réalisables de façon autonome dans Neopolis. |
| 4 — Feedback, consignes et progression | Rendre les feedbacks existants, compléter objectifs/action/résultat/critères, résoudre les consignes contradictoires et dédupliquer les séquences répétées. | P1/P2 | Lots 1–2 pour les activités concernées | L | Réduction des abandons et compréhension explicite de « quoi faire / comment réussir ». |
| 5 — Médias, langues et UX | Contextualiser les vidéos, compléter alternatives et localisation, corriger durées/libellés, améliorer la distinction théorie/pratique/validation. | P2/P3 | Politique de langues et accès aux assets | M | Accessibilité et cohérence d’expérience améliorées sans modifier les objectifs disciplinaires. |
| 6 — Recette apprenant et instrumentation | Exécuter un parcours E2E représentatif par famille de blocs, tester médias 20 s, téléchargements, reprise, desktop/tablette/mobile et mesurer les échecs. | Transversal | Lots 1–5 | L | Validation que les corrections observées dans les sources se traduisent en expérience réelle. |

## Ordre d’exécution recommandé

1. **Moteur transversal d’abord**, car une même correction de clé de complétion ou de renderer corrige de nombreuses formations.
2. **P0 par concentration de risque**, notamment les certifications Architect Foundations, les cours OpenAI/Claude Code, les cours de développement API et les formations comportant des checkpoints invisibles.
3. **Familles DataCamp/TP**, par mécanisme commun : ressources, code_repl, médias Projector, feedback de tri et validation de `cloud_exercise`.
4. **Revue éditoriale des propositions** avant réécriture : l’audit sépare explicitement les cas où une tâche fiable ne peut pas être inventée.
5. **Recette complète et ré-audit ciblé**, puis seulement publication.

## Règles de clôture par constat

- **P0** : le comportement bloquant/contournable est reproduit et corrigé dans un test ; l’activité est réalisable ou retirée explicitement.
- **P1** : la donnée ou l’UX manquante est corrigée, ou documentée comme exception vérifiée avec alternative apprenant.
- **P2/P3** : correction groupée par composant/locale quand possible, suivie d’un contrôle visuel et de non-régression.
"""


def main() -> None:
    reports, chapters, issues = load()
    metrics = source_activity_metrics()
    summary = build_summary(reports, chapters, issues, metrics)

    AUDIT.mkdir(exist_ok=True)
    write(AUDIT / "01-executive-summary.md", executive(summary))
    write(AUDIT / "02-courses-audit.md", course_audit(reports, chapters, issues))
    write(AUDIT / "03-activities-audit.md", activities_audit(issues))
    write(AUDIT / "04-content-rewriting.md", content_rewriting(issues))
    write(AUDIT / "05-ux-recommendations.md", ux_recommendations(issues))
    write(AUDIT / "06-remediation-roadmap.md", roadmap(summary))

    payload = {
        "summary": summary,
        "source_activity_metrics": metrics,
        "reports": reports,
        "chapters": chapters,
        "issues": issues,
    }
    (AUDIT / "07-audit-data.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output_directory": str(AUDIT),
        "reports": len(reports),
        "courses": summary["coverage"]["courses"],
        "chapters": summary["coverage"]["chapters"],
        "issues": summary["issues"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
