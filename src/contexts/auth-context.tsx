"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  signInWithBackend,
  type LoginResult,
} from "@/lib/auth/login";
import {
  registerWithProfile,
  type RegisterProfileInput,
  type RegisterProfileResult,
} from "@/lib/auth/registerWithProfile";

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  /** Supabase sign-in + POST /api/auth/login — returns role and redirect path. */
  signIn: (email: string, password: string) => Promise<LoginResult>;
  signOut: () => Promise<void>;
  register: (input: RegisterProfileInput) => Promise<RegisterProfileResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const clientRef = useRef<SupabaseClient | null>(null);

  const getClient = useCallback((): SupabaseClient => {
    if (!clientRef.current) {
      clientRef.current = getSupabaseBrowserClient();
    }
    return clientRef.current;
  }, []);

  useEffect(() => {
    const supabase = getClient();

    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session: next }, error }) => {
      if (cancelled) {
        return;
      }
      if (error) {
        console.error(error);
      }
      setSession(next ?? null);
      setIsInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [getClient]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      return signInWithBackend(getClient(), email, password);
    },
    [getClient],
  );

  const signOut = useCallback(async () => {
    const supabase = getClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }, [getClient]);

  const register = useCallback(
    async (input: RegisterProfileInput) => {
      return registerWithProfile(getClient(), input);
    },
    [getClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isInitialized,
      signIn,
      signOut,
      register,
    }),
    [session, isInitialized, signIn, signOut, register],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
