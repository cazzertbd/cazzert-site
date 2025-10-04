import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  iconOnly = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";

  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-dark text-white focus:ring-primary/30",
    secondary:
      "bg-bg-alt border border-border/20 text-text-base hover:bg-bg focus:ring-primary/30",
    outline:
      "border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/30",
    ghost: "text-text-base hover:bg-bg focus:ring-primary/30",
  };

  // Different size classes for icon-only vs text buttons
  const sizeClasses = iconOnly
    ? {
        sm: "p-1.5 min-h-[32px] min-w-[32px]",
        md: "p-2 min-h-[36px] min-w-[36px]",
        lg: "p-3 min-h-[44px] min-w-[44px]",
      }
    : {
        sm: "px-3 py-1.5 text-sm min-h-[32px]",
        md: "px-4 py-2 text-sm min-h-[36px]",
        lg: "px-6 py-3 text-base min-h-[44px]",
      };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
