import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://nzmbgnplggtdeqzndagd.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bWJnbnBsZ2d0ZGVxem5kYWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDc2NzYsImV4cCI6MjEwMzA4MzY3Nn0.BgTJ9p0PNaWdGZEK5zx2YVfnKrVyOE1_DPh8JMuv0pQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
