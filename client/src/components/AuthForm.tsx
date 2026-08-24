import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Schemas ────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const createAccountSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please re-type your password"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please re-type your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignInValues = z.infer<typeof signInSchema>;
type CreateAccountValues = z.infer<typeof createAccountSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function fieldClass(hasError: boolean) {
  return `w-full h-11 pl-10 pr-4 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 bg-white focus:border-[#0F2D5E]"
  }`;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot_password" | "reset_password">("signin");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { refresh } = useAuth();
  const utils = trpc.useUtils();

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const createAccountForm = useForm<CreateAccountValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetPasswordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onAuthSuccess = async () => {
    await utils.auth.me.invalidate();
    await refresh();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for password reset token
    const token = params.get("reset_token");
    if (token) {
      setResetToken(token);
      setMode("reset_password");
      params.delete("reset_token");
      const query = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (query ? `?${query}` : ""));
      return;
    }

    const error = params.get("error");
    if (!error) return;

    if (error === "google_not_configured") {
      toast.error("Google Sign-In isn't configured yet on this server.");
    } else if (error === "google_auth_failed") {
      const reason = params.get("reason");
      toast.error(
        reason ? `Google Sign-In failed: ${reason}` : "Google Sign-In failed."
      );
    }

    params.delete("error");
    params.delete("reason");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : "")
    );
  }, []);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof TRPCClientError && error.message) {
      return error.message;
    }
    return fallback;
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Signed in successfully");
      await onAuthSuccess();
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Invalid email or password"));
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success("Account created successfully");
      await onAuthSuccess();
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Failed to create account"));
    },
  });

  const requestPasswordResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast.success("Password reset link generated!");
      if (data.link) {
        // Automatically set mode to reset_password for testing/demo purposes
        // In production, this would be sent to email
        toast.info(
          <div className="flex flex-col gap-2">
            <span>Click here to reset your password:</span>
            <a href={data.link} className="underline text-blue-500 break-all">{window.location.origin}{data.link}</a>
          </div>, 
          { duration: 15000 }
        );
      }
      setMode("signin");
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Failed to request password reset"));
    }
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password has been reset successfully! Please log in.");
      setMode("signin");
      setResetToken(null);
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Failed to reset password"));
    }
  });

  const handleSignIn = signInForm.handleSubmit(values => {
    loginMutation.mutate(values);
  });

  const handleCreateAccount = createAccountForm.handleSubmit(values => {
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  });

  const handleRequestPasswordReset = forgotPasswordForm.handleSubmit(values => {
    requestPasswordResetMutation.mutate(values);
  });

  const handleResetPassword = resetPasswordForm.handleSubmit(values => {
    if (!resetToken) {
      toast.error("No reset token found");
      return;
    }
    resetPasswordMutation.mutate({
      token: resetToken,
      password: values.password,
    });
  });

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
          {mode === "signin"
            ? "Sign In to Your Account"
            : mode === "signup"
            ? "Create Your Account"
            : mode === "forgot_password"
            ? "Forgot Password?"
            : "Reset Your Password"}
        </h1>
        <p className="text-gray-500 text-sm">
          {mode === "signin"
            ? "Access your order history, wishlist, and profile."
            : mode === "signup"
            ? "Join Manju Group to track orders and save favorites."
            : mode === "forgot_password"
            ? "Enter your email address and we'll send you a link to reset your password."
            : "Enter your new password below."}
        </p>
      </div>

      {(mode === "signin" || mode === "signup") && (
        <>
          {/* Google Sign-In */}
          <a
            href={`/api/oauth/google/start?redirect=/account`}
            className="w-full h-12 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2.5 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              or continue with email
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        </>
      )}

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className={fieldClass(!!signInForm.formState.errors.email)}
                {...signInForm.register("email")}
              />
            </div>
            {signInForm.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1.5">
                {signInForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                className={fieldClass(!!signInForm.formState.errors.password)}
                {...signInForm.register("password")}
              />
            </div>
            {signInForm.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1.5">
                {signInForm.formState.errors.password.message}
              </p>
            )}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setMode("forgot_password")}
                className="text-sm font-semibold hover:underline"
                style={{ color: "#0F2D5E" }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#F85606" }}
            onMouseEnter={e => {
              if (!loginMutation.isPending)
                e.currentTarget.style.backgroundColor = "#e04d00";
            }}
            onMouseLeave={e => {
              if (!loginMutation.isPending)
                e.currentTarget.style.backgroundColor = "#F85606";
            }}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-semibold hover:underline"
              style={{ color: "#0F2D5E" }}
            >
              Sign up
            </button>
          </p>
        </form>
      ) : mode === "signup" ? (
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <div className="relative">
              <UserIcon
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Full name"
                autoComplete="name"
                className={fieldClass(
                  !!createAccountForm.formState.errors.name
                )}
                {...createAccountForm.register("name")}
              />
            </div>
            {createAccountForm.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1.5">
                {createAccountForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className={fieldClass(
                  !!createAccountForm.formState.errors.email
                )}
                {...createAccountForm.register("email")}
              />
            </div>
            {createAccountForm.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1.5">
                {createAccountForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                className={fieldClass(
                  !!createAccountForm.formState.errors.password
                )}
                {...createAccountForm.register("password")}
              />
            </div>
            {createAccountForm.formState.errors.password ? (
              <p className="text-xs text-red-500 mt-1.5">
                {createAccountForm.formState.errors.password.message}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">
                Must be at least 8 characters.
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                placeholder="Re-type password"
                autoComplete="new-password"
                className={fieldClass(
                  !!createAccountForm.formState.errors.confirmPassword
                )}
                {...createAccountForm.register("confirmPassword")}
              />
            </div>
            {createAccountForm.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1.5">
                {createAccountForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#F85606" }}
            onMouseEnter={e => {
              if (!registerMutation.isPending)
                e.currentTarget.style.backgroundColor = "#e04d00";
            }}
            onMouseLeave={e => {
              if (!registerMutation.isPending)
                e.currentTarget.style.backgroundColor = "#F85606";
            }}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-semibold hover:underline"
              style={{ color: "#0F2D5E" }}
            >
              Sign in
            </button>
          </p>
        </form>
      ) : mode === "forgot_password" ? (
        <form onSubmit={handleRequestPasswordReset} className="space-y-4">
          <div>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className={fieldClass(
                  !!forgotPasswordForm.formState.errors.email
                )}
                {...forgotPasswordForm.register("email")}
              />
            </div>
            {forgotPasswordForm.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1.5">
                {forgotPasswordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={requestPasswordResetMutation.isPending}
            className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#0F2D5E" }}
            onMouseEnter={e => {
              if (!requestPasswordResetMutation.isPending)
                e.currentTarget.style.backgroundColor = "#0a2046";
            }}
            onMouseLeave={e => {
              if (!requestPasswordResetMutation.isPending)
                e.currentTarget.style.backgroundColor = "#0F2D5E";
            }}
          >
            {requestPasswordResetMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-semibold hover:underline"
              style={{ color: "#0F2D5E" }}
            >
              Back to sign in
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                className={fieldClass(
                  !!resetPasswordForm.formState.errors.password
                )}
                {...resetPasswordForm.register("password")}
              />
            </div>
            {resetPasswordForm.formState.errors.password ? (
              <p className="text-xs text-red-500 mt-1.5">
                {resetPasswordForm.formState.errors.password.message}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">
                Must be at least 8 characters.
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                placeholder="Re-type new password"
                autoComplete="new-password"
                className={fieldClass(
                  !!resetPasswordForm.formState.errors.confirmPassword
                )}
                {...resetPasswordForm.register("confirmPassword")}
              />
            </div>
            {resetPasswordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1.5">
                {resetPasswordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#0F2D5E" }}
            onMouseEnter={e => {
              if (!resetPasswordMutation.isPending)
                e.currentTarget.style.backgroundColor = "#0a2046";
            }}
            onMouseLeave={e => {
              if (!resetPasswordMutation.isPending)
                e.currentTarget.style.backgroundColor = "#0F2D5E";
            }}
          >
            {resetPasswordMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        By signing in, you agree to our{" "}
        <span className="text-[#0F2D5E] hover:underline cursor-pointer">
          Terms of Service
        </span>{" "}
        and{" "}
        <span className="text-[#0F2D5E] hover:underline cursor-pointer">
          Privacy Policy
        </span>
        .
      </p>
    </div>
  );
}
