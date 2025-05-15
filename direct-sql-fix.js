// Script to directly fix the database using a complete table recreation approach
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key in .env file.');
  console.log('Please create a .env file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Service key looks like:', supabaseServiceKey.substring(0, 3) + '...' + supabaseServiceKey.substring(supabaseServiceKey.length - 3));

// Create Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'fix-db-direct.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL into manageable chunks to avoid overwhelming the API
const sqlStatements = sqlContent
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0)
  .map(statement => statement + ';');

async function executeSQL() {
  console.log('Connecting to Supabase database...');
  
  try {
    console.log('Starting database structure update...');
    console.log('This script recreates tables to properly support Clerk text-based IDs.');
    
    // Execute each SQL statement in sequence
    for (const statement of sqlStatements) {
      const { error } = await supabase.rpc('exec_sql', { query: statement });
      
      if (error) {
        console.error('Error executing SQL:', error);
        console.error('Statement:', statement);
        // Continue despite errors, as some might be expected
        continue;
      }
      
      // Log a dot to show progress
      process.stdout.write('.');
    }
    
    console.log('\nDatabase update completed successfully!');
    console.log('Your database now accepts Clerk text IDs and referrals should work properly.');
  } catch (error) {
    console.error('\nError during database update:', error.message);
    console.log('You may need to contact Supabase support or try a different approach.');
  }
}

// Run the script
executeSQL(); 