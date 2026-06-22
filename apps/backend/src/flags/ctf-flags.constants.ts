export const CTF_FLAGS = {
  SQLI_LOGIN: 'FLAG{sqli_login_bypass_admin}',
  REGISTER_ADMIN: 'FLAG{mass_assign_register_admin}',
  IDOR_USER_HASH: 'FLAG{idor_user_pw_hash_leak}',
  BFLA_ADMIN_DASH: 'FLAG{bfla_admin_no_auth_guard}',
  SQLI_HIDDEN_COURSES: 'FLAG{sqli_hidden_courses_revealed}',
  IDOR_FILE_PATH: 'FLAG{idor_file_stored_path_leak}',
  BIZ_CAPACITY: 'FLAG{biz_logic_capacity_bypass}',
  IDOR_CANCEL: 'FLAG{idor_enroll_cancel_hijack}',
  BFLA_ROLE: 'FLAG{bfla_self_promote_to_admin}',
} as const;

export type CtfFlagValue = (typeof CTF_FLAGS)[keyof typeof CTF_FLAGS];

export const CTF_FLAG_SEEDS = [
  {
    name: 'SQLi 로그인 우회',
    category: 'A07',
    description:
      'POST /api/auth/login의 username 파라미터 SQL 인젝션으로 비밀번호 없이 admin 계정 로그인',
    hint: "username 필드에 SQL 주석 처리 기법을 사용해보세요. 예: admin' --",
    flagValue: CTF_FLAGS.SQLI_LOGIN,
    points: 200,
    difficulty: 1,
  },
  {
    name: '회원가입 admin role 주입',
    category: 'A07',
    description:
      'POST /api/auth/register 요청 body에 role 필드를 직접 삽입하여 admin 권한 계정 생성',
    hint: '회원가입 API body에 공식 문서에 없는 필드를 추가해보세요.',
    flagValue: CTF_FLAGS.REGISTER_ADMIN,
    points: 150,
    difficulty: 1,
  },
  {
    name: 'IDOR 사용자 정보 노출',
    category: 'A01',
    description:
      'GET /api/users/:userId에서 타인의 ID로 passwordHash 포함 전체 프로필 조회',
    hint: 'API 경로의 userId 숫자를 바꿔보세요. 응답에 무엇이 들어있나요?',
    flagValue: CTF_FLAGS.IDOR_USER_HASH,
    points: 200,
    difficulty: 1,
  },
  {
    name: 'BFLA 관리자 대시보드 무단 접근',
    category: 'A01',
    description:
      'GET /api/admin을 인증 없이 또는 student 토큰으로 호출하여 관리자 전용 통계 열람',
    hint: '관리자 API를 인증 없이 직접 호출해보세요.',
    flagValue: CTF_FLAGS.BFLA_ADMIN_DASH,
    points: 100,
    difficulty: 1,
  },
  {
    name: 'SQLi 숨김 강의 열람',
    category: 'A05',
    description:
      "GET /api/courses?category= 파라미터 SQLi로 is_visible=false인 숨김 강의 5개 추가 노출",
    hint: "category 쿼리 파라미터에 SQL 조건을 주입해보세요. 예: ' OR c.is_visible=false OR '1'='1",
    flagValue: CTF_FLAGS.SQLI_HIDDEN_COURSES,
    points: 300,
    difficulty: 2,
  },
  {
    name: 'IDOR 파일 경로 노출',
    category: 'A01',
    description:
      'GET /api/courses/:courseId/files에서 미수강·숨김 강의 ID로 storedPath 포함 파일 목록 열람',
    hint: '수강하지 않은 강의의 파일 목록도 API로 직접 접근할 수 있습니다.',
    flagValue: CTF_FLAGS.IDOR_FILE_PATH,
    points: 200,
    difficulty: 2,
  },
  {
    name: '정원 초과 수강신청',
    category: 'A06',
    description:
      'POST /api/enrollments로 UI의 정원 초과 버튼 비활성화를 무시하고 직접 API 호출',
    hint: '프론트엔드 버튼이 비활성화되어 있어도 API를 직접 호출하면 어떻게 될까요?',
    flagValue: CTF_FLAGS.BIZ_CAPACITY,
    points: 150,
    difficulty: 1,
  },
  {
    name: 'IDOR 타인 수강 취소',
    category: 'A01',
    description:
      'POST /api/enrollments/:id/cancel에서 타인의 enrollment ID로 수강 취소',
    hint: '수강 취소 API 경로의 ID를 본인 것이 아닌 다른 수강신청 ID로 바꿔보세요.',
    flagValue: CTF_FLAGS.IDOR_CANCEL,
    points: 200,
    difficulty: 2,
  },
  {
    name: 'BFLA 자기 권한 상승',
    category: 'A01',
    description:
      'POST /api/admin/users/:userId/role로 student 계정이 자신의 role을 admin으로 변경',
    hint: '관리자 전용 API가 실제로 권한을 확인하는지 테스트해보세요. 본인 userId로 role 변경을 시도해보세요.',
    flagValue: CTF_FLAGS.BFLA_ROLE,
    points: 300,
    difficulty: 2,
  },
] as const;
