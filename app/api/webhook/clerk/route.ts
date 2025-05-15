import { createAdminClient } from '@/app/lib/supabase/server-utils';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Add a GET method to test webhook connectivity
export async function GET() {
  console.log('GET request received at webhook endpoint');
  return NextResponse.json({ 
    status: 'Webhook endpoint is reachable',
    message: 'This endpoint is ready to receive Clerk webhooks',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  try {
    console.log('Webhook received at:', new Date().toISOString());
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    
    // Get the headers - properly await them
    const headersList = await headers();
    
    // Directly get the headers we need without iterating
    const svix_id = headersList.get('svix-id');
    const svix_timestamp = headersList.get('svix-timestamp');
    const svix_signature = headersList.get('svix-signature');

    // Safely log a few headers without iterating over all of them
    console.log('Webhook headers:', {
      svix_id,
      svix_timestamp,
      svix_signature: svix_signature ? 'present' : 'missing'
    });

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers:', { svix_id, svix_timestamp, svix_signature });
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Get the body
    let payload;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      payload = JSON.parse(rawBody);
      console.log('Webhook payload type:', payload.type);
      console.log('Webhook payload data:', {
        id: payload.data?.id,
        email: payload.data?.email_addresses?.[0]?.email_address,
        first_name: payload.data?.first_name,
        last_name: payload.data?.last_name
      });
    } catch (err) {
      console.error('Error parsing webhook payload:', err);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing CLERK_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
    }

    console.log('Webhook secret present:', !!webhookSecret);

    const wh = new Webhook(webhookSecret);

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
      return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
    }

    // Get the event type
    const eventType = evt.type;
    console.log('Processing webhook event:', eventType);

    // Initialize Supabase client
    let supabase;
    try {
      const client = await createAdminClient();
      if (!client) {
        console.error('Failed to initialize Supabase client: No client returned');
        return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
      }
      supabase = client;
      
      // Test the connection
      const { error: pingError } = await supabase.from('users').select('*').limit(1);
      if (pingError) {
        console.error('Error testing Supabase connection:', pingError);
        return NextResponse.json({ error: 'Database connection test failed' }, { status: 500 });
      }
    } catch (err) {
      console.error('Error initializing or testing Supabase client:', err);
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    try {
      switch (eventType) {
        case 'user.created':
        case 'user.updated': {
          const { id, email_addresses, first_name, last_name, image_url } = evt.data;
          const primaryEmail = email_addresses?.[0]?.email_address;
          console.log('Processing user data:', { id, primaryEmail, first_name, last_name });

          if (!id) {
            console.error('Missing user ID in webhook data');
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
          }

          // Check if user exists by ID or email
          let { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', id)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking existing user by ID:', checkError);
            throw checkError;
          }

          // If no user found by ID, check by email
          if (!existingUser && primaryEmail) {
            const { data: emailUser, error: emailCheckError } = await supabase
              .from('users')
              .select('id')
              .eq('email', primaryEmail)
              .maybeSingle();
            
            if (emailCheckError) {
              console.error('Error checking existing user by email:', emailCheckError);
              throw emailCheckError;
            }
            
            if (emailUser) {
              console.log('User already exists with this email:', primaryEmail);
              existingUser = emailUser;
              
              // Update related tables before updating the user ID
              try {
                // First update referral_stats if they exist
                const { error: updateReferralStatsError } = await supabase
                  .from('referral_stats')
                  .update({ user_id: id })
                  .eq('user_id', emailUser.id);
                
                if (updateReferralStatsError) {
                  console.warn('Error updating referral_stats:', updateReferralStatsError);
                  // Continue anyway - might not exist for this user
                }
                
                // Update any other related tables with foreign keys to users
                // For example, tasks, referrals, etc.
                const { error: updateTasksError } = await supabase
                  .from('tasks')
                  .update({ user_id: id })
                  .eq('user_id', emailUser.id);
                  
                if (updateTasksError) {
                  console.warn('Error updating tasks:', updateTasksError);
                  // Continue anyway
                }
                
                // Now update the user ID
                const { error: updateIdError } = await supabase
                  .from('users')
                  .update({ id: id })
                  .eq('id', emailUser.id);
                  
                if (updateIdError) {
                  // If we still get a foreign key error, just use the existing ID
                  if (updateIdError.code === '23503') {
                    console.warn('Foreign key constraint detected, using existing user ID instead of updating');
                    // Set the existingUser to use the current ID to avoid further update attempts
                    existingUser = { id: emailUser.id };
                  } else {
                    console.error('Error updating user ID:', updateIdError);
                    throw updateIdError;
                  }
                } else {
                  console.log('Updated user ID to match Clerk ID');
                }
              } catch (error) {
                console.error('Error during ID update process:', error);
                // If we failed to update the ID, just use the existing one
                existingUser = { id: emailUser.id };
              }
            }
          }

          console.log('Existing user check:', existingUser);

          // Prepare user data with only the fields we need
          const userData = {
            id: id,
            email: primaryEmail || null,
            first_name: first_name || null,
            last_name: last_name || null,
            full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
            avatar_url: image_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          if (existingUser) {
            // Update existing user
            const { error: updateError } = await supabase
              .from('users')
              .update({
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                full_name: userData.full_name,
                avatar_url: userData.avatar_url,
                updated_at: userData.updated_at
              })
              .eq('id', id);

            if (updateError) {
              console.error('Error updating user:', updateError);
              throw updateError;
            }
            console.log('User updated successfully');
          } else {
            // Create new user
            console.log('Attempting to create user with data:', userData);

            try {
              const { error: insertError } = await supabase
                .from('users')
                .insert([userData]);

              if (insertError) {
                // If we get a duplicate key error, the user already exists
                if (insertError.code === '23505' && insertError.message.includes('users_email_unique')) {
                  console.log('User with this email already exists, skipping creation');
                  
                  // Try to update the user with the Clerk ID
                  const { error: updateEmailUserError } = await supabase
                    .from('users')
                    .update({
                      id: id,
                      first_name: userData.first_name,
                      last_name: userData.last_name,
                      full_name: userData.full_name,
                      avatar_url: userData.avatar_url,
                      updated_at: userData.updated_at
                    })
                    .eq('email', primaryEmail);
                    
                  if (updateEmailUserError) {
                    console.error('Error updating existing user by email:', updateEmailUserError);
                    // Don't throw here, still return success
                    console.log('User already exists with this email, returning success anyway');
                    return NextResponse.json({ 
                      success: true, 
                      message: 'User already exists with this email'
                    });
                  } else {
                    console.log('Updated existing user with new Clerk data');
                    return NextResponse.json({ 
                      success: true, 
                      message: 'Updated existing user with new Clerk data'
                    });
                  }
                } else {
                  console.error('Error creating user:', insertError);
                  throw insertError;
                }
              } else {
                console.log('User created successfully');

                // Get task templates
                const { data: taskTemplates, error: templateError } = await supabase
                  .from('task_templates')
                  .select('*');

                if (templateError) {
                  console.error('Error fetching task templates:', templateError);
                  throw templateError;
                }

                // Create tasks for the new user from templates
                if (taskTemplates && taskTemplates.length > 0) {
                  const tasks = taskTemplates.map(template => ({
                    user_id: id,
                    title: template.title,
                    description: template.description,
                    reward: template.reward || 0,
                    type: template.task_type || 'general',
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    template_id: template.id
                  }));

                  console.log('Creating tasks for new user:', tasks);

                  const { error: tasksError } = await supabase
                    .from('tasks')
                    .insert(tasks)
                    .select();

                  if (tasksError) {
                    console.error('Error creating tasks:', tasksError);
                    console.error('Task creation failed but user was created');
                  } else {
                    console.log('Tasks created successfully for new user');
                  }
                } else {
                  console.log('No task templates found');
                }
              }
            } catch (error) {
              console.error('Error processing user creation:', error);
              return NextResponse.json({ error: 'Error processing user creation' }, { status: 500 });
            }
          }
          break;
        }

        case 'user.deleted': {
          const { id } = evt.data;
          if (!id) {
            console.error('Missing user ID in webhook data');
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
          }

          // Delete user
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

          if (deleteError) {
            console.error('Error deleting user:', deleteError);
            throw deleteError;
          }
          console.log('User deleted successfully');
          break;
        }

        default:
          console.log('Unhandled webhook event type:', eventType);
          return NextResponse.json({ error: 'Unhandled event type' }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ 
        error: 'Error processing webhook',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 