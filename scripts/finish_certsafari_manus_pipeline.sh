#!/usr/bin/env bash
# Resume bilingual generation safely. Source and all progress remain outside the web project.
set -u
cd "$(dirname "$0")/.." || exit 1
root=/home/ubuntu/anthropic-mock-exam-work
mkdir -p "$root"
: > "$root/manus-generated-translations-results.txt"
for cert in developer_foundations associate_foundations architect_foundations architect_professional; do
  (
    elapsed=0
    while true; do
      status="$root/manus-four-generation-results.txt"
      if [ "$cert" = architect_foundations ] && [ -f "$root/architect-scenarios-result.txt" ] && grep -Eq '^exit=[^0]' "$root/architect-scenarios-result.txt"; then
        echo "$cert scenarios failed" >> "$root/manus-generated-translations-results.txt"
        exit 1
      fi
      if [ "$cert" = architect_professional ] && [ -f "$root/architect-professional-partner-fr-result.txt" ] && grep -Eq '^exit=[^0]' "$root/architect-professional-partner-fr-result.txt"; then
        echo "$cert partner translation failed" >> "$root/manus-generated-translations-results.txt"
        exit 1
      fi
      if [ -f "$status" ] && grep -qx "$cert exit=0" "$status"; then
        if { [ "$cert" != architect_foundations ] || { [ -f "$root/architect-scenarios-result.txt" ] && grep -qx 'exit=0' "$root/architect-scenarios-result.txt"; }; } &&
           { [ "$cert" != architect_professional ] || { [ -f "$root/architect-professional-partner-fr-result.txt" ] && grep -qx 'exit=0' "$root/architect-professional-partner-fr-result.txt"; }; }; then break; fi
      fi
      if [ -f "$status" ] && grep -Eq "^$cert exit=[^0]" "$status"; then
        echo "$cert generation failed" >> "$root/manus-generated-translations-results.txt"
        exit 1
      fi
      if [ "$elapsed" -ge 7200 ]; then
        echo "$cert generation timed out after ${elapsed}s" >> "$root/manus-generated-translations-results.txt"
        exit 1
      fi
      sleep 30
      elapsed=$((elapsed+30))
    done
    python3 scripts/merge_certsafari_anthropic_banks.py stage --cert "$cert" > "$root/$cert.manus-stage.log" 2>&1 || {
      echo "$cert staging failed" >> "$root/manus-generated-translations-results.txt"
      exit 1
    }
    CERTSAFARI_LLM_PROVIDER=manus python3 scripts/build_certsafari_anthropic_claude.py translate --cert "$cert" --source generated --workers 2 > "$root/$cert.manus-generated-translation.log" 2>&1
    code=$?
    echo "$cert generated-translation exit=$code" >> "$root/manus-generated-translations-results.txt"
    exit "$code"
  ) &
done
while jobs -rp | grep -q .; do
  sleep 60
  printf 'Generated French progress: '
  for cert in developer_foundations associate_foundations architect_foundations architect_professional; do
    printf '%s:%s ' "$cert" "$(grep -c '^PROGRESS' "$root/$cert.manus-generated-translation.log" 2>/dev/null || true)"
  done
  echo
done
wait
cat "$root/manus-generated-translations-results.txt"
if grep -qE 'failed|timed out|exit=[^0]' "$root/manus-generated-translations-results.txt"; then exit 1; fi
