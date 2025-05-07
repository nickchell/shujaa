'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'register' ? 'register' : 'login';

  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      redirect('/dashboard');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const OAuthSection = (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
          <span className="bg-background px-2">Or continue with</span>
        </div>
      </div>

      <SignInButton mode="modal">
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
      </SignInButton>
    </>
  );

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-muted/20">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Rafiki Rewards</h1>
          <p className="text-muted-foreground mt-2">
            {activeTab === 'login'
              ? 'Sign in to start earning rewards'
              : 'Create an account to get started'}
          </p>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" asChild>
              <Link href="/login?tab=login" scroll={false}>Login</Link>
            </TabsTrigger>
            <TabsTrigger value="register" asChild>
              <Link href="/login?tab=register" scroll={false}>Register</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription>
                  Enter your phone number to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                  <LoginForm />
                </Suspense>
                {OAuthSection}
              </CardContent>
              <div className="px-6 pb-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/login?tab=register" className="text-primary hover:underline" scroll={false}>
                  Register now
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>
                  Enter your details to join Rafiki Rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                  <RegisterForm />
                </Suspense>
                {OAuthSection}
              </CardContent>
              <div className="px-6 pb-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login?tab=login" className="text-primary hover:underline" scroll={false}>
                  Sign in
                </Link>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
