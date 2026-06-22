import type { ReactNode } from 'react';
import { ReactQueryProvider } from '../commons/providers/react-query/react-query-provider';
import { AuthProvider } from '@/commons/providers/auth-context/auth-context';
import { AuthSessionLoader } from '@/commons/providers/auth-context/auth-session-loader';
import { FlagInterceptor } from '@/commons/ctf/flag-interceptor';
import './globals.css';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            <AuthSessionLoader>{children}</AuthSessionLoader>
          </AuthProvider>
          <FlagInterceptor />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
