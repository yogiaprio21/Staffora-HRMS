import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  page: number;
  pageSize: number;
  total: number;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  mobileRender?: (row: TData) => ReactNode;
  emptyMessage?: string;
};

export const DataTable = <TData,>({
  data,
  columns,
  page,
  pageSize,
  total,
  sorting = [],
  onSortingChange,
  onPageChange,
  onPageSizeChange,
  mobileRender,
  emptyMessage = "Tidak ada data."
}: DataTableProps<TData>) => {
  // TanStack Table intentionally returns stable table helpers; this local wrapper does not memoize them.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      if (!onSortingChange) {
        return;
      }
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater);
    }
  });

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-4">
      {mobileRender ? (
        <div className="space-y-3 md:hidden">{data.map((row) => mobileRender(row))}</div>
      ) : null}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
        <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="whitespace-nowrap px-4 py-3">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1 text-left ${
                            canSort ? "hover:text-slate-900" : ""
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortState ? <span>{sortState === "asc" ? "↑" : "↓"}</span> : null}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50/80 last:border-none">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
