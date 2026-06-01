export const LoadingState = ({ label = "Memuat..." }: { label?: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-3 text-sm text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      {label}
    </div>
    <div className="mt-5 space-y-3">
      <div className="h-3 w-3/4 rounded-full bg-slate-100" />
      <div className="h-3 w-1/2 rounded-full bg-slate-100" />
      <div className="h-3 w-2/3 rounded-full bg-slate-100" />
    </div>
  </div>
);
