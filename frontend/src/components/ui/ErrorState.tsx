import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export const ErrorState = ({ message, action }: { message: string; action?: ReactNode }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex gap-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
