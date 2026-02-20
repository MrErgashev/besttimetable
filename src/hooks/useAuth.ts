"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { AppUser } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("app_users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          setState((s) => ({ ...s, error: error.message }));
          return;
        }

        if (data) {
          const row = data as Record<string, unknown>;
          setState((s) => ({
            ...s,
            profile: {
              id: row.id as string,
              email: row.email as string,
              full_name: (row.full_name as string) || "",
              role: (row.role as AppUser["role"]) || "student",
              department_id: (row.department_id as string) || undefined,
              telegram_chat_id: (row.telegram_chat_id as string) || undefined,
              created_at: row.created_at as string,
            },
          }));
        }
      } catch {
        // Supabase ulanmagan bo'lsa xatolik bo'lmasligi uchun
      }
    },
    [supabase]
  );

  // Sessiya tinglash
  useEffect(() => {
    // Boshlang'ich sessiya
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState((s) => ({ ...s, user: session.user, loading: false }));
        fetchProfile(session.user.id);
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    // Auth o'zgarishlarini tinglash
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState((s) => ({ ...s, user: session.user, loading: false }));
        fetchProfile(session.user.id);
      } else {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  // Login
  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setState((s) => ({ ...s, loading: false, error: error.message }));
        return false;
      }
      return true;
    },
    [supabase]
  );

  // Register
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: string = "student"
    ) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });
      if (error) {
        setState((s) => ({ ...s, loading: false, error: error.message }));
        return false;
      }
      setState((s) => ({ ...s, loading: false }));
      return true;
    },
    [supabase]
  );

  // Logout
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, loading: false, error: null });
  }, [supabase]);

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    isAdmin:
      state.profile?.role === "admin" ||
      state.profile?.role === "super_admin",
    isSuperAdmin: state.profile?.role === "super_admin",
    isTeacher: state.profile?.role === "teacher",
    isStudent: state.profile?.role === "student",
  };
}
