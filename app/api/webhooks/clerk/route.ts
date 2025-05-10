import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { checkReferralCode, createReferral } from '@/lib/supabase/referrals';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, ...attributes } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (!id || !email) {
      console.error('Missing user id or email:', { id, email });
      return new Response('Missing user id or email', { status: 400 });
    }

    // Get referral code from URL if present, otherwise check cookies
    const url = new URL(req.url);
    let referralCode = url.searchParams.get('ref');
    const cookieHeader = req.headers.get('cookie');
    if (!referralCode && cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const refCookie = cookies.find(c => c.startsWith('referral_code='));
      if (refCookie) {
        referralCode = refCookie.split('=')[1];
      }
    }

    // Generate a unique referral code
    const generatedCode = `shuj-${id.substring(0, 4)}${Math.floor(Math.random() * 10000)}`;

    try {
      // Create user in Supabase with the generated referral code
      const supabase = createClient();
      
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking existing user:', checkError);
        return new Response(`Error checking existing user: ${checkError.message}`, {
          status: 500
        });
      }

      if (existingUser) {
        console.log('User already exists in Supabase:', id);
        return new Response('User already exists', { status: 200 });
      }

      // Create new user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id,
          email,
          ...attributes,
          referral_code: generatedCode,
          referred_by: referralCode
        });

      if (userError) {
        console.error('Error creating user in Supabase:', userError);
        return new Response(`Error creating user: ${userError.message}`, {
          status: 500
        });
      }

      // Initialize referral stats with zeros
      const { error: statsError } = await supabase
        .from('referral_stats')
        .insert({
          user_id: id,
          total_referrals: 0,
          completed_referrals: 0,
          pending_referrals: 0,
          total_rewards: 0
        });

      if (statsError) {
        console.error('Error initializing referral stats:', statsError);
        return new Response(`Error initializing referral stats: ${statsError.message}`, {
          status: 500
        });
      }

      if (referralCode) {
        // Check if referral code is valid
        const referrerId = await checkReferralCode(referralCode);
        
        if (referrerId) {
          // Create referral record
          await createReferral(referrerId, id);
        }
      }

      return new Response('User created successfully', { status: 200 });
    } catch (error) {
      console.error('Unexpected error in webhook handler:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
} 