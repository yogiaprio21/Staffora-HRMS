import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Download, ShieldCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Select";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Textarea } from "../components/ui/Textarea";
import { DateRangeField } from "../components/ui/DateRangeField";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Toolbar } from "../components/ui/Toolbar";
import { MobileDataItem } from "../components/ui/MobileDataList";
import { DataTable } from "../components/ui/DataTable";
import { Drawer } from "../components/ui/Drawer";
import { RowActionsMenu } from "../components/ui/DropdownMenu";
import { useToast } from "../components/ui/ToastContext";
import { Seo } from "../components/seo/Seo";
import { useApproveLeave, useLeaves, useRejectLeave } from "../features/leaves/leaveQueries";
import { reportingApi } from "../features/reporting/reportingApi";
import { downloadBlob } from "../lib/download";
import { getErrorMessage } from "../lib/errors";
import { formatDate, formatDateTime, formatLeaveStatus } from "../lib/labels";
import type { LeaveRequest, LeaveStatus } from "../types";
import { useTableQueryState } from "../hooks/useTableQueryState";

const statusVariant: Record<LeaveStatus, "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger"
};

const statusTabs: Array<{ label: string; value: "" | LeaveStatus }> = [
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
  { label: "Semua", value: "" }
];

export const LeaveApprovalPage = () => {
  const tableState = useTableQueryState({ sortBy: "createdAt", sortOrder: "desc", limit: 10 });
  const status = tableState.status || "PENDING";
  const { notify } = useToast();
  const { data, isLoading, error } = useLeaves({
    page: tableState.page,
    limit: tableState.limit,
    status: status || undefined,
    dateFrom: tableState.dateFrom || undefined,
    dateTo: tableState.dateTo || undefined,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder
  });
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [exporting, setExporting] = useState(false);

  const openAction = (leave: LeaveRequest, nextAction: "approve" | "reject") => {
    setSelectedLeave(leave);
    setAction(nextAction);
    setReviewNote("");
  };

  const closeAction = () => {
    setSelectedLeave(null);
    setAction(null);
    setReviewNote("");
  };

  const handleReview = async () => {
    if (!selectedLeave || !action) {
      return;
    }
    if (action === "reject" && reviewNote.trim().length === 0) {
      setActionError("Alasan penolakan wajib diisi.");
      return;
    }
    setActionError(null);
    try {
      if (action === "approve") {
        await approveLeave.mutateAsync({
          id: selectedLeave.id,
          reviewNote: reviewNote.trim() || undefined
        });
        notify("Pengajuan cuti berhasil disetujui.", "success");
      } else {
        await rejectLeave.mutateAsync({
          id: selectedLeave.id,
          reviewNote: reviewNote.trim()
        });
        notify("Pengajuan cuti berhasil ditolak.", "success");
      }
      closeAction();
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memproses cuti");
      setActionError(message);
      notify(message, "error");
    }
  };

  const handleExport = async () => {
    setActionError(null);
    setExporting(true);
    try {
      const blob = await reportingApi.downloadLeaveExcel({
        status: status || undefined,
        dateFrom: tableState.dateFrom || undefined,
        dateTo: tableState.dateTo || undefined
      });
      downloadBlob(blob, "laporan-cuti.xlsx");
      notify("Laporan cuti berhasil diunduh.", "success");
    } catch (err) {
      const message = getErrorMessage(err, "Gagal mengunduh laporan cuti");
      setActionError(message);
      notify(message, "error");
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<ColumnDef<LeaveRequest, unknown>[]>(
    () => [
      {
        id: "employee",
        header: "Karyawan",
        accessorKey: "employeeName",
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-medium text-slate-900 hover:text-primary-700"
            onClick={() => setDetailLeave(row.original)}
          >
            {row.original.employeeName || "Karyawan"}
          </button>
        )
      },
      { id: "department", header: "Departemen", accessorKey: "department", enableSorting: false },
      {
        id: "startDate",
        header: "Periode",
        accessorKey: "startDate",
        cell: ({ row }) => (
          <span>
            {formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}
          </span>
        )
      },
      {
        id: "reason",
        header: "Alasan",
        accessorKey: "reason",
        enableSorting: false,
        cell: ({ row }) => <span className="line-clamp-2">{row.original.reason}</span>
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge label={formatLeaveStatus(row.original.status)} variant={statusVariant[row.original.status]} />
        )
      },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActionsMenu
              items={[
                { label: "Lihat detail", onSelect: () => setDetailLeave(row.original) },
                {
                  label: "Setujui",
                  disabled: row.original.status !== "PENDING" || approveLeave.isPending,
                  onSelect: () => openAction(row.original, "approve")
                },
                {
                  label: "Tolak",
                  tone: "danger",
                  disabled: row.original.status !== "PENDING" || rejectLeave.isPending,
                  onSelect: () => openAction(row.original, "reject")
                }
              ]}
            />
          </div>
        )
      }
    ],
    [approveLeave.isPending, rejectLeave.isPending]
  );

  const sorting = tableState.sorting as SortingState;

  return (
    <div className="space-y-6">
      <Seo title="Persetujuan Cuti" />
      <PageHeader
        title="Persetujuan Cuti"
        eyebrow="Meja Review HR"
        description="Review, beri catatan, dan proses permintaan cuti secara transparan."
        meta={
          <>
            <Badge label={`${data?.meta.total ?? 0} pengajuan`} variant="neutral" />
            <Badge label={`${status ? formatLeaveStatus(status as LeaveStatus) : "Semua"} tampil`} variant={status ? statusVariant[status as LeaveStatus] : "neutral"} />
          </>
        }
        actions={
          <Button variant="secondary" type="button" onClick={handleExport} disabled={exporting}>
            <Download size={16} />
            {exporting ? "Mengunduh..." : "Ekspor Excel"}
          </Button>
        }
      />
      {actionError ? <ErrorState message={actionError} /> : null}
      <Card className="space-y-4">
        <SectionHeader
          title="Antrian Review"
          description="Gunakan status dan periode untuk fokus pada permintaan yang perlu diproses."
          icon={<ShieldCheck className="h-5 w-5 text-slate-500" />}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => tableState.setFilter("status", tab.value)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <Toolbar>
          <Select
            label="Status"
            value={status}
            onChange={(event) => tableState.setFilter("status", event.target.value)}
          >
            <option value="">Semua status</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </Select>
          <DateRangeField
            fromLabel="Diajukan dari"
            toLabel="Diajukan sampai"
            dateFrom={tableState.dateFrom}
            dateTo={tableState.dateTo}
            onDateFromChange={(value) => tableState.setFilter("dateFrom", value)}
            onDateToChange={(value) => tableState.setFilter("dateTo", value)}
          />
        </Toolbar>
        {isLoading ? (
          <LoadingState label="Memuat daftar cuti..." />
        ) : error ? (
          <ErrorState message={getErrorMessage(error, "Gagal memuat data cuti")} />
        ) : data ? (
          <DataTable
            data={data.items}
            columns={columns}
            page={tableState.page}
            pageSize={tableState.limit}
            total={data.meta.total}
            sorting={sorting}
            onSortingChange={tableState.setSorting}
            onPageChange={tableState.setPage}
            onPageSizeChange={tableState.setPageSize}
            emptyMessage="Tidak ada permintaan cuti yang sesuai filter."
            mobileRender={(leave) => (
                <MobileDataItem
                  key={leave.id}
                  title={leave.employeeName || "Karyawan"}
                  subtitle={`${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}
                  meta={<Badge label={formatLeaveStatus(leave.status)} variant={statusVariant[leave.status]} />}
                  actions={
                    <>
                      <Button variant="secondary" type="button" onClick={() => setDetailLeave(leave)}>
                        Detail
                      </Button>
                    {leave.status === "PENDING" ? (
                      <>
                        <Button variant="secondary" type="button" onClick={() => openAction(leave, "approve")}>
                          Setujui
                        </Button>
                        <Button variant="danger" type="button" onClick={() => openAction(leave, "reject")}>
                          Tolak
                        </Button>
                      </>
                    ) : null}
                    </>
                  }
                >
                  <p>Departemen: {leave.department || "-"}</p>
                  <p>Alasan: {leave.reason}</p>
                  {leave.reviewNote ? <p>Catatan review: {leave.reviewNote}</p> : null}
                </MobileDataItem>
            )}
          />
        ) : (
          null
        )}
      </Card>
      <Drawer
        open={Boolean(detailLeave)}
        title={detailLeave?.employeeName || "Detail cuti"}
        description="Timeline, catatan review, dan konteks approval."
        onClose={() => setDetailLeave(null)}
      >
        {detailLeave ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Badge label={formatLeaveStatus(detailLeave.status)} variant={statusVariant[detailLeave.status]} />
              <span className="text-sm text-slate-500">{detailLeave.durationDays || "-"} hari</span>
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Periode</p>
                <p className="font-medium text-slate-900">
                  {formatDate(detailLeave.startDate)} - {formatDate(detailLeave.endDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Departemen</p>
                <p className="font-medium text-slate-900">{detailLeave.department || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500">Alasan</p>
                <p className="font-medium text-slate-900">{detailLeave.reason}</p>
              </div>
              {detailLeave.reviewNote ? (
                <div className="sm:col-span-2">
                  <p className="text-slate-500">Catatan review</p>
                  <p className="font-medium text-slate-900">{detailLeave.reviewNote}</p>
                </div>
              ) : null}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Linimasa</h3>
              <div className="mt-3 space-y-3">
                {(detailLeave.timeline || []).map((item) => (
                  <div key={`${item.label}-${item.at}`} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(item.at)}
                    </p>
                    {item.note ? <p className="mt-1 text-sm text-slate-600">{item.note}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
      <ConfirmDialog
        open={Boolean(selectedLeave && action)}
        title={action === "reject" ? "Tolak pengajuan cuti?" : "Setujui pengajuan cuti?"}
        description={
          action === "reject"
            ? "Tambahkan alasan agar karyawan memahami keputusan HR."
            : "Saldo cuti karyawan akan dikurangi sesuai durasi permintaan."
        }
        confirmLabel={action === "reject" ? "Tolak" : "Setujui"}
        tone={action === "reject" ? "danger" : "default"}
        loading={approveLeave.isPending || rejectLeave.isPending}
        onCancel={closeAction}
        onConfirm={handleReview}
      >
        <Textarea
          label={action === "reject" ? "Alasan penolakan" : "Catatan review (opsional)"}
          placeholder={
            action === "reject"
              ? "Contoh: Periode berbenturan dengan kebutuhan operasional tim."
              : "Contoh: Disetujui setelah konfirmasi manager."
          }
          hint={
            action === "reject"
              ? "Alasan penolakan wajib diisi dan akan terlihat oleh karyawan."
              : "Catatan opsional membantu audit trail approval."
          }
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
};
