import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "soft" | "ghost" | "danger" | "dangerSoft" | "light";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60";
const variants: Record<ButtonVariant, string> = {
  primary: "border border-primary-600 bg-primary-600 text-white shadow-sm hover:bg-primary-700",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50",
  outline: "border border-slate-200 bg-white text-slate-800 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700",
  soft: "border border-primary-100 bg-primary-50 text-primary-700 hover:border-primary-200 hover:bg-primary-100",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "border border-rose-600 bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  dangerSoft: "border border-rose-100 bg-rose-50 text-rose-700 hover:border-rose-200 hover:bg-rose-100",
  light: "border border-white bg-white text-slate-950 shadow-sm hover:bg-slate-100"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
  )
);

Button.displayName = "Button";
