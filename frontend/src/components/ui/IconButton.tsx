import type { ButtonHTMLAttributes, ReactNode } from "react";

export const IconButton = ({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    {...props}
  >
    {children}
  </button>
);
