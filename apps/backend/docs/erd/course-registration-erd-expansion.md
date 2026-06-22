# Course Registration ERD Expansion Plan

이 문서는 수강신청 기반 취약점 학습 서버의 2차 확장 후보를 정리한다.

1차 구현은 실제 학사 시스템이 아니라 취약점 실습용 가짜 사이트를 전제로 한다. 그래서 학과, 학년, 학기, 성적, 민감 데이터 export 같은 실제 운영성 기능은 제외하고 `users`, `professors`, `courses`, `enrollments`만 도메인 핵심으로 둔다. 다만 수강신청 사이트의 기본 감각과 재시도/동시성 실습을 위해 강의 정원과 현재 신청 수는 `courses`에 둔다. 강의 상세 UI를 위해 `courses`에 강의 시간(`lecture_time`), 강의실(`classroom`), 학점(`credits`) 컬럼도 둔다.

인증은 서버 세션 테이블 없이 JWT access token과 `refresh_tokens` 테이블을 기준으로 한다. Refresh token을 쿠키로 운반하면 Cookie Security 실습도 이 구조에서 다룰 수 있다.

## 1차 구현 범위

1차 구현은 다음 10개 테이블을 기준으로 한다.

- 도메인 핵심: `users`, `professors`, `courses`, `enrollments`
- 인증/토큰: `refresh_tokens`
- 취약점 제어: `files`, `error_logs`, `audit_logs`, `debug_configs`
- 선택 테이블: `cors_policies`(스키마에만 두고 1차 MVP에서는 관리 API를 만들지 않을 수 있음)

## 제외한 개념

- `grades`: 학기 종료/성적 부여 흐름이 없는 사이트 컨셉과 맞지 않아 제외한다.
- `sensitive_exports`: 운영자용 내보내기 기능에 가까워 1차 기능에서 제외한다.
- `sessions`: 서버 저장형 세션은 사용하지 않고 JWT/refresh token 흐름으로 처리한다.
- `students`: 학생은 별도 프로필 테이블 없이 `users.role = 'student'`로 표현한다.
- `departments`: 학과는 별도 테이블 없이 `courses.category`, `professors.department_name` 같은 목데이터 문자열로 표현한다.
- 학년/학기: 실제 학사 운영 기능이 아니라 취약점 실습이 목적이므로 1차 구현에서는 제외한다.

## 2차 확장 후보

### `announcements`

강의 공지사항 게시판이다. 사용자 입력이 화면에 다시 출력되는 구조라 XSS, 저장형 인젝션, 권한 우회 실습에 적합하다.

권장 필드:

- `id`: PK
- `course_id`: 공지 대상 강의. `courses.id` 참조
- `author_id`: 작성자. `users.id` 참조
- `title`: 공지 제목
- `content`: 공지 본문
- `is_pinned`: 상단 고정 여부
- `created_at`: 생성 시각
- `updated_at`: 수정 시각

### `grades`

성적/등급을 별도 민감 데이터로 다루고 싶을 때 추가한다. 1차에서는 학기 종료 개념이 없으므로 제외한다.

권장 필드:

- `id`: PK
- `enrollment_id`: 대상 수강신청. `enrollments.id` 참조
- `score`: 점수
- `letter_grade`: 등급
- `graded_by`: 채점 교수. `professors.id` 참조
- `graded_at`: 채점 시각

활용 시나리오:

- 다른 사용자의 성적 조회 IDOR
- 학생이 교수용 성적 API 호출
- 성적 데이터 민감 정보 노출

### `sensitive_exports`

관리자용 개인정보/수강신청 목록/파일 인덱스 export 기능을 만들 때 추가한다.

권장 필드:

- `id`: PK
- `requester_id`: 요청 사용자. `users.id` 참조
- `export_type`: 내보내기 종류
- `target_scope`: 내보내기 범위
- `export_format`: 파일 형식
- `encryption_used`: 암호화 적용 여부
- `download_url`: 다운로드 URL
- `expires_at`: 다운로드 링크 만료 시각
- `created_at`: 생성 시각

활용 시나리오:

- 암호화되지 않은 민감 export
- 예측 가능한 다운로드 URL
- 만료되지 않는 다운로드 링크
- 관리자 export API 권한 우회

### `api_keys`

외부 연동 또는 관리자 API용 키를 관리한다. JWT/refresh token 외 인증수단을 실습하고 싶을 때 추가한다.

권장 필드:

- `id`: PK
- `user_id`: 발급 사용자. `users.id` 참조
- `key_hash`: API 키 해시
- `name`: 키 이름
- `scopes`: 허용 권한 목록. JSON 형태 권장
- `created_at`: 생성 시각
- `expires_at`: 만료 시각
- `last_used_at`: 마지막 사용 시각
- `is_active`: 활성 여부

### `sessions`

전통적인 서버 세션/쿠키 기반 인증 취약점까지 별도로 실습하고 싶을 때 추가한다. 현재 1차 구현에서는 제외한다.

권장 필드:

- `id`: PK
- `user_id`: 세션 소유 사용자. `users.id` 참조
- `session_token`: 세션 토큰 해시 또는 식별자
- `created_at`: 생성 시각
- `expires_at`: 만료 시각
- `is_revoked`: 폐기 여부

### `course_capacity`

수강신청 시작/종료 시각, 고급 정원 정책, 증원 이력 같은 운영 개념을 뒤늦게 도입하고 싶을 때 추가한다. 기본 정원(`max_capacity`)과 현재 신청 수(`current_count`)는 1차 구현의 `courses`에 이미 포함한다.

권장 필드:

- `id`: PK
- `course_id`: 대상 강의. `courses.id` 참조
- `opens_at`: 신청 시작 시각
- `closes_at`: 신청 종료 시각
- `capacity_policy`: 정원 정책 설명 또는 JSON
- `updated_at`: 마지막 수정 시각

### `waitlists`

정원 개념을 도입한 뒤 대기열까지 확장하고 싶을 때 추가한다.

권장 필드:

- `id`: PK
- `user_id`: 대기 사용자. `users.id` 참조
- `course_id`: 대기 강의. `courses.id` 참조
- `position`: 대기 순번
- `created_at`: 대기 등록 시각

## 확장 우선순위

1. `announcements`: XSS와 BFLA 시나리오 확장이 쉬움
2. `api_keys`: 인증 우회/기본 키 노출 시나리오가 필요할 때
3. `grades`: 성적 민감정보/IDOR 시나리오가 필요할 때
4. `sensitive_exports`: 관리자 export와 암호화 실패 시나리오가 필요할 때
5. `sessions`: 전통적인 서버 세션 취약점까지 별도로 다루고 싶을 때
6. `course_capacity`: 정원/기간/동시성 실습이 필요할 때
7. `waitlists`: 정원 초과 이후 대기열 실습까지 확장할 때
