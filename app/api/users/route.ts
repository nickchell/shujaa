import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ success: true, message: 'User already exists' });
    }

    // Create user
    const { error } = await supabase
      .from('users')
      .insert([{ 
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error in user creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 