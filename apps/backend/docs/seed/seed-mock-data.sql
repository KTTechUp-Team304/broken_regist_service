-- Mock seed: users (16) → professors (5) → courses (15)
--   users id 1–10: student / id 11–15: professor / id 16: admin
-- professors.user_id FK → users.id 이므로 users를 반드시 먼저 INSERT 한다.
-- Run after schema exists (TypeORM synchronize or course-registration-erd-v1.sql).
--
-- Login passwords (plain → SHA-256 hex, same as AuthService.hashValue):
--   All student accounts:   student1
--   All professor accounts: professor1
--   Admin (optional):       admin123
--
-- Apply:
--   docker compose exec -T postgres psql -U broken_regist -d broken_regist \
--     < docs/seed/seed-mock-data.sql
--
-- Re-run: uncomment the cleanup block below (deletes only seed usernames/codes).

-- BEGIN cleanup (uncomment to reset seed data)
-- DELETE FROM courses WHERE code IN (
--   'CS101','CS201','CS999',
--   'MATH101','MATH201','CS998',
--   'EE101','EE201','CS997',
--   'BUS101','BUS201','CS996',
--   'HUM101','CS520','CS995'
-- );
-- DELETE FROM professors WHERE user_id IN (
--   SELECT id FROM users WHERE username IN (
--     '김민수','이서연','박지훈','최유진','정하은','강도윤','윤서아','임준호','송나연','오태양',
--     '리누스 토발즈','앨런 튜링','그레이스 호퍼','데니스 리치','도널드 커누스','admin'
--   )
-- );
-- DELETE FROM users WHERE username IN (
--   '김민수','이서연','박지훈','최유진','정하은','강도윤','윤서아','임준호','송나연','오태양',
--   '리누스 토발즈','앨런 튜링','그레이스 호퍼','데니스 리치','도널드 커누스','admin'
-- );
-- END cleanup

BEGIN;

-- Password hashes
-- student1:   509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9
-- professor1: ffa0d142c7d7ec220030a9818364e1ff624d1c8586e3050d2f943a6fe6b5b488
-- admin123:   240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

