import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = "", children, id, ...props }, ref) => (
    <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor={id}>
      {label ? <span className="font-medium">{label}</span> : null}
      <select
        id={id}
        ref={ref}
        className={`min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
);

Select.displayName = "Select";
