import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, Building2, CalendarCheck, CalendarDays, Clock3, Download, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { DateRangeField } from "../components/ui/DateRangeField";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { SectionHeader } from "../components/ui/SectionHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Seo } from "../components/seo/Seo";
import { useToast } from "../components/ui/ToastContext";
import { useDashboardStats } from "../features/dashboard/dashboardQueries";
import { reportingApi } from "../features/reporting/reportingApi";
import { downloadBlob } from "../lib/download";
import { getErrorMessage } from "../lib/errors";
import { formatActivityAction, formatDate, formatLeaveStatus } from "../lib/labels";
import type { LeaveStatus } from "../types";
import { useTableQueryState } from "../hooks/useTableQueryState";
import { usePreviewGuard } from "../features/preview/previewMode";

const statusVariant: Record<LeaveStatus, "success" | "warning" | "danger" | "neutral"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CANCELED: "neutral"
};

type DashboardPanel = "approvals" | "upcoming" | "activity";

const panelTabs: Array<{ label: string; value: DashboardPanel; icon: typeof Clock3 }> = [
  { label: "Persetujuan", value: "approvals", icon: Clock3 },
  { label: "Cuti Mendatang", value: "upcoming", icon: CalendarDays },
  { label: "Aktivitas", value: "activity", icon: Activity }
];

