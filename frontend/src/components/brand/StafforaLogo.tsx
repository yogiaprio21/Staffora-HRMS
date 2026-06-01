export const StafforaLogo = ({ compact = false }: { compact?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm ring-1 ring-white/20">
      <span className="absolute left-2 top-2 h-3 w-3 rounded-full bg-primary-500" />
      <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full bg-emerald-500" />
      <span className="text-lg font-black tracking-normal">S</span>
    </div>
    {!compact ? (
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-none">Staffora</p>
        <p className="mt-1 text-xs font-medium text-slate-300">HRMS</p>
      </div>
    ) : null}
  </div>
);
