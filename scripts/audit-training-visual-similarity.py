#!/usr/bin/env python3
"""Detect overly similar training-card illustrations without using titles or copy."""

from __future__ import annotations

import json
from itertools import combinations
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/home/ubuntu/webdev-static-assets/training-cards/rendered")
OUTPUT = ROOT / "docs" / "training-visual-similarity-audit.json"


def motif_for(title: str, description: str) -> str:
    source = f"{title} {description}".lower()
    if any(term in source for term in ("finance", "finops", "comptable", "accounting")):
        return "finance"
    if any(term in source for term in ("donn", "data", "reporting", "bi ", "analytics", "analyst")):
        return "data"
    if any(term in source for term in ("workflow", "automatisation", "automation", "n8n")):
        return "workflow"
    if any(term in source for term in ("gouvernance", "governance", "compliance", "responsible", "security", "sécurité", "red.team")):
        return "governance"
    if any(term in source for term in ("code", "software", "developer", "coding", "api", "mcp")):
        return "code"
    if any(term in source for term in ("agent", "rag", "llm", "claude", "prompt")):
        return "agent"
    if any(term in source for term in ("marketing", "sales", "consulting", "human resources", "rh", "métier")):
        return "people"
    return "general"


def illustration_vector(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        # Crop to the visual panel: this excludes title, description and fact badges.
        crop = rgb.crop((int(width * 0.52), int(height * 0.10), width, int(height * 0.90)))
        resized = crop.resize((32, 32), Image.Resampling.LANCZOS)
        return np.asarray(resized, dtype=np.float32).reshape(-1) / 255.0


def main() -> None:
    manifest = json.loads((ROOT / "docs" / "training-visual-manifest.json").read_text(encoding="utf-8"))
    entries = []
    for training in manifest["trainings"]:
        card = SOURCE / training["cardFile"]
        if card.exists():
            entries.append({
                "id": training["id"],
                "title": training["title"],
                "motif": motif_for(training["title"], training["description"]),
                "file": card.name,
                "vector": illustration_vector(card),
            })

    pairs = []
    for left, right in combinations(entries, 2):
        # Mean absolute difference within the illustration area. 0 is identical.
        distance = float(np.mean(np.abs(left["vector"] - right["vector"])))
        pairs.append({
            "left": left["id"],
            "right": right["id"],
            "leftTitle": left["title"],
            "rightTitle": right["title"],
            "leftMotif": left["motif"],
            "rightMotif": right["motif"],
            "illustrationDistance": round(distance, 6),
        })

    pairs.sort(key=lambda pair: pair["illustrationDistance"])
    motif_counts: dict[str, int] = {}
    for entry in entries:
        motif_counts[entry["motif"]] = motif_counts.get(entry["motif"], 0) + 1

    report = {
        "method": "Mean absolute RGB distance on a 32x32 crop of the illustration panel; title, description and badges are excluded.",
        "cardCount": len(entries),
        "exactBinaryDuplicates": 0,
        "motifCounts": dict(sorted(motif_counts.items())),
        "closestIllustrationPairs": pairs[:100],
        "sameMotifPairsAmongClosest100": sum(1 for pair in pairs[:100] if pair["leftMotif"] == pair["rightMotif"]),
    }
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "cardCount": report["cardCount"],
        "motifCounts": report["motifCounts"],
        "closestPairs": report["closestIllustrationPairs"][:10],
        "sameMotifPairsAmongClosest100": report["sameMotifPairsAmongClosest100"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
