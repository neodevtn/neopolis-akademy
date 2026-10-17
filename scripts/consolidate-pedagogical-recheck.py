#!/usr/bin/env python3
"""Consolide les rapports de contre-revue qualitative sans modifier les cours."""
from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "pedagogical-audit"
MANIFEST = json.loads((AUDIT / "formation-manifest.json").read_text())
RECHECK = AUDIT / "recheck"


def read_report(index: int) -> tuple[Path | None, dict | None, str | None]:
    candidates = sorted(RECHECK.glob(f"{index:03d}-*.json"))
    if len(candidates) != 1:
        return None, None, f"expected exactly one report, found {len(candidates)}"
    try:
        report = json.loads(candidates[0].read_text())
    except Exception as exc:  # JSON diagnostics must be included, never hidden.
        return candidates[0], None, f"invalid JSON: {exc}"
    return candidates[0], report, None


rows: list[dict] = []
qa_errors: list[dict] = []
total_statuses: Counter[str] = Counter()
total_severities: Counter[str] = Counter()
legacy_open_total = 0
for item in MANIFEST:
    index = int(item["index"])
    report_path, report, error = read_report(index)
    if error or not isinstance(report, dict):
        qa_errors.append({"index": index, "formation_id": item["formation_id"], "error": error})
        continue
    # The first 29 counter-reviews predate the normalized finding schema.  They
    # are still completed current-state reviews and carry an explicit
    # ``stillOpen`` count, so retain them rather than falsely calling them
    # missing reviews.  Their severities cannot be safely reconstructed from
    # prose, and are reported separately as unclassified legacy findings.
    if report.get("formationId") == item["formation_id"] and isinstance(report.get("stillOpen"), int):
        legacy_open_total += report["stillOpen"]
        rows.append({
            "index": index,
            "formation_id": item["formation_id"],
            "formation_title": item["formation_title"],
            "course_ids": item["course_ids"],
            "report_path": str(report_path),
            "open_total": report["stillOpen"],
            "open_p0": 0,
            "open_p1": 0,
            "open_p2": 0,
            "open_p3": 0,
            "open_unclassified_legacy": report["stillOpen"],
            "status_counts": {
                "open": report["stillOpen"],
                "resolved_with_evidence": report.get("resolvedWithEvidence", 0),
                "documented_removal": report.get("documentedRemoval", 0),
                "externally_unverifiable": report.get("externallyUnverifiable", 0),
            },
            "reported_summary": {"legacy": True, "initialIssueCount": report.get("initialIssueCount")},
        })
        total_statuses["open"] += report["stillOpen"]
        continue

    required = ["formation_id", "index", "course_ids", "reviewed_current_state", "findings"]
    missing = [key for key in required if key not in report]
    if missing:
        qa_errors.append({"index": index, "formation_id": item["formation_id"], "error": f"missing required fields: {', '.join(missing)}"})
        continue
    if report["formation_id"] != item["formation_id"] or int(report["index"]) != index:
        qa_errors.append({"index": index, "formation_id": item["formation_id"], "error": "report identity does not match manifest"})
        continue
    if report["reviewed_current_state"] is not True or not isinstance(report["findings"], list):
        qa_errors.append({"index": index, "formation_id": item["formation_id"], "error": "report is not an explicit current-state review"})
        continue

    findings = report["findings"]
    bad_findings = []
    open_severity: Counter[str] = Counter()
    status_counts: Counter[str] = Counter()
    for finding_index, finding in enumerate(findings):
        if not isinstance(finding, dict):
            bad_findings.append(finding_index)
            continue
        severity = str(finding.get("severity", "")).upper()
        status = str(finding.get("status", "")).lower()
        if severity not in {"P0", "P1", "P2", "P3"} or status not in {"open", "fixed", "false_positive"}:
            bad_findings.append(finding_index)
            continue
        status_counts[status] += 1
        total_statuses[status] += 1
        if status == "open":
            open_severity[severity] += 1
            total_severities[severity] += 1
    if bad_findings:
        qa_errors.append({"index": index, "formation_id": item["formation_id"], "error": f"invalid finding shape at indexes {bad_findings}"})
        continue

    rows.append({
        "index": index,
        "formation_id": item["formation_id"],
        "formation_title": item["formation_title"],
        "course_ids": item["course_ids"],
        "report_path": str(report_path),
        "open_total": sum(open_severity.values()),
        "open_p0": open_severity["P0"],
        "open_p1": open_severity["P1"],
        "open_p2": open_severity["P2"],
        "open_p3": open_severity["P3"],
        "open_unclassified_legacy": 0,
        "status_counts": dict(status_counts),
        "reported_summary": report.get("summary"),
    })

rows.sort(key=lambda row: (-row["open_p0"], -row["open_p1"], -row["open_p2"], row["index"]))
summary = {
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "scope": "116 formations : 29 contre-revues initiales + 87 contre-revues terminées en lecture seule",
    "formation_count": len(MANIFEST),
    "valid_report_count": len(rows),
    "qa_error_count": len(qa_errors),
    "open_findings": {severity: total_severities[severity] for severity in ["P0", "P1", "P2", "P3"]},
    "open_findings_legacy_unclassified": legacy_open_total,
    "all_statuses": dict(total_statuses),
    "top_open_p0": rows[:20],
    "formations": rows,
    "qa_errors": qa_errors,
}
(AUDIT / "09-qualitative-recheck-final.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")

lines = [
    "# Contre-revue pédagogique qualitative — consolidation finale",
    "",
    f"- Formations attendues : **{len(MANIFEST)}**",
    f"- Rapports valides : **{len(rows)}**",
    f"- Rapports à corriger : **{len(qa_errors)}**",
    f"- Constats ouverts normalisés : **P0 {total_severities['P0']}**, **P1 {total_severities['P1']}**, **P2 {total_severities['P2']}**, **P3 {total_severities['P3']}**",
    f"- Constats ouverts historiques, sans sévérité reconstruisible de manière fiable : **{legacy_open_total}**",
    "",
    "Les comptes normalisés sont recalculés à partir des constats `status: open`, et non repris des résumés individuels. Les 29 rapports historiques conservent leur total `stillOpen` séparément : leurs phrases ne permettent pas de reconstituer les sévérités sans les inventer.",
    "",
    "## Priorités de correction (P0 puis P1)",
    "",
    "| Rang | Formation | P0 ouverts | P1 ouverts | P2 ouverts | Rapport |",
    "|---:|---|---:|---:|---:|---|",
]
for rank, row in enumerate(rows[:30], start=1):
    title = row["formation_title"].get("fr") or row["formation_title"].get("en") or row["formation_id"]
    lines.append(f"| {rank} | {title} | {row['open_p0']} | {row['open_p1']} | {row['open_p2']} | `{Path(row['report_path']).name}` |")
if qa_errors:
    lines.extend(["", "## Rapports à reprendre", ""])
    for error in qa_errors:
        lines.append(f"- `{error['index']:03d}` {error['formation_id']} : {error['error']}")
(AUDIT / "09-qualitative-recheck-final.md").write_text("\n".join(lines) + "\n")
print(json.dumps({"valid_reports": len(rows), "qa_errors": len(qa_errors), "open": dict(total_severities)}, ensure_ascii=False))
