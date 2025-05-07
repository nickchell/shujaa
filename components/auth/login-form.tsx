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
  otp: z.string().length(6, {
    message: "OTP must be 6 digits.",
  }).optional(),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const { signIn } = useSignIn();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      otp: "",
    },
  });

  async function onSendOTP(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (signIn) {
        const res = await signIn.create({
          identifier: values.phoneNumber,
          strategy: 'phone_code', // Changed from 'phone_number' to 'phone_code'
        });

        // Check the status to proceed with OTP verification
        if (res.status === 'needs_second_factor') { // Changed from 'requires_second_factor'
          setShowOTP(true);
          toast({
            title: "OTP Sent",
            description: "We've sent a verification code to your phone number.",
          });
        } else {
          toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyOTP(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (signIn) {
        const res = await signIn.attemptFirstFactor({
          strategy: 'phone_code', // Changed from 'phone_number'
          code: values.otp!, // Using non-null assertion since we know otp exists here
        });

        // Check the authentication status
        if (res.status === 'complete') { // Changed from 'authenticated'
          toast({
            title: "Login Successful",
            description: "Welcome back to Rafiki Rewards!",
          });
          router.push('/dashboard');
        } else {
          toast({
            title: "Error",
            description: "Invalid OTP. Please try again.",
          });
        }
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
      <form onSubmit={form.handleSubmit(showOTP ? onVerifyOTP : onSendOTP)} className="space-y-4">
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
                  disabled={showOTP || isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showOTP && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter 6-digit code" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!showOTP ? "Send Verification Code" : "Verify & Login"}
        </Button>
        
        {showOTP && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isLoading}
            onClick={() => {
              setShowOTP(false);
              form.resetField("otp");
            }}
          >
            Change Phone Number
          </Button>
        )}
      </form>
    </Form>
  );
}