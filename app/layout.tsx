import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/header'; // Import the Navbar component
import { ClerkProvider } from '@clerk/nextjs'; // Import ClerkProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rafiki Rewards - Earn Data Through Referrals',
  description: 'Earn free Safaricom data bundles by referring friends and completing simple tasks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider> {/* Wrapping the app with ClerkProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
          >
            <div className="flex min-h-screen flex-col">
              <Navbar /> {/* Add Navbar here */}
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider> {/* ClerkProvider wraps the entire app */}
      </body>
    </html>
  );
}
