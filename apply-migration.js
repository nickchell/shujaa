// Script to apply the migration directly to Supabase
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key. Make sure these are in your .env file.');
  process.exit(1);
}

// Create Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Read the SQL migration file
const migrationFilePath = path.join(__dirname, 'supabase', 'migrations', '20240401000000_update_users_table_for_clerk.sql');
const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');

async function applyMigration() {
  console.log('Connecting to Supabase...');
  
  try {
    console.log('Applying migration...');
    
    // Execute the SQL as a prepared statement
    const { error } = await supabase.rpc('exec_sql', { query: sqlContent });
    
    if (error) {
      console.error('Error applying migration:', error);
      return;
    }
    
    console.log('Migration applied successfully! The database now accepts Clerk text IDs.');
  } catch (error) {
    console.error('Error during migration:', error.message);
  }
}

applyMigration(); 