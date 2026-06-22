-- Course Registration Vulnerable Training Server
-- ERD v1 schema for PostgreSQL.
--
-- Scope:
-- - Fake course registration site for vulnerability training
-- - Signup users are created only as role = student
-- - Professor/admin accounts and courses are seeded mock data
-- - Grades and sensitive export features are intentionally excluded from v1
-- - Authentication uses JWT access tokens and persisted refresh tokens
-- - Server-side sessions are intentionally excluded

CREATE TYPE user_role AS ENUM ('student', 'professor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE course_enrollment_status AS ENUM ('enrolled', 'dropped');

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recent_login_date TIMESTAMPTZ,
    status user_status NOT NULL DEFAULT 'active'
);

CREATE TABLE professors (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100)
);

CREATE TABLE courses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    professor_id BIGINT NOT NULL REFERENCES professors(id) ON DELETE RESTRICT,
    category VARCHAR(100),
    lecture_time VARCHAR(200),
    classroom VARCHAR(200),
    credits INT,
    max_capacity INT NOT NULL DEFAULT 30 CHECK (max_capacity > 0),
    current_count INT NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_courses_capacity
        CHECK (current_count <= max_capacity)
);

CREATE TABLE enrollments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status course_enrollment_status NOT NULL DEFAULT 'enrolled',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dropped_at TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    device_info TEXT
);

CREATE TABLE files (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    uploader_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    original_name VARCHAR(255) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT NOT NULL CHECK (file_size >= 0),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE error_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    error_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    request_path VARCHAR(500) NOT NULL,
    request_method VARCHAR(10) NOT NULL,
    request_body TEXT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    ip_address VARCHAR(45),
    request_method VARCHAR(10) NOT NULL,
    request_path VARCHAR(500) NOT NULL,
    response_status INT NOT NULL CHECK (response_status BETWEEN 100 AND 599),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE debug_configs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE cors_policies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    allowed_origin VARCHAR(255) NOT NULL,
    allowed_methods VARCHAR(200) NOT NULL,
    allowed_headers VARCHAR(500) NOT NULL,
    allow_credentials BOOLEAN NOT NULL DEFAULT FALSE,
    max_age INT NOT NULL DEFAULT 0 CHECK (max_age >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_professors_user_id ON professors(user_id);
CREATE INDEX idx_courses_professor_id ON courses(professor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
-- Re-enrollment policy:
-- - Only one active enrollment is allowed per user/course.
-- - Dropped rows can remain as history.
-- - A user can re-enroll after dropping because this unique index only applies to active rows.
CREATE UNIQUE INDEX uq_enrollments_active_user_course
    ON enrollments(user_id, course_id)
    WHERE status = 'enrolled';
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_files_course_id ON files(course_id);
CREATE INDEX idx_files_uploader_id ON files(uploader_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_debug_configs_sensitive ON debug_configs(is_sensitive);
CREATE INDEX idx_cors_policies_active ON cors_policies(is_active);

-- 기존 DB(v1 초기 스키마)에서 컬럼만 추가할 때:
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS lecture_time VARCHAR(200);
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS classroom VARCHAR(200);
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS credits INT;
