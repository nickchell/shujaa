'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client component with SSR disabled
const ClientWelcomeContent = dynamic(
  () => import('@/components/welcome/welcome-content'),
  { ssr: false }
);

export default function WelcomePage() {
  return (
    <div className="min-h-screen py-12">
      <ClientWelcomeContent />
    </div>
  );
}