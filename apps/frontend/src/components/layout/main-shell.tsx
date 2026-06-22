'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/commons/providers/auth-context/auth-context';
import { Logo } from '@/commons/logo/logo';
import { SessionTimer } from '@/components/layout/session-timer';
import { ArrowLeft, Home, BookOpen, User, Settings, LogOut, ChevronLeft, Flag } from 'lucide-react';
import styles from './main-shell.module.css';

interface MainShellProps {
  children: ReactNode;
}

export function MainShell({ children }: MainShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname.startsWith('/admin');
    }
    if (path === '/course') {
      return pathname === '/course' || pathname.startsWith('/course/');
    }
    if (path === '/ctf') {
      return pathname.startsWith('/ctf');
    }
    return pathname === path;
  };

  const navLinkClass = (path: string) =>
    `${styles.navLink} ${isActive(path) ? styles.navLinkActive : ''}`.trim();

  return (
    <div className={styles.container}>
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}
        onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
      >
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.logoLink} onClick={(e) => e.stopPropagation()}>
            <Logo />
            {isSidebarOpen && <span className={styles.logoText}>수강신청 시스템</span>}
          </Link>
          {isSidebarOpen && (
            <button
              type="button"
              className={styles.toggleButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(false);
              }}
              title="사이드바 접기"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          <button type="button" onClick={handleBack} className={styles.navLink}>
            <ArrowLeft size={20} />
            {isSidebarOpen && <span>뒤로가기</span>}
          </button>
          <Link href="/dashboard" className={navLinkClass('/dashboard')}>
            <Home size={20} />
            {isSidebarOpen && <span>마이페이지</span>}
          </Link>
          <Link href="/course" className={navLinkClass('/course')}>
            <BookOpen size={20} />
            {isSidebarOpen && <span>강의 목록</span>}
          </Link>
          <Link href="/ctf" className={navLinkClass('/ctf')}>
            <Flag size={20} />
            {isSidebarOpen && <span>CTF 실습</span>}
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className={navLinkClass('/admin')}>
              <Settings size={20} />
              {isSidebarOpen && <span>관리자</span>}
            </Link>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <SessionTimer isSidebarOpen={isSidebarOpen} />
          <div className={styles.userInfo}>
            <User size={20} />
            {isSidebarOpen && <span className={styles.username}>{user?.username}</span>}
          </div>
          <button type="button" onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            {isSidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </aside>

      <div className={styles.mainWrapper}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
