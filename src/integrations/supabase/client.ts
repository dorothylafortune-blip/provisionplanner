// Initializes and exports a single shared Supabase client.
// Credentials are read from environment variables at build time (Vite's
// import.meta.env). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase credentials. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
  );
}

// persistSession keeps the user logged in across page reloads.
// autoRefreshToken silently renews the JWT before it expires.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:          localStorage,
    persistSession:   true,
    autoRefreshToken: true,
  },
});
