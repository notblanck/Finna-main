"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { finnaApi } from "@/lib/api";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hszljstojfizjehqkhzk.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzemxqc3RvamZpemplaHFraHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMjAsImV4cCI6MjEwMzk0NzIyMH0.XUcYD0M5zLV0LeGNBtP8YbREipS6sY0AEQg0a10sPDA";

// --------------------------------
// Types and Enums
// --------------------------------

enum AuthView {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
  RESET_SUCCESS = "reset-success",
}

interface AuthState {
  view: AuthView;
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  successMessage?: string | null;
  showPassword: boolean;
}

// --------------------------------
// Schemas
// --------------------------------

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// --------------------------------
// Main Auth Component
// --------------------------------

interface AuthProps extends React.ComponentProps<"div"> {
  redirectTo?: string;
  onSuccess?: (user: any, token: string) => void;
}

function Auth({ className, redirectTo = "/dashboard", onSuccess, ...props }: AuthProps) {
  const [state, setState] = React.useState<AuthState>({ view: AuthView.SIGN_IN });

  const setView = React.useCallback((view: AuthView) => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  const handleAuthSuccess = React.useCallback((user: any, token: string) => {
    finnaApi.setAuthToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem("finna_token", token);
      localStorage.setItem("finna_user", JSON.stringify(user));
    }
    if (onSuccess) {
      onSuccess(user, token);
    } else {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = redirectTo;
        }
      }, 500);
    }
  }, [onSuccess, redirectTo]);

  return (
    <div
      data-slot="auth"
      className={cn("mx-auto w-full max-w-md", className)}
      {...props}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {state.view === AuthView.SIGN_IN && (
              <AuthSignIn
                key="sign-in"
                onForgotPassword={() => setView(AuthView.FORGOT_PASSWORD)}
                onSignUp={() => setView(AuthView.SIGN_UP)}
                onSuccess={handleAuthSuccess}
              />
            )}
            {state.view === AuthView.SIGN_UP && (
              <AuthSignUp
                key="sign-up"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSuccess={handleAuthSuccess}
              />
            )}
            {state.view === AuthView.FORGOT_PASSWORD && (
              <AuthForgotPassword
                key="forgot-password"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSuccess={() => setView(AuthView.RESET_SUCCESS)}
              />
            )}
            {state.view === AuthView.RESET_SUCCESS && (
              <AuthResetSuccess
                key="reset-success"
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --------------------------------
// Shared Components
// --------------------------------

interface AuthFormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

function AuthForm<T>({ onSubmit, children, className }: AuthFormProps<T>) {
  return (
    <form
      onSubmit={onSubmit}
      data-slot="auth-form"
      className={cn("space-y-6", className)}
    >
      {children}
    </form>
  );
}

interface AuthErrorProps {
  message: string | null;
}

function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  return (
    <div
      data-slot="auth-error"
      className="mb-6 animate-in rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

interface AuthSocialButtonsProps {
  isLoading: boolean;
  onGoogleClick?: () => void;
}

function AuthSocialButtons({ isLoading, onGoogleClick }: AuthSocialButtonsProps) {
  return (
    <div data-slot="auth-social-buttons" className="w-full mt-6">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 bg-background/50 border-border/50 hover:bg-accent cursor-pointer"
        disabled={isLoading}
        onClick={onGoogleClick}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Google
      </Button>
    </div>
  );
}

interface AuthSeparatorProps {
  text?: string;
}

function AuthSeparator({ text = "Or continue with" }: AuthSeparatorProps) {
  return (
    <div data-slot="auth-separator" className="relative mt-6">
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

// --------------------------------
// Sign In Component
// --------------------------------

interface AuthSignInProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSuccess?: (user: any, token: string) => void;
}

function AuthSignIn({ onForgotPassword, onSignUp, onSuccess }: AuthSignInProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Direct Supabase Auth SignIn with Password
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error_description || result.msg || "Invalid email or password");
      }

      const user = {
        id: result.user?.id || `user-${Date.now()}`,
        email: result.user?.email || data.email,
        full_name: result.user?.user_metadata?.full_name || data.email.split("@")[0],
        preferred_language: "en",
      };

      if (onSuccess) {
        onSuccess(user, result.access_token || `token-${Date.now()}`);
      }
    } catch (err: any) {
      setFormState((prev) => ({
        ...prev,
        error: err.message || "Invalid email or password",
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleGoogleSignIn = () => {
    if (typeof window !== "undefined") {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    }
  };

  const handleDemoSignIn = () => {
    const demoUser = {
      id: "demo-rider-001",
      email: "rider.demo@finna.ai",
      full_name: "Aakash Verma (Gig Partner)",
      preferred_language: "en",
    };
    if (onSuccess) {
      onSuccess(demoUser, "finna-demo-token-12345");
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm<SignInFormValues> onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={onForgotPassword}
              disabled={formState.isLoading}
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(errors.password && "border-destructive")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full hover:bg-transparent"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} onGoogleClick={handleGoogleSignIn} />

      <div className="mt-3">
        <Button
          type="button"
          variant="secondary"
          className="w-full h-10 text-xs font-mono bg-[#f5f5f5] text-black border border-[#e5e5e5] hover:bg-[#e5e5e5] cursor-pointer"
          onClick={handleDemoSignIn}
          disabled={formState.isLoading}
        >
          ⚡ Fast Demo Sign-in (Aakash Verma)
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-semibold text-foreground cursor-pointer"
          onClick={onSignUp}
          disabled={formState.isLoading}
        >
          Create one
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Sign Up Component
// --------------------------------

interface AuthSignUpProps {
  onSignIn: () => void;
  onSuccess?: (user: any, token: string) => void;
}

function AuthSignUp({ onSignIn, onSuccess }: AuthSignUpProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });

  const terms = watch("terms");

  const onSubmit = async (data: SignUpFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Call Supabase Auth SignUp
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          data: {
            full_name: data.name,
            preferred_language: "en",
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error_description || result.msg || result.message || "Failed to create account");
      }

      const user = {
        id: result.user?.id || `user-${Date.now()}`,
        email: result.user?.email || data.email,
        full_name: data.name,
        preferred_language: "en",
      };

      if (onSuccess) {
        onSuccess(user, result.access_token || `token-${Date.now()}`);
      }
    } catch (err: any) {
      setFormState((prev) => ({
        ...prev,
        error: err.message || "An unexpected error occurred",
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Get started with your account</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm<SignUpFormValues> onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={formState.isLoading}
            className={cn(errors.name && "border-destructive")}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(errors.password && "border-destructive")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full hover:bg-transparent"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={terms}
            onCheckedChange={(checked) => setValue("terms", checked === true)}
            disabled={formState.isLoading}
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="text-xs">
              I agree to the terms
            </Label>
            <p className="text-[11px] text-muted-foreground">
              By signing up, you agree to our{" "}
              <Button variant="link" className="h-auto p-0 text-[11px]">
                Terms
              </Button>{" "}
              and{" "}
              <Button variant="link" className="h-auto p-0 text-[11px]">
                Privacy Policy
              </Button>
              .
            </p>
          </div>
        </div>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}

        <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-semibold text-foreground cursor-pointer"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Forgot Password Component
// --------------------------------

interface AuthForgotPasswordProps {
  onSignIn: () => void;
  onSuccess: () => void;
}

function AuthForgotPassword({ onSignIn, onSuccess }: AuthForgotPasswordProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error_description || result.msg || "Failed to send reset link");
      }

      onSuccess();
    } catch (err: any) {
      setFormState((prev) => ({
        ...prev,
        error: err.message || "An unexpected error occurred",
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4"
        onClick={onSignIn}
        disabled={formState.isLoading}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email to receive a reset link
        </p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm<ForgotPasswordFormValues> onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-semibold text-foreground cursor-pointer"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Reset Success Component
// --------------------------------

interface AuthResetSuccessProps {
  onSignIn: () => void;
}

function AuthResetSuccess({ onSignIn }: AuthResetSuccessProps) {
  return (
    <motion.div
      data-slot="auth-reset-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center p-8 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a password reset link to your email.
      </p>

      <Button
        variant="outline"
        className="mt-6 w-full max-w-xs"
        onClick={onSignIn}
      >
        Back to sign in
      </Button>

      <p className="mt-6 text-xs text-muted-foreground">
        No email? Check spam or{" "}
        <Button variant="link" className="h-auto p-0 text-xs" onClick={onSignIn}>
          try another email
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Exports
// --------------------------------

export {
  Auth,
  AuthSignIn,
  AuthSignUp,
  AuthForgotPassword,
  AuthResetSuccess,
  AuthForm,
  AuthError,
  AuthSocialButtons,
  AuthSeparator,
};
