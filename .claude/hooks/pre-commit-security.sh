#!/bin/bash
# =============================================================================
# Pre-Commit Security Hook for Kozbeyli Konağı
# Catches secrets, security issues, and code quality problems before commit
# =============================================================================

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "🔒 Running security checks..."

# ---------------------------------------------------------------------------
# 1. CHECK FOR STAGED .ENV FILES
# ---------------------------------------------------------------------------
ENV_FILES=$(git diff --cached --name-only | grep -E '\.env($|\.)' || true)
if [ -n "$ENV_FILES" ]; then
  echo -e "${RED}❌ BLOCKED: .env files staged for commit:${NC}"
  echo "$ENV_FILES"
  echo "   Remove with: git reset HEAD <file>"
  ERRORS=$((ERRORS + 1))
fi

# ---------------------------------------------------------------------------
# 2. CHECK FOR HARDCODED SECRETS/API KEYS
# ---------------------------------------------------------------------------
SECRET_PATTERNS=(
  'AKIA[0-9A-Z]{16}'                    # AWS Access Key
  'sk-[a-zA-Z0-9]{20,}'                 # OpenAI/Stripe secret key
  'sk-ant-[a-zA-Z0-9-]{20,}'            # Anthropic API key
  'ghp_[a-zA-Z0-9]{36}'                 # GitHub Personal Token
  'gho_[a-zA-Z0-9]{36}'                 # GitHub OAuth Token
  'xoxb-[0-9]{10,}-[a-zA-Z0-9]+'        # Slack Bot Token
  'xoxp-[0-9]{10,}-[a-zA-Z0-9]+'        # Slack User Token
  'password\s*[:=]\s*["\x27][^"\x27]{8,}'  # Hardcoded passwords
  'secret\s*[:=]\s*["\x27][^"\x27]{8,}'   # Hardcoded secrets
)

STAGED_DIFF=$(git diff --cached --diff-filter=ACMR -U0 -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' '*.yml' '*.yaml' 2>/dev/null || true)

for pattern in "${SECRET_PATTERNS[@]}"; do
  MATCHES=$(echo "$STAGED_DIFF" | grep -E "$pattern" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "${RED}❌ BLOCKED: Possible secret/API key detected:${NC}"
    echo "$MATCHES" | head -5
    ERRORS=$((ERRORS + 1))
  fi
done

# ---------------------------------------------------------------------------
# 3. CHECK FOR DANGEROUS PATTERNS IN STAGED FILES
# ---------------------------------------------------------------------------
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx' '*.js' '*.jsx' 2>/dev/null || true)

if [ -n "$STAGED_FILES" ]; then
  # Check for dangerouslySetInnerHTML without sanitization
  DANGEROUS_HTML=$(echo "$STAGED_DIFF" | grep -n 'dangerouslySetInnerHTML' 2>/dev/null || true)
  if [ -n "$DANGEROUS_HTML" ]; then
    echo -e "${YELLOW}⚠️  WARNING: dangerouslySetInnerHTML detected — ensure data is sanitized with DOMPurify${NC}"
    echo "$DANGEROUS_HTML" | head -3
    WARNINGS=$((WARNINGS + 1))
  fi

  # Check for 'any' type usage
  ANY_USAGE=$(echo "$STAGED_DIFF" | grep -E '^\+.*:\s*any\b|^\+.*as\s+any\b|^\+.*<any>' 2>/dev/null || true)
  if [ -n "$ANY_USAGE" ]; then
    echo -e "${YELLOW}⚠️  WARNING: 'any' type detected — use 'unknown' with type guards instead${NC}"
    echo "$ANY_USAGE" | head -5
    WARNINGS=$((WARNINGS + 1))
  fi

  # Check for ts-ignore without explanation
  TS_IGNORE=$(echo "$STAGED_DIFF" | grep -E '^\+.*@ts-ignore(?!\s+//)' 2>/dev/null || true)
  if [ -n "$TS_IGNORE" ]; then
    echo -e "${YELLOW}⚠️  WARNING: @ts-ignore without explanation${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi

  # Check for eval() usage
  EVAL_USAGE=$(echo "$STAGED_DIFF" | grep -E '^\+.*\beval\s*\(' 2>/dev/null || true)
  if [ -n "$EVAL_USAGE" ]; then
    echo -e "${RED}❌ BLOCKED: eval() usage detected — this is a security risk${NC}"
    ERRORS=$((ERRORS + 1))
  fi

  # Check for unsafe-eval in CSP
  UNSAFE_EVAL=$(echo "$STAGED_DIFF" | grep -E "^\+.*'unsafe-eval'" 2>/dev/null || true)
  if [ -n "$UNSAFE_EVAL" ]; then
    echo -e "${RED}❌ BLOCKED: 'unsafe-eval' added to CSP — this weakens security${NC}"
    ERRORS=$((ERRORS + 1))
  fi
fi

# ---------------------------------------------------------------------------
# 4. CHECK FOR LARGE FILES (>1MB)
# ---------------------------------------------------------------------------
LARGE_FILES=$(git diff --cached --name-only --diff-filter=ACMR | while read -r file; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file" 2>/dev/null || echo 0)
    if [ "$SIZE" -gt 1048576 ]; then
      echo "$file ($(( SIZE / 1024 ))KB)"
    fi
  fi
done)

if [ -n "$LARGE_FILES" ]; then
  echo -e "${YELLOW}⚠️  WARNING: Large files (>1MB) staged:${NC}"
  echo "$LARGE_FILES"
  WARNINGS=$((WARNINGS + 1))
fi

# ---------------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------------
echo ""
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}🚫 COMMIT BLOCKED: $ERRORS error(s) found. Fix issues above before committing.${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Review above before proceeding.${NC}"
  echo -e "${GREEN}✅ No blocking issues — commit allowed.${NC}"
  exit 0
else
  echo -e "${GREEN}✅ All security checks passed.${NC}"
  exit 0
fi
