#!/usr/bin/env bash
# Leap.ai payments dry-run harness
#
# Walks the full payment flow against a deployed backend WITHOUT risking real
# money, then reports readiness for arming live payments.
#
#   ./scripts/payments-dryrun.sh            # against the deployed backend
#   ./scripts/payments-dryrun.sh --local    # against a local backend
#   ./scripts/payments-dryrun.sh --keep     # keep the scratch user (default: cleanup)
#   BACKEND_BASE=https://... ./scripts/payments-dryrun.sh
#
# What it proves (the verify/entitlement matrix):
#   signup → status → me (not pro) → verify roadmap-report (NOT pro)
#   → verify pro-monthly (PRO) → verify pro-annual (PRO) → cleanup
# In sandbox/live modes it additionally verifies that a bogus reference FAILS.
#
# The scratch user is deleted from the database at the end (unless --keep).
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
ROOT="$(pwd)"

# --- config -----------------------------------------------------------------
MODE_FLAG=""
KEEP=0
for arg in "$@"; do
  case "$arg" in
    --local) MODE_FLAG="--local" ;;
    --keep) KEEP=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [ -n "$MODE_FLAG" ]; then
  BACKEND_BASE="${BACKEND_BASE:-http://localhost:18080}"
else
  BACKEND_BASE="${BACKEND_BASE:-https://leap-ai-backend.onrender.com}"
fi

# Load DB creds for cleanup (root .env). Values are masked if absent.
if [ -f "$ROOT/.env" ]; then
  set -a; source "$ROOT/.env"; set +a
fi

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ $1"; }
check() { # check <desc> <expected> <actual>
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (expected '$2', got '$3')"; fi
}

# --- helpers ----------------------------------------------------------------
json_field() { # json_field <json> <field>  → prints bare value (string or bool)
  echo "$1" | grep -oE "\"$2\"(: ?\"[^\"]*\"|: ?[a-z0-9]+)" | head -1 \
    | sed -E 's/^[^:]*: ?"?//; s/"$//'
}

signup_user() { # signup_user → prints token
  local email="dryrun-$(date +%s)-$$@leap.test"
  local resp
  resp=$(curl -s -m 90 -X POST "$BACKEND_BASE/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"fullName\":\"Dry Run\",\"email\":\"$email\",\"password\":\"DryRun-Pass-1\"}")
  if echo "$resp" | grep -q '"token"'; then
    echo "$email" > /tmp/leap-dryrun-email
    json_field "$resp" "token"
  else
    echo ""
  fi
}

verify_plan() { # verify_plan <token> <plan> <reference> → prints verify JSON
  curl -s -m 60 -X POST "$BACKEND_BASE/api/payments/verify" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $1" \
    -d "{\"reference\":\"$3\",\"plan\":\"$2\"}"
}

cleanup() {
  [ "$KEEP" = "1" ] && return 0
  local email db_url host port db user
  email="$(cat /tmp/leap-dryrun-email 2>/dev/null || echo '')"
  [ -z "$email" ] && return 0
  db_url="$(echo "$SPRING_DATASOURCE_URL" | sed -E 's#jdbc:postgresql://([^:/]+):([0-9]+)/(.*)#postgresql://\1:\2/\3#')"
  host="$(echo "$db_url" | sed -E 's#postgresql://([^:/]+):([0-9]+)/.*#\1#')"
  port="$(echo "$db_url" | sed -E 's#postgresql://[^:/]+:([0-9]+)/.*#\1#')"
  db="$(echo "$db_url" | sed -E 's#postgresql://[^/]+/(.*)#\1#')"
  # Supabase pooler requires the tenant-qualified username (postgres.<ref>).
  user="${SPRING_DATASOURCE_USERNAME:-postgres}"
  PGPASSWORD="${SPRING_DATASOURCE_PASSWORD:-}" psql -h "$host" -p "$port" -U "$user" -d "$db" \
    -v ON_ERROR_STOP=0 -q -c "
BEGIN;
DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id IN (SELECT id FROM users WHERE email='$email'));
DELETE FROM user_resources WHERE user_id IN (SELECT id FROM users WHERE email='$email');
DELETE FROM goals WHERE user_id IN (SELECT id FROM users WHERE email='$email');
DELETE FROM roadmaps WHERE user_id IN (SELECT id FROM users WHERE email='$email');
DELETE FROM conversations WHERE user_id IN (SELECT id FROM users WHERE email='$email');
DELETE FROM users WHERE email='$email';
COMMIT;" >/dev/null 2>&1 && echo "  ✓ scratch user deleted" || echo "  (note: could not clean up '$email' — delete manually)"
  rm -f /tmp/leap-dryrun-email
}

