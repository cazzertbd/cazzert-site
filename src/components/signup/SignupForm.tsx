import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import { MdLockOutline, MdOutlineEmail, MdPersonOutline } from "react-icons/md";
import { MessageAlert } from "../login/MessageAlert";

export default function SignupForm() {
  const { state, formAction, isPending } = useAstroAction(actions.auth.signup);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (state?.data?.success) {
      const timeout = setTimeout(() => {
        window.location.href = "/login?message=Account created successfully";
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  const handlePasswordChange = (
    field: "password" | "confirmPassword",
    value: string,
  ) => {
    const newPasswords = { ...passwords, [field]: value };
    setPasswords(newPasswords);

    if (newPasswords.confirmPassword) {
      setPasswordMatch(newPasswords.password === newPasswords.confirmPassword);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (passwords.password !== passwords.confirmPassword) {
      e.preventDefault();
      setPasswordMatch(false);
      return;
    }
    formAction(e);
  };

  return (
    <div className="bg-bg-alt/95 border-border/20 rounded-2xl border p-8 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            <MdPersonOutline className="text-primary h-8 w-8" />
          </div>
        </div>
        <h1 className="text-text-base font-Secondary mb-2 text-3xl font-bold">
          Join Cazzert
        </h1>
        <p className="text-text-muted text-sm">
          Create your account to access exclusive features and custom orders
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <MessageAlert
          type={state?.data?.success ? "success" : "error"}
          message={state?.data?.message}
          show={!!state?.data?.message}
          className="mb-6"
        />

        {!passwordMatch && (
          <MessageAlert
            type="error"
            message="Passwords do not match"
            show={true}
            className="mb-6"
          />
        )}

        {/* Name Field */}
        <div className="form-group">
          <label
            htmlFor="name"
            className="text-text-base mb-2 block text-sm font-semibold"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MdPersonOutline className="text-text-subtle h-5 w-5" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              className="bg-bg border-border/30 text-text-base focus:border-primary focus:ring-primary/20 placeholder:text-text-subtle block w-full rounded-xl border p-4 pl-12 transition-all duration-200 focus:ring-2 focus:outline-none"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

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
              placeholder="john@example.com"
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
              minLength={8}
              onChange={(e) => handlePasswordChange("password", e.target.value)}
              required
            />
          </div>
          <p className="text-text-subtle mt-2 text-xs">
            At least 8 characters with letters and numbers
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="form-group">
          <label
            htmlFor="confirm-password"
            className="text-text-base mb-2 block text-sm font-semibold"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MdLockOutline className="text-text-subtle h-5 w-5" />
            </div>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              className={`bg-bg text-text-base focus:ring-primary/20 placeholder:text-text-subtle block w-full rounded-xl border p-4 pl-12 transition-all duration-200 focus:ring-2 focus:outline-none ${
                !passwordMatch
                  ? "border-red-300 focus:border-red-500"
                  : "border-border/30 focus:border-primary"
              }`}
              placeholder="••••••••"
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark focus:ring-primary/30 group relative w-full cursor-pointer overflow-hidden rounded-xl px-6 py-4 font-semibold text-white transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending || !passwordMatch}
        >
          <div className="relative flex items-center justify-center gap-2">
            {isPending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <MdPersonOutline className="h-5 w-5" />
                <span>Create Account</span>
              </>
            )}
          </div>
        </button>

        {/* Login Link */}
        <div className="border-border/20 border-t pt-6 text-center">
          <p className="text-text-muted text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:text-primary-dark font-semibold transition-colors hover:underline"
            >
              Sign in here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
