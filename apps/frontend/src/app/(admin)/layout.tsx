'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/commons/providers/auth-context/auth-context';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { AuthGuard } from '@/commons/providers/auth-context/auth-guard';
import { SessionTimer } from '@/components/layout/session-timer';
import styles from './layout.module.css';

export default function AdminSegmentLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navClass = (href: string) => {
    const active =
      href === '/admin'
        ? pathname === '/admin'
        : pathname === href || pathname.startsWith(`${href}/`);
    return `${styles.navLink} ${active ? styles.navLinkActive : ''}`;
  };

  return (
    <AuthGuard>
    <div className={styles.adminLayout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.logo}>
            <LayoutDashboard size={24} />
            <span>관리자 페이지</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/admin" className={navClass('/admin')}>
              대시보드
            </Link>
            <Link href="/admin/courses" className={navClass('/admin/courses')}>
              강의 관리
            </Link>
            <Link href="/admin/users" className={navClass('/admin/users')}>
              사용자 관리
            </Link>
          </nav>
          <div className={styles.headerActions}>
            <SessionTimer variant="header" />
            <button type="button" onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
    </AuthGuard>
  );
}
