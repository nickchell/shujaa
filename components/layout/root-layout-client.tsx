'use client';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/header';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { ProcessReferral } from '@/components/auth/process-referral';
import { ClerkConfig } from '@/components/auth/clerk-config';

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LoadingProvider>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        {/* Process referrals for authenticated users */}
        <ProcessReferral />
        {/* Handle Clerk SSO callbacks */}
        <ClerkConfig />
        <Toaster />
      </LoadingProvider>
    </ThemeProvider>
  );
}
