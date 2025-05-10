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
    return new Response('Error occured -- no svix headers', {
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
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, ...attributes } = evt.data;
    const email = email_addresses?.[0]?.email_address;

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
    console.log('Referral code from URL:', url.searchParams.get('ref'));
    console.log('Referral code from cookie:', referralCode);
    console.log('Referral code used:', referralCode);

    // Generate a unique referral code
    const generatedCode = `shuj-${id.substring(0, 4)}${Math.floor(Math.random() * 10000)}`;
    console.log('Generated referral code:', generatedCode);

    // Create user in Supabase with the generated referral code
    const supabase = createClient();
    console.log('Creating user in Supabase...');
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
      return new Response('Error creating user', {
        status: 500
      });
    }

    console.log('User created successfully with referral code:', generatedCode);

    // Initialize referral stats with zeros
    console.log('Initializing referral stats...');
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
      return new Response('Error initializing referral stats', {
        status: 500
      });
    }

    console.log('Referral stats initialized successfully');

    if (referralCode) {
      // Check if referral code is valid
      console.log('Processing referral code:', referralCode);
      const referrerId = await checkReferralCode(referralCode);
      
      if (referrerId) {
        console.log('Creating referral record for referrer:', referrerId);
        // Create referral record
        await createReferral(referrerId, id);
      } else {
        console.log('Invalid referral code:', referralCode);
      }
    }

    console.log('Webhook user data:', evt.data);
    if (!id || !email) {
      console.error('Missing user id or email:', { id, email });
      return new Response('Missing user id or email', { status: 400 });
    }
  }

  return new Response('', { status: 200 });
} 