'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSignIn } from '@clerk/nextjs';

const formSchema = z.object({
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }).max(13, {
    message: "Phone number must not be longer than 13 characters.",
  }),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signIn } = useSignIn();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  // Function to handle Google sign-in (Clerk Sign-In)
  async function onGoogleSignIn() {
    if (!signIn) {
      toast({
        title: "Error",
        description: "Sign-in service is unavailable.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn.create({
        strategy: 'oauth_google', // Use Google OAuth for sign-in
        redirectUrl: window.location.origin, // Ensure to provide the redirect URL
      });

      if (res.status === 'complete') {
        toast({
          title: "Login Successful",
          description: "Welcome back to Rafiki Rewards!",
        });
        router.push('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Failed to sign in with Google. Please try again.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGoogleSignIn)} className="space-y-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., 07XXXXXXXX" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in with Google
        </Button>
      </form>
    </Form>
  );
}
