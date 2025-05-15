import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { RootLayoutClient } from '@/components/layout/root-layout-client';
import { ConfigInitializer } from '@/components/config-initializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rafiki Rewards - Earn Data Through Referrals',
  description: 'Earn free Safaricom data bundles by referring friends and completing simple tasks',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 
            'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          card: 'bg-transparent shadow-none',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
          formFieldInput: 
            'rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`min-h-screen bg-background font-sans antialiased ${inter.className}`}>
          <div className="flex min-h-screen flex-col">
            <ConfigInitializer />
            <RootLayoutClient>{children}</RootLayoutClient>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
