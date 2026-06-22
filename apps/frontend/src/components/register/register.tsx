'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/commons/providers/auth-context/auth-context';
import styles from './register.module.css';

const KOREAN_ONLY = /^[가-힣]+$/;

export function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const isUsernameInvalid = username.length > 0 && !KOREAN_ONLY.test(username);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 취약점: 약한 비밀번호 허용
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await register(username, password);
      router.push('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('회원가입에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>수강신청 시스템</h1>
        <p className={styles.subtitle}>회원가입</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`${styles.input} ${isUsernameInvalid ? styles.inputError : ''}`}
              placeholder="한글 이름을 입력하세요"
              required
            />
            {isUsernameInvalid && (
              <span className={styles.fieldError}>이름은 한글로만 입력할 수 있습니다.</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.button}
            disabled={isUsernameInvalid}
          >
            회원가입
          </button>
        </form>

        <div className={styles.footer}>
          <span>이미 계정이 있으신가요?</span>
          <Link href="/login" className={styles.link}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
