#!/usr/bin/env node

import { execSync } from 'child_process';
import { loadEnvConfig } from '@next/env';
import { resolve } from 'path';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Check if Supabase is running, if not start it
console.log('Checking if Supabase is running...');
try {
  execSync('docker ps | grep supabase', { stdio: 'pipe' });
  console.log('Supabase is already running');
} catch (error) {
  console.log('Starting Supabase...');
  execSync('npx supabase start', { stdio: 'inherit' });
}

// Run migrations
console.log('Running database migrations...');
try {
  execSync('npx supabase db push', { stdio: 'inherit' });
  console.log('Migrations applied successfully');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
}

// Restart the Supabase instance to apply changes
console.log('Restarting Supabase to apply changes...');
try {
  execSync('npx supabase stop', { stdio: 'inherit' });
  execSync('npx supabase start', { stdio: 'inherit' });
  console.log('Supabase restarted successfully');
} catch (error) {
  console.error('Error restarting Supabase:', error);
  process.exit(1);
}

console.log('All done!');
