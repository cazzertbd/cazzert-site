import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-text-base block text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
