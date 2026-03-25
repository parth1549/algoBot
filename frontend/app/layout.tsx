import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
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
      <body className="flex min-h-screen bg-[var(--bg-primary)]">
        <ClerkProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 p-3 md:p-6 overflow-x-hidden overflow-y-auto w-full">
              {children}
            </main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
