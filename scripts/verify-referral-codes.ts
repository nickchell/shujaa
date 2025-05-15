import { createClient } from '@/lib/supabase/client';
import { config } from '@/lib/config';

type User = {
  id: string;
  email: string | null;
  referral_code: string | null;
  created_at: string;
};

/**
 * Script to verify and report on the state of referral codes in the database
 */
async function verifyReferralCodes() {
  try {
    console.log('Starting verification of referral codes...');
    const supabase = createClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error getting session:', sessionError?.message || 'No active session');
      console.log('Please make sure you are logged in with sufficient permissions');
      process.exit(1);
    }

    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, referral_code, created_at')
      .order('created_at', { ascending: true }) as { data: User[] | null; error: any };

    if (error) {
      console.error('Error fetching users:', error);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log(`\nFound ${users.length} users in the database.`);
    
    // Analyze referral codes
    let validCount = 0;
    let missingCount = 0;
    let invalidPrefixCount = 0;
    const invalidUsers: Array<{id: string, email: string, referral_code: string | null}> = [];
    
    for (const user of users) {
      const userEmail = user.email || 'no-email';
      
      if (!user.referral_code) {
        missingCount++;
        invalidUsers.push({
          id: user.id,
          email: userEmail,
          referral_code: null
        });
      } else if (typeof user.referral_code === 'string' && !user.referral_code.startsWith(config.referralCodePrefix)) {
        invalidPrefixCount++;
        invalidUsers.push({
          id: user.id,
          email: userEmail,
          referral_code: user.referral_code
        });
      } else {
        validCount++;
      }
    }
    
    // Print summary
    console.log('\n=== Referral Code Analysis ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Valid referral codes: ${validCount} (${(validCount / users.length * 100).toFixed(1)}%)`);
    console.log(`Missing referral codes: ${missingCount} (${(missingCount / users.length * 100).toFixed(1)}%)`);
    console.log(`Invalid prefix: ${invalidPrefixCount} (${(invalidPrefixCount / users.length * 100).toFixed(1)}%)`);
    
    if (invalidUsers.length > 0) {
      console.log('\n=== Users with Issues ===');
      console.table(invalidUsers);
      
      console.log('\nRun the following migration to fix these issues:');
      console.log('npm run supabase db push');
    } else {
      console.log('\nAll users have valid referral codes! 🎉');
    }
    
  } catch (error) {
    console.error('Error in verifyReferralCodes:', error);
    process.exit(1);
  }
}

// Run the verification
verifyReferralCodes();
