import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/contexts/ToastContext';
import { I18nProvider } from '@/contexts/I18nContext';

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Personal Finance & Portfolio Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <I18nProvider>
          <SessionProvider>
            <ToastProvider>{children}</ToastProvider>
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
