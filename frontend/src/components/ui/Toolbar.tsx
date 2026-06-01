import type { ReactNode } from "react";
import { X } from "lucide-react";

type ActiveFilter = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

export const Toolbar = ({
  children,
  activeFilters = [],
  onClear,
  summary,
  gridClassName = "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
}: {
  children: ReactNode;
  activeFilters?: ActiveFilter[];
  onClear?: () => void;
  summary?: string;
  gridClassName?: string;
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
    <div className={gridClassName}>{children}</div>
    {activeFilters.length > 0 || summary ? (
      <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {summary ? <span className="text-xs font-medium text-slate-500">{summary}</span> : null}
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              onClick={filter.onRemove}
            >
              <span>{filter.label}: {filter.value}</span>
              <X size={13} />
            </button>
          ))}
        </div>
        {onClear && activeFilters.length > 0 ? (
          <button
            type="button"
            className="self-start text-xs font-semibold text-primary-700 hover:text-primary-800 sm:self-auto"
            onClick={onClear}
          >
            Bersihkan filter
          </button>
        ) : null}
      </div>
    ) : null}
  </div>
);