export const DashboardPage = () => {
  const filters = useTableQueryState();
  const { data, isLoading, error } = useDashboardStats({
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined
  });
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<DashboardPanel>("approvals");
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 416 });
  const { notify } = useToast();
  const { isPreviewMode, guardPreviewAction } = usePreviewGuard();
  const basePath = isPreviewMode ? "/preview" : "";

  const chartData = useMemo(
    () =>
      Object.entries(data?.leaveSummaryByDepartment || {}).map(([department, total]) => ({
        department,
        total
      })),
    [data]
  );

  useEffect(() => {
    const element = chartContainerRef.current;
    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      const nextWidth = Math.floor(rect.width);
      const nextHeight = Math.floor(rect.height);

      if (nextWidth > 0 && nextHeight > 0) {
        setChartSize((current) =>
          current.width === nextWidth && current.height === nextHeight
            ? current
            : { width: nextWidth, height: nextHeight }
        );
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [chartData.length]);

  const handleExportEmployees = async () => {
    if (guardPreviewAction("Mode demo tidak mengunduh data. Masuk sebagai HR untuk mengekspor laporan asli.")) {
      return;
    }
    setExportError(null);
    setExporting("employees");
    try {
      const blob = await reportingApi.downloadEmployeesPdf();
      downloadBlob(blob, "laporan-karyawan.pdf");
      notify("Laporan karyawan berhasil diunduh.", "success");
    } catch (err) {
      const message = getErrorMessage(err, "Gagal mengunduh laporan karyawan");
      setExportError(message);
      notify(message, "error");
    } finally {
      setExporting(null);
    }
  };

  const handleExportLeaves = async () => {
    if (guardPreviewAction("Mode demo tidak mengunduh data. Masuk sebagai HR untuk mengekspor laporan asli.")) {
      return;
    }
    setExportError(null);
    setExporting("leaves");
    try {
      const blob = await reportingApi.downloadLeaveExcel({
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined
      });
      downloadBlob(blob, "laporan-cuti.xlsx");
      notify("Laporan cuti berhasil diunduh.", "success");
    } catch (err) {
      const message = getErrorMessage(err, "Gagal mengunduh laporan cuti");
      setExportError(message);
      notify(message, "error");
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) {
    return <LoadingState label="Memuat dasbor..." />;
  }

  if (error) {
    return <ErrorState message={getErrorMessage(error, "Gagal memuat dasbor")} />;
  }

  return (
    <div className="space-y-6">
      <Seo title="Dashboard" description="Ringkasan karyawan, cuti, persetujuan, dan aktivitas HR Staffora." />
      <PageHeader
        title="Dashboard"
        eyebrow="Ringkasan Operasional"
        description="Pantau kesehatan karyawan, antrian persetujuan, distribusi cuti, dan log aktivitas terbaru dalam satu layar."
        meta={
          <>
            <Badge label="Data operasional aktif" variant="neutral" />
            {filters.dateFrom || filters.dateTo ? (
              <Badge label="Periode difilter" variant="warning" />
            ) : (
              <Badge label="Semua waktu" variant="success" />
            )}
          </>
        }
        actions={
          <>
            <Button variant="outline" type="button" onClick={handleExportEmployees} disabled={Boolean(exporting)}>
              <Download size={16} />
              {exporting === "employees" ? "Mengunduh..." : "Unduh PDF Karyawan"}
            </Button>
            <Button variant="soft" type="button" onClick={handleExportLeaves} disabled={Boolean(exporting)}>
              <Download size={16} />
              {exporting === "leaves" ? "Mengunduh..." : "Unduh Excel Cuti"}
            </Button>
          </>
        }
      />
      {isPreviewMode ? (
        <Card className="border-primary-100 bg-primary-50/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-800">Mode demo publik aktif</p>
              <p className="mt-1 text-sm text-primary-700">
                Data di halaman ini adalah contoh statis. Aksi perubahan data dinonaktifkan agar aman untuk portfolio.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {exportError ? <ErrorState message={exportError} /> : null}

      <Card className="space-y-4">
        <SectionHeader
          title="Periode Laporan"
          description="Gunakan rentang tanggal untuk membaca tren cuti dan aktivitas pada periode tertentu."
        />
        <DateRangeField
          fromLabel="Awal periode"
          toLabel="Akhir periode"
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(value) => filters.setFilter("dateFrom", value)}
          onDateToChange={(value) => filters.setFilter("dateTo", value)}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Karyawan"
          value={data?.totalEmployees ?? 0}
          icon={<Users size={20} />}
          hint="Karyawan aktif yang tampil untuk HR"
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={data?.totalPendingLeaves ?? 0}
          icon={<Clock3 size={20} />}
          tone="warning"
          hint="Pengajuan yang menunggu tinjauan HR"
        />
        <StatCard
          label="Disetujui Periode Ini"
          value={data?.totalApprovedLeavesThisMonth ?? 0}
          icon={<CalendarCheck size={20} />}
          tone="success"
          hint="Cuti disetujui pada periode terpilih"
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <Card className="min-w-0 space-y-4">
          <SectionHeader
            title="Ringkasan Cuti per Departemen"
            description="Distribusi permintaan cuti per departemen pada periode aktif."
            action={<Building2 className="h-5 w-5 text-slate-400" />}
          />
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">Sumbu Y: departemen</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Sumbu X: jumlah pengajuan cuti</span>
          </div>
          <div ref={chartContainerRef} className="h-[26rem] min-w-0">
            {chartData.length > 0 ? (
              chartSize.width > 0 ? (
                <BarChart
                  width={chartSize.width}
                  height={chartSize.height}
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 12, bottom: 36 }}
                >
                  <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Jumlah pengajuan cuti",
                      position: "insideBottom",
                      offset: -18,
                      fill: "#64748b",
                      fontSize: 12
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={124}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} pengajuan`, "Jumlah"]}
                    labelFormatter={(label) => `Departemen: ${label}`}
                  />
                  <Bar dataKey="total" fill="#3b5cf7" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              ) : null
            ) : (
              <EmptyState message="Belum ada data cuti per departemen pada periode ini." />
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Distribusi Status" description="Komposisi status cuti saat ini." />
          <div className="space-y-3">
            {(["PENDING", "APPROVED", "REJECTED", "CANCELED"] as LeaveStatus[]).map((status) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <Badge label={formatLeaveStatus(status)} variant={statusVariant[status]} />
                <span className="text-2xl font-semibold text-slate-900">
                  {data?.leaveSummaryByStatus?.[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <SectionHeader
          title="Agenda & Aktivitas"
          description="Ringkasan singkat untuk pekerjaan yang perlu dipantau tanpa membuat halaman terlalu panjang."
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {panelTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activePanel === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => setActivePanel(tab.value)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {activePanel === "approvals" ? (
            <div>
              {(data?.pendingApprovals || []).slice(0, 5).map((leave) => (
                <div key={leave.id} className="flex flex-col gap-2 border-b border-slate-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{leave.employeeName}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                  </div>
                  <Badge label="Menunggu" variant="warning" />
                </div>
              ))}
              {data?.pendingApprovals?.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">Tidak ada persetujuan tertunda.</div>
              ) : null}
              <div className="border-t border-slate-100 p-3">
                <Link to={`${basePath}/leave-approvals`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                  Buka persetujuan cuti
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : null}
          {activePanel === "upcoming" ? (
            <div>
              {(data?.upcomingLeaves || []).slice(0, 5).map((leave) => (
                <div key={leave.id} className="flex flex-col gap-2 border-b border-slate-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{leave.employeeName}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(leave.startDate)} • {leave.department || "-"}
                    </p>
                  </div>
                  <Badge label="Disetujui" variant="success" />
                </div>
              ))}
              {data?.upcomingLeaves?.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">Belum ada cuti mendatang.</div>
              ) : null}
              <div className="border-t border-slate-100 p-3">
                <Link to={`${basePath}/leaves`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                  Buka data cuti
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : null}
          {activePanel === "activity" ? (
            <div>
              {(data?.recentActivity || []).slice(0, 5).map((activity) => (
                <div key={activity.id} className="border-b border-slate-100 p-4 last:border-b-0">
                  <p className="font-semibold text-slate-900">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(activity.createdAt)} • {formatActivityAction(activity.action)}
                  </p>
                </div>
              ))}
              {data?.recentActivity?.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">Belum ada aktivitas tercatat.</div>
              ) : null}
              <div className="border-t border-slate-100 p-3">
                <Link to={`${basePath}/activity`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                  Buka log aktivitas
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};
