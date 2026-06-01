import type { ReactNode } from "react";

export const MobileDataList = ({ children }: { children: ReactNode }) => (
  <div className="space-y-3 md:hidden">{children}</div>
);

export const MobileDataItem = ({
  title,
  subtitle,
  meta,
  actions,
  children
}: {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {meta}
    </div>
    {children ? <div className="mt-4 space-y-2 text-sm text-slate-600">{children}</div> : null}
    {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);
