import type { ReactNode } from "react";

export const SectionHeader = ({
  title,
  description,
  icon,
  action
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex gap-3">
      {icon ? (
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          {icon}
        </span>
      ) : null}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
