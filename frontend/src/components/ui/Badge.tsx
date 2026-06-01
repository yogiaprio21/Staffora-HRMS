type BadgeVariant = "success" | "warning" | "danger" | "neutral";

const variants: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200"
};

export const Badge = ({
  label,
  variant = "neutral"
}: {
  label: string;
  variant?: BadgeVariant;
}) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${variants[variant]}`}>
    {label}
  </span>
);
