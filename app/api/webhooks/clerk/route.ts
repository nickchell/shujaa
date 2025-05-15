import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { saveUserToSupabase } from '@/lib/supabase/save-user';

/**
 * Webhook handler for Clerk authentication events
 * Ensures user data is properly saved to Supabase when users sign up
 * Uses the saveUserToSupabase function to align with the schema
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers correctly based on the app's typing
  const headerData = await headers();
  const svix_id = headerData.get('svix-id');
  const svix_timestamp = headerData.get('svix-timestamp');
  const svix_signature = headerData.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

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

  // Handle the webhook events
  const eventType = evt.type;
  console.log(`Received webhook event: ${eventType}`);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    
    if (!id) {
      return new Response('Error: No user ID provided', { status: 400 });
    }

    try {
      console.log(`Creating user in Supabase with ID: ${id}`);
      console.log('User metadata:', unsafe_metadata);
      
      // Get the referral code from the user's metadata if it exists
      const referredBy = unsafe_metadata?.referredBy as string | undefined;
      
      // Save the user to Supabase using our utility function
      const result = await saveUserToSupabase({
        userId: id,
        email: email || '',
        firstName: first_name || '',
        lastName: last_name || '',
        fullName: `${first_name || ''} ${last_name || ''}`.trim(),
        imageUrl: image_url || '',
        referredBy: referredBy
      });

      console.log('User successfully saved to Supabase:', result);
      return NextResponse.json({ 
        message: result.message, 
        data: result.user 
      });
    } catch (error) {
      console.error('Error in webhook handler:', error);
      return new Response(`Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        { status: 500 });
    }
  }

  // Handle user updates
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    
    if (!id) {
      return new Response('Error: No user ID provided', { status: 400 });
    }

    try {
      console.log(`Updating user in Supabase with ID: ${id}`);
      
      // We'll use createClient directly for updates
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('users')
        .update({
          email: email || undefined,
          first_name: first_name || undefined,
          last_name: last_name || undefined,
          full_name: (first_name || last_name) ? `${first_name || ''} ${last_name || ''}`.trim() : undefined,
          avatar_url: image_url || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response(`Error updating user in Supabase: ${error.message}`, { status: 500 });
      }

      console.log('User successfully updated in Supabase:', data);
      return NextResponse.json({ 
        message: 'User updated successfully', 
        data: data 
      });
    } catch (error) {
      console.error('Error in webhook handler:', error);
      return new Response(`Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        { status: 500 });
    }
  }

  // Return a generic success response for other event types
  return new Response('Webhook processed successfully', { status: 200 });
} 