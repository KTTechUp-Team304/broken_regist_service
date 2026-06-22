# 취약점 설명서

이 문서는 실습 환경에 포함된 9개 취약점의 원리와 발생 원인을 설명합니다.  
공격 방법(페이로드)은 [answer-key.md](./answer-key.md)를 참고하세요.

---

## OWASP Top 10 분류

| # | 취약점명 | OWASP | 난이도 | 점수 |
|---|----------|-------|--------|------|
| 1 | SQLi 로그인 우회 | A07 | ★☆☆ | 200pt |
| 2 | 회원가입 admin role 주입 | A07 | ★☆☆ | 150pt |
| 3 | IDOR 사용자 정보 노출 | A01 | ★☆☆ | 200pt |
| 4 | BFLA 관리자 대시보드 무단 접근 | A01 | ★☆☆ | 100pt |
| 5 | SQLi 숨김 강의 열람 | A05 | ★★☆ | 300pt |
| 6 | IDOR 파일 경로 노출 | A01 | ★★☆ | 200pt |
| 7 | 정원 초과 수강신청 | A06 | ★☆☆ | 150pt |
| 8 | IDOR 타인 수강 취소 | A01 | ★★☆ | 200pt |
| 9 | BFLA 자기 권한 상승 | A01 | ★★☆ | 300pt |

---

## 1. SQLi 로그인 우회 (A07 — Injection)

**엔드포인트:** `POST /api/auth/login`

**발생 원인:**  
로그인 시 username을 SQL 쿼리에 직접 문자열로 삽입합니다. 입력값 검증이나 파라미터화된 쿼리 없이 원시 SQL을 실행하므로, 공격자가 SQL 구조를 조작할 수 있습니다.

```sql
-- 취약한 코드 (의도적)
SELECT * FROM users WHERE username = '[입력값]' AND password_hash = '...'

-- 공격 후 실행되는 쿼리
SELECT * FROM users WHERE username = 'admin' --' AND password_hash = '...'
-- AND 이하가 주석 처리되어 비밀번호 없이 로그인 성공
```

**영향:** 비밀번호 없이 임의 계정 로그인, 관리자 권한 탈취

---

## 2. 회원가입 admin role 주입 (A07 — Mass Assignment)

**엔드포인트:** `POST /api/auth/register`

**발생 원인:**  
회원가입 요청 body의 필드를 검증 없이 DB에 그대로 바인딩합니다. API 문서에 명시되지 않은 `role` 필드를 삽입해도 그대로 저장됩니다.

```json
// 정상 요청
{ "username": "홍길동", "password": "1234" }

// 공격 요청 — role 필드 추가
{ "username": "홍길동", "password": "1234", "role": "admin" }
```

**영향:** 일반 사용자가 관리자 권한으로 계정 생성 가능

---

## 3. IDOR 사용자 정보 노출 (A01 — Broken Access Control)

**엔드포인트:** `GET /api/users/:userId`

**발생 원인:**  
사용자 정보 조회 시 요청자가 해당 `userId`의 소유자인지 확인하지 않습니다. 누구나 임의의 userId로 타인의 정보를 조회할 수 있으며, `passwordHash`까지 응답에 포함됩니다.

**영향:** 전체 회원의 개인정보 및 암호화 해시 노출

---

## 4. BFLA 관리자 대시보드 무단 접근 (A01 — Broken Access Control)

**엔드포인트:** `GET /api/admin`

**발생 원인:**  
관리자 전용 엔드포인트에 인증·권한 검사 미들웨어가 적용되어 있지 않습니다. 토큰 없이 또는 일반 사용자 토큰으로도 관리자 통계 데이터를 열람할 수 있습니다.

**영향:** 전체 사용자 통계, 수강신청 현황 등 민감 정보 무단 열람

---

## 5. SQLi 숨김 강의 열람 (A05 — Security Misconfiguration / Injection)

**엔드포인트:** `GET /api/courses?category=`

**발생 원인:**  
강의 목록 조회 시 `category` 쿼리 파라미터를 SQL에 직접 삽입합니다. `is_visible = true` 조건이 있지만, SQL 인젝션으로 해당 조건을 무력화할 수 있습니다.

```sql
-- 정상 쿼리
SELECT * FROM courses WHERE category = '프로그래밍' AND is_visible = true

-- 공격 후 — is_visible 조건 우회
SELECT * FROM courses WHERE category = '' OR is_visible=false OR '1'='1' AND is_visible = true
```

**영향:** 비공개 처리된 숨김 강의 목록 노출

---

## 6. IDOR 파일 경로 노출 (A01 — Broken Access Control)

**엔드포인트:** `GET /api/courses/:courseId/files`

**발생 원인:**  
강의 파일 목록 조회 시 해당 강의를 수강 중인지, 강의가 공개 상태인지 확인하지 않습니다. 숨김 강의나 미수강 강의의 파일 경로(`storedPath`)까지 응답에 포함됩니다.

**영향:** 미수강 강의의 파일 서버 경로 노출, 무단 파일 접근 가능성

---

## 7. 정원 초과 수강신청 (A06 — Vulnerable Components / Business Logic)

**엔드포인트:** `POST /api/enrollments`

**발생 원인:**  
프론트엔드에서 정원이 초과된 강의의 수강신청 버튼을 비활성화하지만, 백엔드 API에서 정원 초과 여부를 재검증하지 않습니다. API를 직접 호출하면 정원 제한을 우회할 수 있습니다.

**원칙:** 클라이언트 측 검증은 UX를 위한 것이며 보안을 보장하지 않습니다.

**영향:** 정원이 초과된 강의에도 수강신청 가능

---

## 8. IDOR 타인 수강 취소 (A01 — Broken Access Control)

**엔드포인트:** `POST /api/enrollments/:id/cancel`

**발생 원인:**  
수강 취소 시 해당 enrollment가 요청자 본인의 것인지 확인하지 않습니다. 타인의 enrollment ID를 알고 있다면 해당 수강신청을 취소할 수 있습니다.

**영향:** 타인의 수강신청 무단 취소

---

## 9. BFLA 자기 권한 상승 (A01 — Broken Access Control)

**엔드포인트:** `POST /api/admin/users/:userId/role`

**발생 원인:**  
관리자 전용 권한 변경 API에 실제 권한 검사가 없습니다. 일반 사용자(student)가 자신의 `userId`로 이 API를 호출해 role을 `admin`으로 변경할 수 있습니다.

**영향:** 일반 사용자의 관리자 권한 탈취 (권한 상승 공격)
