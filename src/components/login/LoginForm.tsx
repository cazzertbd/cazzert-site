import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect } from "react";
import { MdLockOutline, MdOutlineEmail } from "react-icons/md";
import { MessageAlert } from "./MessageAlert";

export default function LoginForm({ redirectTo = "/" }) {
  const { state, formAction, isPending } = useAstroAction(actions.auth.login);

  useEffect(() => {
    if (state?.data?.success && state?.data?.user) {
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(state.data.user));

      // Redirect after a short delay
      const timeout = setTimeout(() => {
        window.location.href = redirectTo;
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [state, redirectTo]);

  return (
    <div className="login-form bg-bg-alt/95 border-border/20 rounded-2xl border p-8 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            <MdLockOutline className="text-primary h-8 w-8" />
          </div>
        </div>
        <h1 className="text-text-base font-Secondary mb-2 text-3xl font-bold">
          Welcome Back
        </h1>
        <p className="text-text-muted text-sm">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={formAction} className="space-y-6">
        <MessageAlert
          type={state?.data?.success ? "success" : "error"}
          message={state?.data?.message}
          show={!!state?.data?.message}
          className="mb-6"
        />

        {/* Email Field */}
        <div className="form-group">
          <label
            htmlFor="email"
            className="text-text-base mb-2 block text-sm font-semibold"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MdOutlineEmail className="text-text-subtle h-5 w-5" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              className="bg-bg border-border/30 text-text-base focus:border-primary focus:ring-primary/20 placeholder:text-text-subtle block w-full rounded-xl border p-4 pl-12 transition-all duration-200 focus:ring-2 focus:outline-none"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label
            htmlFor="password"
            className="text-text-base mb-2 block text-sm font-semibold"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MdLockOutline className="text-text-subtle h-5 w-5" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="bg-bg border-border/30 text-text-base focus:border-primary focus:ring-primary/20 placeholder:text-text-subtle block w-full rounded-xl border p-4 pl-12 transition-all duration-200 focus:ring-2 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="mt-2 text-right">
            <a
              href="/forgot-password"
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="login-btn bg-primary hover:bg-primary-dark focus:ring-primary/30 group relative w-full cursor-pointer overflow-hidden rounded-xl px-6 py-4 font-semibold text-white transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
        >
          <div className="relative flex items-center justify-center gap-2">
            {isPending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>Signing you in...</span>
              </>
            ) : (
              <>
                <MdLockOutline className="h-5 w-5" />
                <span>Sign In</span>
              </>
            )}
          </div>
        </button>

        {/* Sign Up Link */}
        <div className="border-border/20 border-t pt-6 text-center">
          <p className="text-text-muted text-sm">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary hover:text-primary-dark font-semibold transition-colors hover:underline"
            >
              Create one here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
