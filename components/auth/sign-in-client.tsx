'use client';

import { SignIn } from "@clerk/nextjs";
import { useLoading } from "@/components/providers/loading-provider";

export function SignInClient() {
  const { isLoading } = useLoading();

  if (isLoading) {
    return null; // LoadingScreen will be shown by LoadingProvider
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
} 