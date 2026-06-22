#!/usr/bin/env bash
# PostgreSQL 로컬 기동 + DB/유저 초기화 스크립트
# Docker 없이 Homebrew 또는 Postgres.app 기반으로 동작합니다.

set -e

DB_USER="${DB_USERNAME:-broken_regist}"
DB_PASS="${DB_PASSWORD:-broken_regist_password}"
DB_NAME="${DB_DATABASE:-broken_regist}"

# ── 1. PostgreSQL 기동 ──────────────────────────────────────
start_postgres() {
  # Homebrew postgresql@16
  if command -v brew &>/dev/null && brew list postgresql@16 &>/dev/null 2>&1; then
    echo "[DB] Homebrew postgresql@16 기동..."
    brew services start postgresql@16 2>/dev/null || true
    sleep 1
    return 0
  fi

  # Homebrew postgresql (버전 미지정)
  if command -v brew &>/dev/null && brew list postgresql &>/dev/null 2>&1; then
    echo "[DB] Homebrew postgresql 기동..."
    brew services start postgresql 2>/dev/null || true
    sleep 1
    return 0
  fi

  # Postgres.app (PATH에 psql이 있으면 이미 실행 중)
  if command -v psql &>/dev/null; then
    echo "[DB] psql 발견 — PostgreSQL이 실행 중이라고 가정합니다."
    return 0
  fi

  echo ""
  echo "  PostgreSQL을 찾을 수 없습니다. 아래 중 하나로 설치 후 다시 실행하세요."
  echo ""
  echo "  ① Homebrew (권장)"
  echo "     brew install postgresql@16"
  echo "     brew services start postgresql@16"
  echo ""
  echo "  ② Postgres.app (GUI, 터미널 불필요)"
  echo "     https://postgresapp.com"
  echo ""
  exit 1
}

start_postgres

# ── 2. psql 접속 확인 (최대 10초 대기) ────────────────────
echo "[DB] PostgreSQL 응답 대기..."
for i in $(seq 1 10); do
  psql postgres -c '\q' &>/dev/null && break
  sleep 1
done

if ! psql postgres -c '\q' &>/dev/null; then
  echo "  PostgreSQL에 접속할 수 없습니다. 실행 상태를 확인하세요."
  exit 1
fi

# ── 3. 유저 생성 (없으면) ──────────────────────────────────
if ! psql postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" \
     2>/dev/null | grep -q 1; then
  echo "[DB] 유저 '${DB_USER}' 생성..."
  psql postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" &>/dev/null
fi

# ── 4. DB 생성 (없으면) ────────────────────────────────────
if ! psql postgres -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" \
     2>/dev/null | grep -q 1; then
  echo "[DB] 데이터베이스 '${DB_NAME}' 생성..."
  psql postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" &>/dev/null
fi

# ── 5. 시드 데이터 삽입 (users 테이블이 비어 있을 때만) ──────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED_FILE="${SCRIPT_DIR}/../apps/backend/docs/seed/seed-mock-data.sql"

USER_COUNT=$(psql -U "${DB_USER}" -d "${DB_NAME}" \
  -tc "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "${USER_COUNT}" = "0" ] && [ -f "${SEED_FILE}" ]; then
  echo "[DB] 시드 데이터 삽입 중..."
  psql -U "${DB_USER}" -d "${DB_NAME}" -f "${SEED_FILE}" &>/dev/null
  echo "[DB] 시드 완료"
fi

echo "[DB] 준비 완료 (${DB_USER}@localhost:5432/${DB_NAME})"
