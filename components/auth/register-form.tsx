"use client";
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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClerkProvider, useClerk } from '@clerk/nextjs';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }).max(13, {
    message: "Phone number must not be longer than 13 characters.",
  }),
  shujaaType: z.string({
    required_error: "Please select your Shujaa type.",
  }),
  primaryGoal: z.string({
    required_error: "Please select your primary goal.",
  }),
  otp: z.string().length(6, {
    message: "OTP must be 6 digits.",
  }).optional(),
  referralCode: z.string().optional(),
});

const shujaaTypes = [
  { value: 'hustler', label: 'Hustler' },
  { value: 'student', label: 'Student' },
  { value: 'gamer', label: 'Gamer' },
  { value: 'sideHustler', label: 'Side Hustler' },
  { value: 'parent', label: 'Parent' },
];

const goals = [
  { value: 'data', label: 'Earn Data Bundles' },
  { value: 'airtime', label: 'Get Free Airtime' },
  { value: 'cashback', label: 'Earn Cashback' },
  { value: 'rewards', label: 'Special Rewards' },
];

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { clerk, openSignUp } = useClerk(); // Clerk context hook

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      shujaaType: "",
      primaryGoal: "",
      otp: "",
      referralCode: "",
    },
  });

  // Handler to send OTP with Clerk
  async function onSendOTP(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Use Clerk's phone authentication to send OTP
      await clerk.createPhoneNumberSession(values.phoneNumber);

      setIsLoading(false);
      setShowOTP(true);
      toast({
        title: "OTP Sent",
        description: "We've sent a verification code to your phone number.",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Handler to verify OTP with Clerk
  async function onVerifyOTP(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Verify OTP using Clerk's API
      await clerk.verifyPhoneNumberOTP(values.phoneNumber, values.otp);

      setIsLoading(false);
      toast({
        title: "Welcome Shujaa!",
        description: `You've earned your first reward as a ${values.shujaaType}!`,
      });
      router.push('/dashboard');
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(showOTP ? onVerifyOTP : onSendOTP)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your name" 
                  {...field} 
                  disabled={showOTP || isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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

        <FormField
          control={form.control}
          name="shujaaType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose Your Shujaa Type</FormLabel>
              <FormDescription>
                This helps us personalize your rewards and tasks
              </FormDescription>
              <Select 
                disabled={showOTP || isLoading}
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {shujaaTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you want to earn?</FormLabel>
              <FormDescription>
                We'll prioritize these rewards for you
              </FormDescription>
              <Select 
                disabled={showOTP || isLoading}
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {goals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="referralCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral Code (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter referral code" 
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
          {!showOTP ? "Send Verification Code" : "Verify & Create Account"}
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
            Change Details
          </Button>
        )}
      </form>
    </Form>
  );
}
