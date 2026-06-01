import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className = "", id, ...props }, ref) => (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      {label ? <span className="font-medium">{label}</span> : null}
      <span className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={id}
          ref={ref}
          className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${
            leftIcon ? "pl-10" : ""
          } ${rightElement ? "pr-11" : ""} ${className}`}
          {...props}
        />
        {rightElement ? (
          <span className="absolute inset-y-0 right-2 flex items-center">{rightElement}</span>
        ) : null}
      </span>
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
);

Input.displayName = "Input";
