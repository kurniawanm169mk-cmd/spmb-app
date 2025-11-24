import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtrkxjuyxalrfycmuihw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0cmt4anV5eGFscmZ5Y211aWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDAwMzUsImV4cCI6MjA3OTUxNjAzNX0.gkvzSenx4RH_wYYkb1_sQ4XfSbxmDlm9C0lhme9bQL0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
