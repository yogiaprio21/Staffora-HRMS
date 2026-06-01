import type { ReactNode } from "react";

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
    <table className="min-w-[720px] divide-y divide-slate-200 text-sm">{children}</table>
  </div>
);

export const TableHead = ({ children }: { children: ReactNode }) => (
  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </thead>
);

export const TableRow = ({ children }: { children: ReactNode }) => (
  <tr className="border-b border-slate-100 last:border-none">{children}</tr>
);

export const TableCell = ({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) => <td className={`px-4 py-3 ${className}`}>{children}</td>;

export const TableHeaderCell = ({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) => <th className={`px-4 py-3 ${className}`}>{children}</th>;
