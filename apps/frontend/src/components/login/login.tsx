'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/commons/providers/auth-context/auth-context';
import styles from './login.module.css';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const role = await login(username, password);
      router.push(role === 'admin' ? '/admin' : '/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('로그인에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>수강신청 시스템</h1>
        <p className={styles.subtitle}>로그인</p>

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
              className={styles.input}
              required
            />
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

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.button}>
            로그인
          </button>
        </form>

        <div className={styles.footer}>
          <span>계정이 없으신가요?</span>
          <Link href="/register" className={styles.link}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
