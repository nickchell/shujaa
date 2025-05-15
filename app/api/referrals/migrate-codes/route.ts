import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * API endpoint to migrate all existing referral codes to use the rafiki- prefix
 * This is a one-time migration script that should be run after updating the code
 */
export async function POST() {
  try {
    // Verify admin access - only the authenticated user can run this
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Get all users with referral codes that don't start with 'rafiki-'
    const { data: users, error: getUsersError } = await supabase
      .from('users')
      .select('id, referral_code')
      .not('referral_code', 'ilike', 'rafiki-%')
      .is('referral_code', 'not.null');
      
    if (getUsersError) {
      console.error('Error fetching users:', getUsersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    
    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users need migration', migrated: 0 });
    }
    
    console.log(`Found ${users.length} users with non-rafiki referral codes to migrate`);
    
    // Process updates in batches to avoid overwhelming the database
    const batchSize = 50;
    let successCount = 0;
    let errors = [];
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      for (const user of batch) {
        try {
          const oldCode = user.referral_code;
          const newCode = `rafiki-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          
          console.log(`Migrating user ${user.id}: ${oldCode} -> ${newCode}`);
          
          // Update the user's referral code
          const { error: updateError } = await supabase
            .from('users')
            .update({ referral_code: newCode })
            .eq('id', user.id);
            
          if (updateError) {
            console.error(`Error updating user ${user.id}:`, updateError);
            errors.push({ userId: user.id, error: updateError.message });
            continue;
          }
          
          // Update any references to this code in the referred_by column
          const { error: refError } = await supabase
            .from('users')
            .update({ referred_by: newCode })
            .eq('referred_by', oldCode);
            
          if (refError) {
            console.error(`Error updating references for ${user.id}:`, refError);
            errors.push({ userId: user.id, error: refError.message });
            continue;
          }
          
          successCount++;
        } catch (err) {
          console.error(`Error processing user ${user.id}:`, err);
          errors.push({ userId: user.id, error: err.message || 'Unknown error' });
        }
      }
    }
    
    return NextResponse.json({
      message: 'Migration completed',
      total: users.length,
      migrated: successCount,
      errors: errors.length > 0 ? errors : null
    });
    
  } catch (error) {
    console.error('Error in migration script:', error);
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 