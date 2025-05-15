'use client';

import { useState, useEffect } from 'react';
import '@/app/animations.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase/browser-client';

interface PhoneInputProps {
  onPhoneUpdated?: (phone: string) => void;
}

export function PhoneInput({ onPhoneUpdated }: PhoneInputProps = {}) {
  const { user } = useUser();
  const { toast } = useToast();
  const supabase = createBrowserClient();
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [hasCheckedPhone, setHasCheckedPhone] = useState(false);

  if (!supabase) {
    console.error('Failed to initialize Supabase client');
    return null;
  }

  // Check if user already has a phone number
  useEffect(() => {
    const checkExistingPhone = async () => {
      if (!user?.id || !supabase) return;

      try {
        const { data } = await supabase
          .from('users')
          .select('phone_number')
          .eq('id', user.id)
          .single();

        if (data?.phone_number) {
          setSavedPhone(data.phone_number);
          setShowInput(false);
        }
      } catch (error) {
        console.error('Error checking phone number:', error);
      } finally {
        setHasCheckedPhone(true);
      }
    };

    checkExistingPhone();
  }, [user?.id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    e.preventDefault();
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (!user?.id) {
        throw new Error('No user ID available');
      }

      // First check if user exists
      console.log('Checking if user exists:', user.id);
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        throw fetchError;
      }

      if (!existingUser) {
        console.error('User not found in database');
        toast({
          title: "Error",
          description: "Your account is not properly set up. Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }

      // Update the user's phone number
      console.log('Updating phone number for existing user:', user?.id);
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ 
          phone_number: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)
        .select();

      if (updateError) {
        console.error('Error updating phone number:', updateError);
        throw updateError;
      }
      
      console.log('Phone number update result:', updateData);

      // Get any pending referrals for this user
      const { data: referrals, error: referralError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', user?.id)
        .eq('status', 'pending');

      if (referralError) throw referralError;

      // Update the status of all pending referrals to completed
      if (referrals && referrals.length > 0) {
        // First get the referrer's details
        const referral = referrals[0]; // Take the first pending referral
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id, full_name, email')
          .eq('id', referral.referrer_id)
          .single();

        if (referrerError) throw referrerError;

        // Update all pending referrals to completed
        const { error: statusError } = await supabase
          .from('referrals')
          .update({ 
            status: 'completed',
            reward_granted: true,
            reward_amount: 50,
            reward_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('referred_id', user?.id)
          .eq('status', 'pending');

        if (statusError) throw statusError;

        // Show a special toast for the referral completion
        toast({
          title: "Referral Bonus Activated!",
          description: `Your referral from ${referrerData.full_name.split(' ')[0]} has been completed. They will receive their reward soon!`,
        });
      }

      setSavedPhone(phone);
      setShowInput(false);
      onPhoneUpdated?.(phone);
      
      toast({
        title: "Success",
        description: "Phone number saved successfully. Your data bundle will be sent shortly.",
      });

    } catch (error: any) {
      console.error('Error saving phone number:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      toast({
        title: "Error",
        description: error.message || "Failed to save phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showInput && savedPhone) {
    return (
      <div className="mb-6">
        {savedPhone ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-gradient-to-r from-[hsl(1,77%,55%)] to-[hsl(142,76%,36%)] text-white font-medium shadow-lg">
            <p>Phone Number: {savedPhone}</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
      <Input
        type="tel"
        placeholder="Enter phone number to receive data bundles"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        pattern="^(?:\+254|0)[17]\d{8}$"
        title="Please enter a valid Kenyan phone number (starting with +254 or 0)"
        className={`flex-1 ${!savedPhone && hasCheckedPhone ? 'flame-effect' : ''}`}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
