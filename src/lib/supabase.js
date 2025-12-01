import { createClient } from '@supabase/supabase-js';

// Supabase Configuration - Direct credentials (no .env needed)
const supabaseUrl = 'https://qrlqnmyrxsizdlnvyili.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybHFubXlyeHNpemRsbnZ5aWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTk2NzQsImV4cCI6MjA3OTg5NTY3NH0.ETrv8lkRGEe4WBaO1mF8koZQvIUEzs19oXQ4RaIgB2w';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client - this is the main connection to your database
// This client is used for all database operations (read, write, auth, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

