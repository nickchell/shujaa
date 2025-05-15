'use client';

import './welcome.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Using a fixed year instead of dynamic calculation
const CURRENT_YEAR = new Date().getFullYear();

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`welcome-root ${inter.className}`}>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        {CURRENT_YEAR} Rafiki Rewards. All rights reserved.
      </footer>
    </div>
  );
}