# 세팅 가이드

## 사전 요구사항

| 도구       | 버전    | 확인 방법        |
| ---------- | ------- | ---------------- |
| Node.js    | 20 이상 | `node -v`        |
| npm        | 10 이상 | `npm -v`         |
| PostgreSQL | 14 이상 | `psql --version` |

---

## PostgreSQL 설치 (최초 1회)

로컬에 PostgreSQL이 없는 경우 Homebrew 혹은 [https://postgresapp.com](https://postgresapp.com) 에서 다운로드 후 실행합니다.

---

## 설치 및 실행

```bash
# 1. 루트디렉토리로 이동
cd web

# 2. 의존성 설치
npm install

# 3. DB 초기화 + BE + FE 전체 실행
npm run dev
```

`npm run dev` 실행 시 자동으로 처리되는 항목:

1. PostgreSQL 기동 상태 확인
2. `vuln_practice` 데이터베이스 및 유저 자동 생성
3. 테이블 생성 및 목 데이터 시딩
4. NestJS 백엔드 시작 (포트 4000)
5. Next.js 프론트엔드 시작 (포트 3000)

### 접속 주소

| 서비스       | URL                            |
| ------------ | ------------------------------ |
| 프론트엔드   | http://localhost:3000          |
| 백엔드 API   | http://localhost:4000/api      |
| Swagger 문서 | http://localhost:4000/api-docs |

---

## 개별 실행

```bash
npm run db:start       # DB만 (PostgreSQL 기동 + 초기화)
npm run dev:backend    # NestJS만
npm run dev:frontend   # Next.js만
```

---

## 자주 발생하는 문제

### PostgreSQL 연결 오류 (ECONNREFUSED)

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

PostgreSQL이 실행 중인지 확인합니다.

```bash
# Homebrew
brew services start postgresql@16

# Postgres.app
# 메뉴바 아이콘 → Start 클릭
```

### DB 포트 불일치

`apps/backend/.env`의 `DB_PORT` 값이 실제 PostgreSQL 포트와 다를 수 있습니다.  
로컬 PostgreSQL 기본 포트는 `5432`입니다.

```env
DB_PORT=5432
```

### 목 데이터가 없는 경우

```bash
npm run db:start
```

위 명령으로 DB를 다시 초기화하면 목 데이터가 자동으로 삽입됩니다.
