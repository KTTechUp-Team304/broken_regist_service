import type { ReactNode } from 'react';
import { AuthGuard } from '@/commons/providers/auth-context/auth-guard';
import { MainShell } from '@/components/layout/main-shell';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <MainShell>{children}</MainShell>
    </AuthGuard>
  );
}
