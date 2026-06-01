import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileClock } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { DateRangeField } from "../components/ui/DateRangeField";
import { Drawer } from "../components/ui/Drawer";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { MobileDataItem } from "../components/ui/MobileDataList";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Select } from "../components/ui/Select";
import { Toolbar } from "../components/ui/Toolbar";
import { Seo } from "../components/seo/Seo";
import { useToast } from "../components/ui/ToastContext";
import { activityApi } from "../features/activity/activityApi";
import { useActivity } from "../features/activity/activityQueries";
import { downloadBlob } from "../lib/download";
import { getErrorMessage } from "../lib/errors";
import { formatActivityAction, formatDateTime } from "../lib/labels";
import type { ActivityLog } from "../types";
import { useTableQueryState } from "../hooks/useTableQueryState";

const actions = [
  "EMPLOYEE_CREATED",
  "EMPLOYEE_UPDATED",
  "EMPLOYEE_DEACTIVATED",
  "EMPLOYEE_RESTORED",
  "LEAVE_SUBMITTED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED"
];

export const ActivityPage = () => {
  const tableState = useTableQueryState({ limit: 20 });
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const { notify } = useToast();
  const activityQuery = useActivity({
    page: tableState.page,
    limit: tableState.limit,
    search: tableState.search || undefined,
    action: tableState.action || undefined,
    entityType: tableState.entityType || undefined,
    dateFrom: tableState.dateFrom || undefined,
    dateTo: tableState.dateTo || undefined
  });

  const columns = useMemo<ColumnDef<ActivityLog, unknown>[]>(
    () => [
      {
        id: "createdAt",
        header: "Waktu",
        accessorKey: "createdAt",
        enableSorting: false,
        cell: ({ row }) => formatDateTime(row.original.createdAt)
      },
      {
        id: "message",
        header: "Pesan",
        accessorKey: "message",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-medium text-slate-900 hover:text-primary-700"
            onClick={() => setSelectedActivity(row.original)}
          >
            {row.original.message}
          </button>
        )
      },
      {
        id: "action",
        header: "Aksi",
        accessorKey: "action",
        enableSorting: false,
        cell: ({ row }) => <Badge label={formatActivityAction(row.original.action)} variant="neutral" />
      },
      { id: "entityType", header: "Entitas", accessorKey: "entityType", enableSorting: false }
    ],
    []
  );

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const blob = await activityApi.exportCsv({
        search: tableState.search || undefined,
        action: tableState.action || undefined,
        entityType: tableState.entityType || undefined,
        dateFrom: tableState.dateFrom || undefined,
        dateTo: tableState.dateTo || undefined
      });
      downloadBlob(blob, "log-aktivitas.csv");
      notify("Log aktivitas berhasil diunduh.", "success");
    } catch (err) {
      const message = getErrorMessage(err, "Gagal mengunduh log aktivitas");
      setExportError(message);
      notify(message, "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Seo title="Log Aktivitas" />
      <PageHeader
        title="Log Aktivitas"
        eyebrow="Audit Trail"
        description="Audit trail perubahan penting karyawan, cuti, dan status workflow."
        meta={<Badge label={`${activityQuery.data?.meta.total ?? 0} catatan`} variant="neutral" />}
        actions={
          <Button variant="secondary" type="button" onClick={handleExport} disabled={exporting}>
            <Download size={16} />
            {exporting ? "Mengunduh..." : "Ekspor CSV"}
          </Button>
        }
      />
      {exportError ? <ErrorState message={exportError} /> : null}
      <Card className="space-y-4">
        <SectionHeader
          title="Eksplorasi Aktivitas"
          description="Cari perubahan, filter jenis aksi, dan cek detail actor untuk kebutuhan audit."
          icon={<FileClock className="h-5 w-5 text-slate-500" />}
        />
        <Toolbar>
          <SearchInput
            label="Cari aktivitas"
            placeholder="Cari pesan, aksi, atau entitas"
            value={tableState.search}
            onChange={(value) => tableState.setFilter("search", value)}
          />
          <Select
            label="Aksi"
            value={tableState.action}
            onChange={(event) => tableState.setFilter("action", event.target.value)}
          >
            <option value="">Semua aksi</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {formatActivityAction(action)}
              </option>
            ))}
          </Select>
          <Select
            label="Entitas"
            value={tableState.entityType}
            onChange={(event) => tableState.setFilter("entityType", event.target.value)}
          >
            <option value="">Semua entitas</option>
            <option value="Employee">Karyawan</option>
            <option value="LeaveRequest">Pengajuan Cuti</option>
          </Select>
          <DateRangeField
            fromLabel="Dari"
            toLabel="Sampai"
            dateFrom={tableState.dateFrom}
            dateTo={tableState.dateTo}
            onDateFromChange={(value) => tableState.setFilter("dateFrom", value)}
            onDateToChange={(value) => tableState.setFilter("dateTo", value)}
          />
        </Toolbar>
        {activityQuery.isLoading ? (
          <LoadingState label="Memuat log aktivitas..." />
        ) : activityQuery.error ? (
          <ErrorState message={getErrorMessage(activityQuery.error, "Gagal memuat log aktivitas")} />
        ) : activityQuery.data ? (
          <DataTable
            data={activityQuery.data.items}
            columns={columns}
            page={tableState.page}
            pageSize={tableState.limit}
            total={activityQuery.data.meta.total}
            onPageChange={tableState.setPage}
            onPageSizeChange={tableState.setPageSize}
            emptyMessage="Belum ada log aktivitas yang sesuai filter."
            mobileRender={(activity) => (
              <MobileDataItem
                key={activity.id}
                title={activity.message}
                subtitle={`${formatActivityAction(activity.action)} • ${formatDateTime(activity.createdAt)}`}
                actions={
                  <Button variant="secondary" type="button" onClick={() => setSelectedActivity(activity)}>
                    Detail
                  </Button>
                }
              >
                <p>Entitas: {activity.entityType}</p>
                <p>ID: {activity.entityId}</p>
              </MobileDataItem>
            )}
          />
        ) : null}
      </Card>
      <Drawer
        open={Boolean(selectedActivity)}
        title="Detail aktivitas"
        description={selectedActivity ? formatActivityAction(selectedActivity.action) : undefined}
        onClose={() => setSelectedActivity(null)}
      >
        {selectedActivity ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500">Pesan</p>
              <p className="font-medium text-slate-900">{selectedActivity.message}</p>
            </div>
            <Badge label={formatActivityAction(selectedActivity.action)} variant="neutral" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Entitas</p>
                <p className="font-medium text-slate-900">{selectedActivity.entityType}</p>
              </div>
              <div>
                <p className="text-slate-500">ID Entitas</p>
                <p className="font-medium text-slate-900 break-all">{selectedActivity.entityId}</p>
              </div>
              <div>
                <p className="text-slate-500">ID Aktor</p>
                <p className="font-medium text-slate-900 break-all">{selectedActivity.actorId || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">Target Karyawan</p>
                <p className="font-medium text-slate-900 break-all">
                  {selectedActivity.targetEmployeeId || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};
