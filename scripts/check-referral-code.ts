import { createClient } from '../lib/supabase/server';

async function checkReferralCode(code: string) {
  console.log(`Checking referral code: ${code}`);
  
  const supabase = createClient();
  
  // Try exact match first
  console.log('\nTrying exact match...');
  const { data: exactMatch, error: exactError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, referral_code')
    .eq('referral_code', code)
    .maybeSingle();
    
  console.log('Exact match result:', { data: exactMatch, error: exactError });
  
  // Try case-insensitive match
  console.log('\nTrying case-insensitive match...');
  const { data: ciMatch, error: ciError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, referral_code')
    .ilike('referral_code', code)
    .maybeSingle();
    
  console.log('Case-insensitive match result:', { data: ciMatch, error: ciError });
  
  // Try with just the code part (without prefix)
  const codeWithoutPrefix = code.includes('-') ? code.split('-')[1] : code;
  console.log(`\nTrying with code part only: ${codeWithoutPrefix}`);
  
  const { data: partialMatch, error: partialError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, referral_code')
    .or(`referral_code.eq.${codeWithoutPrefix},referral_code.ilike.%${codeWithoutPrefix}%`)
    .maybeSingle();
    
  console.log('Partial match result:', { data: partialMatch, error: partialError });
  
  // List all referral codes in the database for debugging
  console.log('\nListing all referral codes in the database...');
  const { data: allCodes, error: allCodesError } = await supabase
    .from('users')
    .select('referral_code')
    .not('referral_code', 'is', null);
    
  console.log('All referral codes in database:', allCodes?.map(u => u.referral_code));
  
  return {
    exactMatch,
    ciMatch,
    partialMatch,
    allCodes: allCodes?.map(u => u.referral_code) || []
  };
}

// Get the code from command line arguments or use the default
const codeToCheck = process.argv[2] || 'rafiki-ntrx939v';

checkReferralCode(codeToCheck)
  .then(() => {
    console.log('\nCheck complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error checking referral code:', error);
    process.exit(1);
  });
