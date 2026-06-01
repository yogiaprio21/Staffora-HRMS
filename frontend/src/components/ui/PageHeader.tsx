import type { ReactNode } from "react";

export const PageHeader = ({
  title,
  description,
  actions,
  eyebrow,
  meta
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
  meta?: ReactNode;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">{actions}</div> : null}
    </div>
  </div>
);
