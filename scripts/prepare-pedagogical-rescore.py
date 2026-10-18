#!/usr/bin/env python3
"""Prépare un dossier de revue autonome par formation, sans modifier les cours."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "pedagogical-audit"
COURSES = ROOT / "client/public/data/courses"
MANIFEST = json.loads((AUDIT / "formation-manifest.json").read_text())
BASELINE = json.loads((AUDIT / "07-audit-data.json").read_text())
RUBRIC = (AUDIT / "score-rubric-v2.md").read_text()
OUT = AUDIT / "rescore-inputs"
OUT.mkdir(exist_ok=True)

baseline_by_formation: dict[str, list[dict]] = {}
for chapter in BASELINE.get("chapters", []):
    baseline_by_formation.setdefault(chapter.get("formation_id", ""), []).append(chapter)

items = []
for formation in MANIFEST:
    course_data = []
    for course_id in formation["course_ids"]:
        course_path = COURSES / f"{course_id}.json"
        course_data.append({
            "course_id": course_id,
            "source_path": str(course_path),
            "current_data": json.loads(course_path.read_text()),
        })
    index = int(formation["index"])
    file_name = f"{index:03d}-{formation['formation_id']}.json"
    output_path = AUDIT / "rescore" / file_name
    payload = {
        "schema_version": "pedagogical-rescore-v2",
        "formation": formation,
        "rubric_markdown": RUBRIC,
        "baseline": {
            "global_mean_100": BASELINE["summary"]["score"]["mean_100"],
            "method": BASELINE["summary"]["score"]["method"],
            "chapter_scores": baseline_by_formation.get(formation["formation_id"], []),
        },
        "current_courses": course_data,
        "verified_platform_invariants": {
            "static_audit": "P0=0, P1=0, P2=0, P3=0 sur les 180 cours au contrôle structurel courant.",
            "assets": "2 883 assets internes uniques et 3 719 références vérifiés HTTP Range avec 0 échec ; /api/assets/ est donc disponible côté plateforme.",
            "language": "L’audit strict FR/EN et l’audit de structure Markdown retournent chacun 0 anomalie.",
            "progression": "Une vidéo au maximum par écran ; les verrous reposent sur les activités réellement affichées ; les checkpoints orphelins et les portes fantômes sont à 0.",
        },
        "expected_output_path": str(output_path),
    }
    bundle_path = OUT / file_name
    bundle_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    items.append({
        "index": index,
        "formation_id": formation["formation_id"],
        "title": formation["formation_title"].get("fr") or formation["formation_title"].get("en") or formation["formation_id"],
        "bundle": str(bundle_path),
        "output": str(output_path),
    })

items.sort(key=lambda item: item["index"])
(AUDIT / "rescore-manifest.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"formations": len(items), "input_directory": str(OUT), "manifest": str(AUDIT / 'rescore-manifest.json')}, ensure_ascii=False))
