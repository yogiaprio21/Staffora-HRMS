import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck, Clock3, Download, Users, Building2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { DateRangeField } from "../components/ui/DateRangeField";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Seo } from "../components/seo/Seo";
import { useToast } from "../components/ui/ToastContext";
import { useDashboardStats } from "../features/dashboard/dashboardQueries";
import { reportingApi } from "../features/reporting/reportingApi";
import { downloadBlob } from "../lib/download";
import { getErrorMessage } from "../lib/errors";
import { formatActivityAction, formatDate, formatLeaveStatus } from "../lib/labels";
import type { LeaveStatus } from "../types";
import { useTableQueryState } from "../hooks/useTableQueryState";

const statusVariant: Record<LeaveStatus, "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger"
};

export const DashboardPage = () => {
  const filters = useTableQueryState();
  const { data, isLoading, error } = useDashboardStats({
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined
  });
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 320 });
  const { notify } = useToast();

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
  }, []);

  const chartData = useMemo(
    () =>
      Object.entries(data?.leaveSummaryByDepartment || {}).map(([department, total]) => ({
        department,
        total
      })),
    [data]
  );

  const handleExportEmployees = async () => {
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
      <Seo title="Dasbor" description="Ringkasan karyawan, cuti, persetujuan, dan aktivitas HR Staffora." />
      <PageHeader
        title="Dasbor"
        eyebrow="Ringkasan Operasional"
        description="Pantau kesehatan karyawan, antrian persetujuan, distribusi cuti, dan audit trail terbaru dalam satu layar."
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
          <Button variant="secondary" type="button" onClick={handleExportEmployees}>
            <Download size={16} />
            {exporting === "employees" ? "Mengunduh..." : "Ekspor PDF Karyawan"}
          </Button>
          <Button variant="secondary" type="button" onClick={handleExportLeaves}>
            <Download size={16} />
            {exporting === "leaves" ? "Mengunduh..." : "Ekspor Excel Cuti"}
          </Button>
          </>
        }
      />

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
          label="Cuti Menunggu"
          value={data?.totalPendingLeaves ?? 0}
          icon={<Clock3 size={20} />}
          tone="warning"
          hint="Pengajuan yang menunggu review HR"
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
          <div ref={chartContainerRef} className="h-80 min-w-0">
            {chartSize.width > 0 ? (
              <BarChart width={chartSize.width} height={chartSize.height} data={chartData}>
                <XAxis dataKey="department" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b5cf7" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Distribusi Status" description="Komposisi status cuti saat ini." />
          <div className="space-y-3">
            {(["PENDING", "APPROVED", "REJECTED"] as LeaveStatus[]).map((status) => (
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-4">
          <SectionHeader title="Antrian Persetujuan" description="Permintaan yang perlu diproses HR." />
          <div className="space-y-3">
            {(data?.pendingApprovals || []).map((leave) => (
              <div key={leave.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{leave.employeeName}</p>
                <p className="text-sm text-slate-500">
                  {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                </p>
              </div>
            ))}
            {data?.pendingApprovals?.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada persetujuan tertunda.</p>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Cuti Mendatang" description="Cuti disetujui yang akan datang." />
          <div className="space-y-3">
            {(data?.upcomingLeaves || []).map((leave) => (
              <div key={leave.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{leave.employeeName}</p>
                <p className="text-sm text-slate-500">
                  {formatDate(leave.startDate)} • {leave.department}
                </p>
              </div>
            ))}
            {data?.upcomingLeaves?.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada cuti mendatang.</p>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Aktivitas Terbaru" description="Audit trail perubahan penting sistem." />
          <div className="space-y-3">
            {(data?.recentActivity || []).map((activity) => (
              <div key={activity.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(activity.createdAt)} • {formatActivityAction(activity.action)}
                </p>
              </div>
            ))}
            {data?.recentActivity?.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada aktivitas tercatat.</p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};
