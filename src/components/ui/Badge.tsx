import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "bestseller"
    | "new"
    | "limited"
    | "seasonal"
    | "featured";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  dot = false,
  pulse = false,
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center font-semibold rounded-full " +
    "whitespace-nowrap select-none";

  const pulseClass = pulse ? "animate-pulse" : "";

  const variantClasses = {
    // Using the darker colors as default, no hover effects
    default:
      "bg-slate-700 text-white " + "dark:bg-slate-200 dark:text-slate-900",

    primary: "bg-blue-700 text-white " + "dark:bg-blue-300 dark:text-blue-900",

    secondary:
      "bg-gray-700 text-white " + "dark:bg-gray-300 dark:text-gray-900",

    success:
      "bg-green-700 text-white " + "dark:bg-green-300 dark:text-green-900",

    warning:
      "bg-amber-700 text-white " + "dark:bg-amber-300 dark:text-amber-900",

    danger: "bg-red-700 text-white " + "dark:bg-red-300 dark:text-red-900",

    info: "bg-sky-700 text-white " + "dark:bg-sky-300 dark:text-sky-900",

    // Product badges with strong colors, no hover effects
    bestseller:
      "bg-yellow-700 text-white shadow-xl border-2 border-yellow-700 font-bold " +
      "dark:bg-yellow-300 dark:text-yellow-900 dark:border-yellow-500",

    new:
      "bg-emerald-700 text-white shadow-xl border-2 border-emerald-700 font-bold " +
      "dark:bg-emerald-300 dark:text-emerald-900 dark:border-emerald-500",

    limited:
      "bg-red-700 text-white shadow-xl border-2 border-red-700 font-bold " +
      "dark:bg-red-300 dark:text-red-900 dark:border-red-500",

    seasonal:
      "bg-purple-700 text-white shadow-xl border-2 border-purple-700 font-bold " +
      "dark:bg-purple-300 dark:text-purple-900 dark:border-purple-500",

    featured:
      "bg-indigo-700 text-white shadow-xl border-2 border-indigo-700 font-bold " +
      "dark:bg-indigo-300 dark:text-indigo-900 dark:border-indigo-500",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs min-h-[20px] gap-1",
    sm: "px-2.5 py-1 text-xs min-h-[22px] gap-1",
    md: "px-3 py-1.5 text-sm min-h-[26px] gap-1.5",
    lg: "px-4 py-2 text-base min-h-[32px] gap-2",
  };

  const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${pulseClass} ${className}`}
    >
      {dot && (
        <span
          className={`${dotSizes[size]} flex-shrink-0 rounded-full bg-white/80`}
        />
      )}
      <span className="leading-none">{children}</span>
    </span>
  );
}

// Helper function to get the right variant for product badges
export function getProductBadgeVariant(badge: string): BadgeProps["variant"] {
  switch (badge) {
    case "BESTSELLER":
      return "bestseller";
    case "NEW":
      return "new";
    case "LIMITED":
      return "limited";
    case "SEASONAL":
      return "seasonal";
    case "FEATURED":
      return "featured";
    default:
      return "default";
  }
}

// Helper function to get stock badge variant
export function getStockBadgeVariant(stock?: number): {
  variant: BadgeProps["variant"];
  text: string;
  pulse?: boolean;
} {
  if (stock === undefined || stock === null) {
    return { variant: "secondary", text: "Unlimited" };
  }
  if (stock === 0) {
    return { variant: "danger", text: "Out of Stock", pulse: true };
  }
  if (stock <= 5) {
    return { variant: "warning", text: `${stock} left`, pulse: true };
  }
  if (stock <= 10) {
    return { variant: "warning", text: `${stock} left` };
  }
  return { variant: "success", text: `${stock} in stock` };
}