# --- 1. readiness -----------------------------------------------------------
echo "============================================================"
echo " Leap.ai payments dry-run  —  $BACKEND_BASE"
echo "============================================================"
READY="$(curl -s -m 60 "$BACKEND_BASE/api/payments/readiness" || echo '{}')"
echo ""
echo "-- Readiness ---------------------------------------------------"
echo "  mode:            $(json_field "$READY" "mode")"
echo "  armed:           $(json_field "$READY" "armed")"
echo "  key kind:        $(json_field "$READY" "keyKind")"
echo "  public key:      $(json_field "$READY" "publicKeyPrefix")"
echo "  secret key:      $(json_field "$READY" "secretKeyPrefix")"
echo "  warnings:"
echo "$READY" | grep -oE '"warnings":\[[^]]*\]' | sed -E 's/"warnings":\[//; s/\]//; s/,/\n/g' | sed -E 's/^ */  - /'
echo ""

# --- 2. signup + baseline ---------------------------------------------------
echo "-- Flow ---------------------------------------------------------"
echo "  1. signup scratch user …"
TOKEN="$(signup_user)"
[ -z "$TOKEN" ] && { echo "  ✗ signup failed (backend down? cold start?)"; exit 1; }
echo "  ✓ signed up"

echo "  2. /payments/me (baseline, expect not pro) …"
ME="$(curl -s -m 60 "$BACKEND_BASE/api/payments/me" -H "Authorization: Bearer $TOKEN")"
check "baseline pro=false" "false" "$(json_field "$ME" "pro")"

# --- 3. entitlement matrix ---------------------------------------------------
echo "  3. verify roadmap-report (expect verified, NOT pro) …"
V="$(verify_plan "$TOKEN" "roadmap-report" "dryrun-report-$(date +%s)")"
check "verified=true"  "true"  "$(json_field "$V" "verified")"
check "pro=false"      "false" "$(json_field "$V" "pro")"

echo "  4. verify pro-monthly (expect verified, PRO) …"
V="$(verify_plan "$TOKEN" "pro-monthly" "dryrun-monthly-$(date +%s)")"
check "verified=true"  "true"  "$(json_field "$V" "verified")"
check "pro=true"       "true"  "$(json_field "$V" "pro")"

echo "  5. verify pro-annual (expect verified, PRO) …"
V="$(verify_plan "$TOKEN" "pro-annual" "dryrun-annual-$(date +%s)")"
check "verified=true"  "true"  "$(json_field "$V" "verified")"
check "pro=true"       "true"  "$(json_field "$V" "pro")"

echo "  6. /payments/me after grants (expect pro=true) …"
ME="$(curl -s -m 60 "$BACKEND_BASE/api/payments/me" -H "Authorization: Bearer $TOKEN")"
check "me pro=true" "true" "$(json_field "$ME" "pro")"

# --- 4. negative test (only meaningful against real Paystack) ------------------
MODE="$(json_field "$READY" "mode")"
if [ "$MODE" = "sandbox" ] || [ "$MODE" = "live" ]; then
  echo "  7. verify bogus reference (expect verified=false) …"
  V="$(verify_plan "$TOKEN" "pro-monthly" "dryrun-BOGUS-reference")"
  check "verified=false" "false" "$(json_field "$V" "verified")"
else
  echo "  7. bogus-reference negative test skipped (mode=$MODE — simulation accepts any reference by design; sandbox/live reject unknown ones)"
fi

# --- 5. summary ---------------------------------------------------------------
echo ""
echo "-- Result --------------------------------------------------------"
echo "  passed: $PASS   failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "  ✗ DRY RUN FAILED — do NOT arm live payments until this passes."
  cleanup
  exit 1
fi
echo "  ✓ entitlement matrix green."
MODE_LABEL="$MODE"
case "$MODE" in
  off) MODE_LABEL="off (gated). To dry-run: set PAYMENTS_MODE=simulate; to test Paystack: set sandbox + test keys; to go live: set live + live keys." ;;
  simulate) MODE_LABEL="simulate — safe to test further. Next: set sandbox with test keys for a real Paystack dry run, then live." ;;
  sandbox) MODE_LABEL="sandbox — real Paystack, test money. Next: swap in live keys and set live for real revenue." ;;
  live) MODE_LABEL="LIVE — real money armed and flowing. Verify every charge; refunds need human approval." ;;
esac
echo "  current mode: $MODE_LABEL"
echo ""
echo "  The key-kind guard is the safety rail: mode=live + test keys (or mode=sandbox"
echo "  + live keys) refuses to arm, so a misconfigured flag can never move real money."
cleanup
exit 0
