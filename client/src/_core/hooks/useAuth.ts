import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const [supabaseUser, setSupabaseUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("manus-runtime-user-info");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (error: unknown) {
      console.error("Logout failed:", error);
    } finally {
      try {
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("manus-runtime-user-info");
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      setSupabaseUser(null);
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      setIsLoggingOut(false);
    }
  }, [utils]);

  // Sync Supabase Auth session with local state and trpc
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        if (session.access_token) {
          localStorage.setItem("supabase.auth.token", session.access_token);
        }
        utils.auth.me.invalidate();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        if (session.access_token) {
          localStorage.setItem("supabase.auth.token", session.access_token);
        }
        await utils.auth.me.invalidate();
      } else if (event === "SIGNED_OUT") {
        setSupabaseUser(null);
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("manus-runtime-user-info");
        utils.auth.me.setData(undefined, null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [utils]);

  const state = useMemo(() => {
    const currentUser =
      meQuery.data ??
      (supabaseUser
        ? {
            id: 0,
            openId: supabaseUser.id || "",
            name:
              supabaseUser.user_metadata?.full_name ||
              supabaseUser.email?.split("@")[0] ||
              "User",
            email: supabaseUser.email || "",
            phone: supabaseUser.phone || "",
            role: "user" as const,
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
            loginMethod: "supabase",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          }
        : null);

    if (currentUser) {
      try {
        localStorage.setItem(
          "manus-runtime-user-info",
          JSON.stringify(currentUser)
        );
      } catch {}
    }

    return {
      user: currentUser,
      loading: (meQuery.isLoading && !supabaseUser) || isLoggingOut,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(currentUser),
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading, supabaseUser, isLoggingOut]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || isLoggingOut) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    isLoggingOut,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
