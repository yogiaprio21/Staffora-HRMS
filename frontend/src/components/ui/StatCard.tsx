import { Card } from "./Card";
import type { ReactNode } from "react";

export const StatCard = ({
  label,
  value,
  hint,
  icon,
  tone = "primary"
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "neutral";
}) => (
  <Card className="relative overflow-hidden">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      </div>
      {icon ? (
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            tone === "success"
              ? "bg-emerald-50 text-emerald-700"
              : tone === "warning"
                ? "bg-amber-50 text-amber-700"
                : tone === "neutral"
                  ? "bg-slate-100 text-slate-700"
                  : "bg-primary-50 text-primary-700"
          }`}
        >
          {icon}
        </div>
      ) : null}
    </div>
    {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
  </Card>
);
