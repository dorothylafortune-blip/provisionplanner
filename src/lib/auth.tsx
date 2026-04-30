// Authentication context — wraps the app so any component can call
// useAuth() to get the current user, session, loading state, and signOut.
//
// On mount, we subscribe to Supabase auth state changes (handles sign-in,
// sign-out, and token refresh) and also call getSession() to restore any
// existing session from localStorage.

import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  session: Session | null;
  user:    User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user:    null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialized = false;

    // Listen for future auth changes (sign-in, sign-out, token refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Only stop loading after getSession() resolves first, so we
      // don't flash the UI before the initial session check completes.
      if (initialized) setLoading(false);
    });

    // Restore existing session on page load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      initialized = true;
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user:    session?.user ?? null,
      loading,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
