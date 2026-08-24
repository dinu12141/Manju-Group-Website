import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  if (
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/account"
  ) {
    window.location.href = "/login";
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const isMobileApp =
      window.location.protocol === "capacitor:" ||
      window.location.protocol === "file:" ||
      (window.location.hostname === "localhost" &&
        window.location.port !== "3000" &&
        window.location.port !== "5173");

    if (isMobileApp) {
      return "https://manjugroup.lk";
    }
  }
  return "";
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        const headers: Record<string, string> = {};
        try {
          const token = localStorage.getItem("supabase.auth.token");
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
          const adminToken = localStorage.getItem("manju_admin_token");
          if (adminToken) {
            headers["X-Admin-Token"] = adminToken;
          }
        } catch {
          // localStorage unavailable
        }
        return headers;
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
