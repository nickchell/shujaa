import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    // Ensure only authenticated users can run this
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Read the SQL file with the trigger definition
    const triggerFilePath = path.join(process.cwd(), 'lib', 'supabase', 'normalize-trigger.sql');
    let triggerSql;
    
    try {
      triggerSql = fs.readFileSync(triggerFilePath, 'utf8');
    } catch (readError) {
      console.error('Error reading trigger file:', readError);
      return NextResponse.json({ 
        error: 'Failed to read trigger definition file',
        details: readError instanceof Error ? readError.message : String(readError)
      }, { status: 500 });
    }
    
    // Apply the SQL using Supabase's RPCÀ functionality
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql_query: triggerSql
    });
    
    if (rpcError) {
      // If the RPC method doesn't exist, try an alternative approach with direct SQL
      console.log('RPC method not available, falling back to direct SQL execution');
      
      // Break the SQL into separate statements and execute them
      const statements = triggerSql.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        const { error } = await supabase.from('_exec_sql').insert({ 
          query: `${statement};` 
        });
        
        if (error) {
          console.error('Error executing SQL statement:', error);
          return NextResponse.json({ 
            error: 'Failed to execute SQL trigger installation',
            details: error.message
          }, { status: 500 });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Referral code normalization trigger installed successfully'
    });
  } catch (error) {
    console.error('Error installing trigger:', error);
    return NextResponse.json(
      { 
        error: 'Failed to install trigger', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 