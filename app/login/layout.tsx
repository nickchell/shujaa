import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Rafiki Rewards',
  description: 'Sign in to your Rafiki Rewards account',
};

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 