import type { ReactNode } from "react";

export const Toolbar = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">{children}</div>
  </div>
);
