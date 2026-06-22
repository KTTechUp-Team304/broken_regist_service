# 실습 가이드

## 실습 목표

이 환경은 **웹 취약점이 실제로 어떻게 이루어지는지 직접 체험**하기 위한 서비스입니다.

OWASP Top 10 기반의 취약점으로 구성되어 있으며, 웹 보안을 처음 접하는 초보자도 쉽게 시도할 수 있도록 낮은 난이도부터 단계적으로 구성했습니다.

**이 실습을 통해 배울 수 있는 것:**
- 웹 해킹이 실제로 어떤 방식으로 이루어지는지
- AI 바이브코딩으로 기능을 빠르게 구현할 때 각 기능에서 보안적으로 무엇을 고민해야 하는지
- 인증, 인가, 입력값 검증 등 기본적인 보안 원칙이 빠졌을 때 어떤 일이 발생하는지

각 취약점을 공격하면 API 응답에 `FLAG{...}` 값이 포함되며,  
브라우저 상단에 자동으로 팝업이 뜹니다. `/ctf` 페이지에서 제출하면 점수가 기록됩니다.

---

## 준비물

- **브라우저 개발자 도구 (F12)**
  - Network 탭: API 요청/응답 확인
  - Console 탭: fetch() 직접 실행
- **Swagger UI**: http://localhost:4000/api-docs
  - 전체 API 목록과 요청 형식 확인

---

## 기본 사용법

### 브라우저 콘솔에서 API 직접 호출

```javascript
// GET 요청
const res = await fetch('/api/admin');
const data = await res.json();
console.log(data);

// POST 요청 (인증 없이)
const res = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'test' })
});
const data = await res.json();
console.log(data);
```

> **Note:** 프론트엔드 UI를 통한 요청은 `/api/...`로 프록시되며,  
> 백엔드를 직접 호출할 때는 `http://localhost:4000/api/...`를 사용합니다.

### 로그인 후 인증 토큰 사용

로그인 성공 시 `accessToken`이 응답에 포함됩니다. 인증이 필요한 API 호출 시 아래와 같이 사용합니다.

```javascript
// 로그인
const loginRes = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'student1', password: 'password123' })
});
const { accessToken } = await loginRes.json();

// 인증이 필요한 API 호출
const res = await fetch('http://localhost:4000/api/users/1', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
console.log(await res.json());
```

또는 이미 로그인된 경우 브라우저 localStorage에서 토큰을 가져올 수 있습니다.

```javascript
const token = localStorage.getItem('accessToken');
```

---

## 실습 순서 (권장)

### ★☆☆ 난이도 1 — 먼저 시작하세요

**#4 BFLA 관리자 대시보드** — 가장 쉬운 시작점
- 인증 없이 관리자 API를 바로 호출해보세요.

**#2 회원가입 admin role 주입** — Mass Assignment 체험
- 회원가입 UI는 username/password만 입력받지만, API body에 추가 필드를 넣어보세요.
- 프론트엔드 폼에서는 불가능하므로 콘솔에서 직접 API를 호출해야 합니다.

**#1 SQLi 로그인 우회** — SQL Injection 기초
- 로그인 UI에서 username 필드에 직접 SQL 구문을 입력해보세요.

**#3 IDOR 사용자 정보 노출**
- 로그인 후 URL의 userId를 변경하거나 API를 직접 호출해보세요.

**#7 정원 초과 수강신청**
- UI에서 정원이 꽉 찬 강의를 확인하고, 해당 강의 ID로 API를 직접 호출해보세요.

### ★★☆ 난이도 2 — 응용 단계

**#5 SQLi 숨김 강의 열람**
- 강의 목록 API의 `category` 파라미터에 SQL을 주입해보세요.

**#6 IDOR 파일 경로 노출**
- 수강하지 않은 강의의 courseId로 파일 목록 API를 직접 호출해보세요.

**#8 IDOR 타인 수강 취소**
- 다른 계정의 enrollment ID를 추측하거나 찾아서 취소 API를 호출해보세요.

**#9 BFLA 자기 권한 상승**
- 일반 계정으로 로그인 후 권한 변경 API를 직접 호출해보세요.

---

## FLAG 제출 방법

1. 취약점 공격 성공 시 브라우저 상단에 팝업이 자동으로 표시됩니다.
2. 또는 API 응답의 `_debug_trace.flag` 필드에서 FLAG 값을 확인합니다.
3. `/ctf` 페이지에서 FLAG 값을 입력하고 제출합니다.

```json
// 응답 예시 — _debug_trace.flag에 FLAG가 포함됨
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "_debug_trace": {
    "query_override": true,
    "flag": "FLAG{sqli_login_bypass_admin}"
  }
}
```

---

## 테스트 계정

| username | password | role |
|----------|----------|------|
| admin | password123 | admin |
| student1 | password123 | student |
| student2 | password123 | student |
| student3 | password123 | student |

> 목 데이터는 `scripts/seed-mock-data.sql`에서 확인할 수 있습니다.
