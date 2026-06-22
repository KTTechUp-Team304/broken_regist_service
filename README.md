# Broken Registration — 웹 취약점 실습 환경

수강신청 시스템을 컨셉으로 한 **의도적 취약 웹 애플리케이션**입니다.  
OWASP Top 10 기반의 취약점을 직접 공격하고, CTF 방식으로 FLAG를 획득하며 학습합니다.

> **주의:** 교육 목적으로 의도적으로 취약하게 설계되어 있습니다. 인터넷에 공개된 환경에 절대 배포하지 마세요.

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                     브라우저 (localhost:3000)             │
│                                                          │
│   Next.js Frontend          NestJS Backend               │
│   ┌──────────────┐          ┌──────────────────┐         │
│   │  수강신청 UI  │ ──API──▶ │  의도적 취약 API  │         │
│   │  CTF 진행    │◀──응답── │  (SQLi, IDOR,    │         │
│   └──────────────┘          │   BFLA, Mass     │         │
│        :3000                │   Assignment)    │         │
│                             └────────┬─────────┘         │
│                                      │ :4000             │
│                             ┌────────▼─────────┐         │
│                             │    PostgreSQL     │         │
│                             │  (users, courses, │        │
│                             │   enrollments,    │        │
│                             │   ctf_flags)      │        │
│                             └──────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

| 서비스 | 포트 | 설명 |
|--------|------|------|
| 프론트엔드 | 3000 | Next.js — 수강신청 UI + CTF 진행 현황 |
| 백엔드 API | 4000 | NestJS — 의도적 취약 REST API |
| Swagger | 4000/api-docs | API 문서 |
| PostgreSQL | 5432 | 로컬 DB |

**의도적으로 취약하게 설계된 부분:**
- SQL 쿼리 문자열 직접 결합 (SQLi)
- 소유권 확인 없는 리소스 조회/수정 (IDOR)
- 인증·권한 검사 없는 관리자 API (BFLA)
- 요청 body 필드 무검증 바인딩 (Mass Assignment)
- 클라이언트 측 유효성 검사만 존재 (비즈니스 로직 우회)

---

## 빠른 시작

```bash
# 1. 의존성 설치 (최초 1회)
npm install

# 2. DB + BE + FE 한 번에 실행
npm run dev
```

자세한 설치 방법 → [docs/setup-guide.md](./docs/setup-guide.md)

## CTF 취약점 목록

| # | 취약점 | OWASP | 난이도 | 점수 |
|---|--------|-------|--------|------|
| 1 | SQLi 로그인 우회 | A07 | ★☆☆ | 200pt |
| 2 | 회원가입 admin role 주입 | A07 | ★☆☆ | 150pt |
| 3 | IDOR 사용자 정보 노출 | A01 | ★☆☆ | 200pt |
| 4 | BFLA 관리자 대시보드 무단 접근 | A01 | ★☆☆ | 100pt |
| 5 | SQLi 숨김 강의 열람 | A05 | ★★☆ | 300pt |
| 6 | IDOR 파일 경로 노출 | A01 | ★★☆ | 200pt |
| 7 | 정원 초과 수강신청 (비즈니스 로직) | A06 | ★☆☆ | 150pt |
| 8 | IDOR 타인 수강 취소 | A01 | ★★☆ | 200pt |
| 9 | BFLA 자기 권한 상승 (student → admin) | A01 | ★★☆ | 300pt |

취약점 상세 설명 → [docs/vulnerabilities.md](./docs/vulnerabilities.md)  
실습 방법 → [docs/practice-guide.md](./docs/practice-guide.md)  
정답 및 페이로드 → [docs/answer-key.md](./docs/answer-key.md)

---

## 프로젝트 구조

```
web/
├── apps/
│   ├── backend/      # NestJS 11 — 의도적 취약 API
│   └── frontend/     # Next.js 15 — 수강신청 UI + CTF 페이지
├── docs/             # 실습 문서
├── scripts/          # DB 초기화 스크립트
├── docker-compose.yml
└── package.json
```
