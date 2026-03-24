import type { Metadata } from 'next';
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export const metadata: Metadata = {
  title: 'AlgoBot — AI Trading Dashboard',
  description: 'AI-powered algorithmic trading dashboard with backtesting and live signals',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              document.documentElement.classList.remove('dark', 'light', 'light-theme');
              localStorage.removeItem('theme');
              localStorage.removeItem('algo_theme');
            } catch (_) {}
          `
        }} />
      </head>
      <body style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <ClerkProvider>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
                padding: '8px 24px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
              }}
            >
              <Show when="signed-out">
                <SignInButton mode="redirect" forceRedirectUrl="/market">
                  <button style={{ padding: '6px 12px' }}>Sign in</button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl="/market">
                  <button style={{ padding: '6px 12px' }}>Sign up</button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
            <Topbar />
            <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
