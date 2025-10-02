import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Only create client if we have real environment variables
export const supabase = supabaseUrl !== "https://placeholder.supabase.co" 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;


