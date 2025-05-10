import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for webhook
);

export async function POST(req: Request) {
  console.log('Webhook received');
  
  // Get the headers
  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  console.log('Headers:', { svix_id, svix_timestamp, svix_signature });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing required headers');
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  console.log('Webhook payload:', payload);

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
    console.log('Webhook verified successfully');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('Webhook event type:', eventType);
  console.log('Webhook event data:', evt.data);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    console.log('Processing user data:', {
      id,
      email: primaryEmail,
      first_name,
      last_name,
      image_url
    });

    if (!primaryEmail) {
      console.error('No email found for user:', id);
      return new Response('No email found', { status: 400 });
    }

    try {
      // Check if user exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing user:', selectError);
        throw selectError;
      }

      console.log('Existing user check:', { existingUser });

      const userData = {
        clerk_id: id,
        email: primaryEmail,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatar_url: image_url,
        email_verified: email_addresses?.[0]?.verification?.status === 'verified',
        updated_at: new Date().toISOString()
      };

      console.log('Prepared user data:', userData);

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('clerk_id', id);

        if (updateError) {
          console.error('Error updating user:', updateError);
          throw updateError;
        }
        console.log('Updated user in Supabase:', id);
      } else {
        // Insert new user
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ ...userData, created_at: new Date().toISOString() }]);

        if (insertError) {
          console.error('Error inserting user:', insertError);
          throw insertError;
        }
        console.log('Created user in Supabase:', id);
      }

      return new Response('Success', { status: 200 });
    } catch (error) {
      console.error('Error syncing user with Supabase:', error);
      return new Response('Error syncing user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      const { id } = evt.data;
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      console.log('Deleted user from Supabase:', id);
      return new Response('Success', { status: 200 });
    } catch (error) {
      console.error('Error deleting user from Supabase:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
} 