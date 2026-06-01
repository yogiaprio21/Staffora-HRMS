import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export const EmptyState = ({
  message,
  title = "Data tidak ditemukan",
  action,
  icon
}: {
  message: string;
  title?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      {icon || <Inbox size={20} />}
    </div>
    <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{message}</p>
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);
