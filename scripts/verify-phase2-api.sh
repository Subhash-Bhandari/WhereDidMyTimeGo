#!/usr/bin/env bash
# Phase 2 API smoke checks (T061/T064 helpers). Requires backend on :3001 and jq.
set -euo pipefail
BASE="${API_BASE:-http://localhost:3001}"
COOKIE_JAR="${TMPDIR:-/tmp}/wdmtg-phase2-$$.cookies"

cleanup() { rm -f "$COOKIE_JAR"; }
trap cleanup EXIT

register() {
  local email=$1 name=$2 pass=$3
  curl -sf -c "$COOKIE_JAR" -X POST "$BASE/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"name\":\"$name\",\"password\":\"$pass\"}" >/dev/null
}

echo "== Health =="
curl -sf "$BASE/api/health" | head -c 80
echo

echo "== User A: parse-entry =="
register "phase2-a-$$@test.local" "User A" "password12"
PARSE=$(curl -sf -b "$COOKIE_JAR" -X POST "$BASE/api/parse-entry" \
  -H 'Content-Type: application/json' \
  -d '{"text":"DSA 2h"}')
echo "$PARSE" | head -c 120
echo

echo "== User A: templates CRUD =="
curl -sf -b "$COOKIE_JAR" -X POST "$BASE/api/templates" \
  -H 'Content-Type: application/json' \
  -d '{"label":"Deep work","title":"Focus","durationMinutes":60}' >/dev/null
TID=$(curl -sf -b "$COOKIE_JAR" "$BASE/api/templates" | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)
curl -sf -b "$COOKIE_JAR" -X DELETE "$BASE/api/templates/$TID" -o /dev/null -w "delete:%{http_code}\n"

echo "== User A: insights + streak =="
curl -sf -b "$COOKIE_JAR" "$BASE/api/analytics/insights?timezone=UTC&from=2026-01-01&to=2026-12-31" | head -c 80
echo
curl -sf -b "$COOKIE_JAR" "$BASE/api/reflections/streak?timezone=UTC" | head -c 80
echo

echo "== User B: cannot delete A template =="
register "phase2-b-$$@test.local" "User B" "password12"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" -X DELETE "$BASE/api/templates/${TID:-99999}")
echo "foreign delete HTTP $CODE (expect 404)"

echo "Done."
