import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export const Pagination = ({
  page,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-col gap-3 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-slate-700">
          Halaman {page} dari {totalPages}
        </span>
        <span className="text-slate-400">•</span>
        <span>Menampilkan {startItem}-{endItem} dari {total} data</span>
        {onPageSizeChange ? (
          <label className="flex items-center gap-2">
            <span>Baris</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              {[10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          type="button"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          Sebelumnya
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