INSERT INTO users (id, username, password_hash, role) OVERRIDING SYSTEM VALUE VALUES
  (1,  '김민수', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (2,  '이서연', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (3,  '박지훈', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (4,  '최유진', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (5,  '정하은', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (6,  '강도윤', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (7,  '윤서아', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (8,  '임준호', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (9,  '송나연', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (10, '오태양', '509e87a6c45ee0a3c657bf946dd6dc43d7e5502143be195280f279002e70f7d9', 'student'),
  (11, '리누스 토발즈', 'ffa0d142c7d7ec220030a9818364e1ff624d1c8586e3050d2f943a6fe6b5b488', 'professor'),
  (12, '앨런 튜링',     'ffa0d142c7d7ec220030a9818364e1ff624d1c8586e3050d2f943a6fe6b5b488', 'professor'),
  (13, '그레이스 호퍼', 'ffa0d142c7d7ec220030a9818364e1ff624d1c8586e3050d2f943a6fe6b5b488', 'professor'),
  (14, '데니스 리치',   'ffa0d142c7d7ec220030a9818364e1ff624d1c8586e3050d2f943a6fe6b5b488', 'professor'),
  (15, '도널드 커누스', 'ffa0d142c7d7ec220030a9818364e1ff624d1c8586e3050d2f943a6fe6b5b488', 'professor'),
  (16, 'admin',         '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin');

SELECT setval(
  pg_get_serial_sequence('users', 'id'),
  (SELECT MAX(id) FROM users)
);

INSERT INTO professors (user_id, name, department_name)
SELECT u.id, u.username, v.department_name
FROM users u
JOIN (VALUES
  ('리누스 토발즈', '컴퓨터공학과'),
  ('앨런 튜링',     '컴퓨터공학과'),
  ('그레이스 호퍼', '컴퓨터공학과'),
  ('데니스 리치',   '컴퓨터공학과'),
  ('도널드 커누스', '컴퓨터공학과')
) AS v(username, department_name) ON v.username = u.username;

-- 15 courses — 노출 10 (교수당 2) / 숨김 실습 5 (교수당 1)
INSERT INTO courses (
  code, name, description, professor_id, category,
  lecture_time, classroom, credits, max_capacity, current_count, is_visible
)
SELECT v.code, v.name, v.description, p.id, v.category,
       v.lecture_time, v.classroom, v.credits, v.max_capacity, v.current_count, v.is_visible
FROM (VALUES
  -- 리누스 토발즈 — 노출 2 / 숨김 1
  ('리누스 토발즈', 'CS101',  '컴퓨터과학개론',     '프로그래밍과 컴퓨터 시스템 기초',           'engineering', '월, 수 10:00-12:00', '공학관 301호', 3, 40, 12, true),
  ('리누스 토발즈', 'CS201',  '자료구조',           '리스트, 트리, 그래프와 알고리즘 분석',       'engineering', '화, 목 14:00-16:00', '공학관 302호', 3, 35, 35, true),
  ('리누스 토발즈', 'CS999',  '숨김 실습 강의 A',   'isVisible=false · 목록/IDOR 실습용',        'engineering', NULL,                 NULL,           2, 10,  0, false),

  -- 앨런 튜링 — 노출 2 / 숨김 1
  ('앨런 튜링', 'MATH101', '미적분학 I',         '극한, 미분, 적분의 기초',                   'engineering', '월, 수 09:00-11:00', '공학관 101호', 3, 50, 28, true),
  ('앨런 튜링', 'MATH201', '선형대수',           '행렬, 벡터공간, 고유값',                     'engineering', '화, 목 10:00-12:00', '공학관 201호', 3, 40, 15, true),
  ('앨런 튜링', 'CS998',  '숨김 실습 강의 B',   'isVisible=false · 필터 우회 실습용',        'engineering', NULL,                 NULL,           2, 10,  0, false),

  -- 그레이스 호퍼 — 노출 2 / 숨김 1
  ('그레이스 호퍼', 'EE101',  '컴퓨터네트워크',     'OSI, TCP/IP, 라우팅 기초',                  'engineering', '화, 목 09:00-11:00', '공학관 401호', 3, 45, 20, true),
  ('그레이스 호퍼', 'EE201',  '데이터베이스',       '관계형 DB, SQL, 정규화',                    'engineering', '월, 수 13:00-15:00', '공학관 402호', 3, 30, 10, true),
  ('그레이스 호퍼', 'CS997',  '숨김 실습 강의 C',   'isVisible=false · 직접 URL 접근 실습용',    'engineering', NULL,                 NULL,           2, 10,  0, false),

  -- 데니스 리치 — 노출 2 / 숨김 1
  ('데니스 리치', 'BUS101', 'C 프로그래밍',       '포인터, 메모리, 시스템 호출 기초',           'engineering', '월 10:00-13:00',     '공학관 501호', 3, 60, 45, true),
  ('데니스 리치', 'BUS201', '시스템 프로그래밍',  '프로세스, IPC, Unix API',                   'engineering', '수 14:00-17:00',     '공학관 502호', 3, 40, 18, true),
  ('데니스 리치', 'CS996',  '숨김 실습 강의 D',   'isVisible=false · 권한 검증 실습용',        'engineering', NULL,                 NULL,           2, 10,  0, false),

  -- 도널드 커누스 — 노출 2 / 숨김 1
  ('도널드 커누스', 'HUM101', '알고리즘',           '정렬, 탐색, 동적 프로그래밍',                 'engineering', '화 10:00-13:00',     '공학관 601호', 3, 50, 30, true),
  ('도널드 커누스', 'CS520',  '문서화와 컴파일러',  '어휘·구문 분석, 코드 생성 개론',             'engineering', '목 14:00-17:00',     '공학관 602호', 3, 40,  0, true),
  ('도널드 커누스', 'CS995',  '숨김 실습 강의 E',   'isVisible=false · 관리자 전용 실습용',      'engineering', NULL,                 NULL,           2, 10,  0, false)
) AS v(
  professor_username, code, name, description, category,
  lecture_time, classroom, credits, max_capacity, current_count, is_visible
)
JOIN users u ON u.username = v.professor_username
JOIN professors p ON p.user_id = u.id;

COMMIT;
