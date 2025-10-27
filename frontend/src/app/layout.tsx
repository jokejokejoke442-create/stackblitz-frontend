import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import '../styles/accessibility.css';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { AuthProvider } from '@/hooks/useAuth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'School Management System',
  description:
    'Comprehensive school management system for students, teachers, parents, and administrators.',
  keywords: [
    'School Management',
    'Education',
    'Student Management',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'shadcn/ui',
    'React',
  ],
  authors: [{ name: 'School Management Team' }],
  openGraph: {
    title: 'School Management System',
    description: 'Comprehensive school management system',
    siteName: 'School Management System',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Management System',
    description: 'Comprehensive school management system',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ErrorBoundary>
          <AuthProvider>
            <AccessibilityProvider>
              <main id="main-content">
                {children}
              </main>
              <AccessibilityMenu />
              <Toaster />
            </AccessibilityProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}