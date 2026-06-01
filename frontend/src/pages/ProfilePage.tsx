import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { BriefcaseBusiness, CalendarDays, KeyRound, Mail, Pencil, UserRound } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { MobileDataItem } from "../components/ui/MobileDataList";
import { DataTable } from "../components/ui/DataTable";
import { Drawer } from "../components/ui/Drawer";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useToast } from "../components/ui/ToastContext";
import { Seo } from "../components/seo/Seo";
import { useAuth } from "../features/auth/AuthContext";
import { authApi } from "../features/auth/authApi";
import { useCancelLeave, useLeaves } from "../features/leaves/leaveQueries";
import { usePreviewGuard } from "../features/preview/previewMode";
import { getErrorMessage } from "../lib/errors";
import { formatDate, formatLeaveStatus, formatRole } from "../lib/labels";
import type { LeaveRequest, LeaveStatus } from "../types";
import { useTableQueryState } from "../hooks/useTableQueryState";

const statusVariant: Record<LeaveStatus, "success" | "warning" | "danger" | "neutral"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CANCELED: "neutral"
};

export const ProfilePage = () => {
  const { user } = useAuth();
  const { notify } = useToast();
  const { isPreviewMode, guardPreviewAction } = usePreviewGuard();
  const tableState = useTableQueryState({ sortBy: "createdAt", sortOrder: "desc", limit: 10 });
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);
  const [cancelLeaveItem, setCancelLeaveItem] = useState<LeaveRequest | null>(null);
  const [cancelNote, setCancelNote] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const cancelLeave = useCancelLeave();
  const changePassword = useMutation({
    mutationFn: authApi.changePassword
  });
  const leavesQuery = useLeaves({
    page: tableState.page,
    limit: tableState.limit,
    employeeId: user?.id,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder
  });

  const openCancelDialog = useCallback((leave: LeaveRequest) => {
    if (guardPreviewAction("Mode demo tidak membatalkan pengajuan cuti. Masuk untuk mengelola data asli.")) {
      return;
    }
    setCancelLeaveItem(leave);
    setCancelNote("");
    setCancelError(null);
  }, [guardPreviewAction]);

  const closeCancelDialog = () => {
    setCancelLeaveItem(null);
    setCancelNote("");
    setCancelError(null);
  };

  const handleCancelLeave = async () => {
    if (!cancelLeaveItem) {
      return;
    }
    setCancelError(null);
    try {
      await cancelLeave.mutateAsync({
        id: cancelLeaveItem.id,
        reviewNote: cancelNote.trim() || undefined
      });
      notify("Pengajuan cuti berhasil dibatalkan.", "success");
      closeCancelDialog();
    } catch (err) {
      const message = getErrorMessage(err, "Gagal membatalkan pengajuan cuti");
      setCancelError(message);
      notify(message, "error");
    }
  };

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setPasswordError(null);
  };

  const handleChangePassword = async () => {
    if (guardPreviewAction("Mode demo tidak mengubah kata sandi. Masuk dengan akun asli untuk memperbarui keamanan akun.")) {
      return;
    }
    if (currentPassword.length < 8 || newPassword.length < 8) {
      setPasswordError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      return;
    }
    setPasswordError(null);
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      notify("Kata sandi berhasil diperbarui.", "success");
      closePasswordDialog();
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memperbarui kata sandi");
      setPasswordError(message);
      notify(message, "error");
    }
  };

  const columns = useMemo<ColumnDef<LeaveRequest, unknown>[]>(
    () => [
      {
        id: "startDate",
        header: "Periode",
        accessorKey: "startDate",
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-medium text-slate-900 hover:text-primary-700"
            onClick={() => setDetailLeave(row.original)}
          >
            {formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}
          </button>
        )
      },
      { id: "reason", header: "Alasan", accessorKey: "reason", enableSorting: false },
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
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setDetailLeave(row.original)}>
              Detail
            </Button>
            {row.original.status === "PENDING" ? (
              <Button
                variant="danger"
                type="button"
                disabled={isPreviewMode || cancelLeave.isPending}
                onClick={() => openCancelDialog(row.original)}
              >
                Batalkan
              </Button>
            ) : null}
          </div>
        )
      }
    ],
    [cancelLeave.isPending, isPreviewMode, openCancelDialog]
  );

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      <Seo title="Profil" />
      <PageHeader
        title="Profil"
        eyebrow="Ruang Karyawan"
        description="Informasi akun, status kerja, dan riwayat cuti pribadi."
        meta={
          <>
            <Badge label={formatRole(user.role)} variant="neutral" />
            <Badge label={user.isActive ? "Akun aktif" : "Akun nonaktif"} variant={user.isActive ? "success" : "danger"} />
          </>
        }
        actions={
          <>
            {user.role !== "EMPLOYEE" ? (
              <Link
                to={isPreviewMode ? "/preview/profile" : `/employees/${user.id}/edit`}
                onClick={(event) => {
                  if (guardPreviewAction("Mode demo tidak mengubah profil. Masuk sebagai pengguna asli untuk memperbarui data.")) {
                    event.preventDefault();
                  }
                }}
              >
                <Button variant="secondary" type="button" disabled={isPreviewMode}>
                  <Pencil size={16} />
                  Ubah data saya
                </Button>
              </Link>
            ) : null}
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                if (!guardPreviewAction("Mode demo tidak mengubah kata sandi. Masuk dengan akun asli untuk memperbarui keamanan akun.")) {
                  setPasswordDialogOpen(true);
                }
              }}
              disabled={isPreviewMode}
            >
              <KeyRound size={16} />
              Ubah kata sandi
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <SectionHeader
            title="Ringkasan Akun"
            description="Data utama karyawan yang digunakan di alur cuti dan laporan HR."
            icon={<UserRound className="h-5 w-5 text-slate-500" />}
          />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-semibold text-white">
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-slate-950">{fullName}</h2>
              <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                <Mail size={16} />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge label={user.department || "Belum ada departemen"} variant="neutral" />
                <Badge label={formatRole(user.role)} variant="neutral" />
              </div>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard
            label="Sisa Hak Cuti"
            value={`${user.leaveBalance} hari`}
            hint="Hak cuti yang masih tersedia untuk pengajuan berikutnya."
            icon={<CalendarDays size={20} />}
            tone="success"
          />
          <StatCard
            label="Departemen"
            value={user.department || "-"}
            hint="Digunakan untuk filter dan laporan HR."
            icon={<BriefcaseBusiness size={20} />}
            tone="neutral"
          />
        </div>
      </div>

      <Card className="space-y-4">
        <SectionHeader
          title="Riwayat Cuti Saya"
          description="Riwayat pengajuan cuti terbaru beserta status dan catatan review."
          icon={<CalendarDays className="h-5 w-5 text-slate-500" />}
        />
        {cancelError ? <ErrorState message={cancelError} /> : null}
        {leavesQuery.isLoading ? (
          <LoadingState label="Memuat data cuti..." />
        ) : leavesQuery.error ? (
          <ErrorState message={getErrorMessage(leavesQuery.error, "Gagal memuat riwayat cuti")} />
        ) : leavesQuery.data ? (
          <DataTable
            data={leavesQuery.data.items}
            columns={columns}
            page={tableState.page}
            pageSize={tableState.limit}
            total={leavesQuery.data.meta.total}
            sorting={tableState.sorting}
            onSortingChange={tableState.setSorting}
            onPageChange={tableState.setPage}
            onPageSizeChange={tableState.setPageSize}
            emptyMessage="Belum ada pengajuan cuti."
            mobileRender={(leave) => (
                <MobileDataItem
                  key={leave.id}
                  title={`${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}
                  subtitle={leave.reason}
                  meta={
                    <Badge label={formatLeaveStatus(leave.status)} variant={statusVariant[leave.status]} />
                  }
                  actions={
                    <>
                      <Button variant="secondary" type="button" onClick={() => setDetailLeave(leave)}>
                        Detail
                      </Button>
                      {leave.status === "PENDING" ? (
                        <Button
                          variant="danger"
                          type="button"
                          disabled={isPreviewMode || cancelLeave.isPending}
                          onClick={() => openCancelDialog(leave)}
                        >
                          Batalkan
                        </Button>
                      ) : null}
                    </>
                  }
                >
                  <p>Durasi: {leave.durationDays || "-"} hari</p>
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
        title="Detail cuti"
        description="Status dan catatan review pengajuan cuti."
        onClose={() => setDetailLeave(null)}
      >
        {detailLeave ? (
          <div className="space-y-4 text-sm">
            <Badge label={formatLeaveStatus(detailLeave.status)} variant={statusVariant[detailLeave.status]} />
            <div>
              <p className="text-slate-500">Periode</p>
              <p className="font-medium text-slate-900">
                {formatDate(detailLeave.startDate)} - {formatDate(detailLeave.endDate)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Alasan</p>
              <p className="font-medium text-slate-900">{detailLeave.reason}</p>
            </div>
            {detailLeave.reviewNote ? (
              <div>
                <p className="text-slate-500">Catatan review</p>
                <p className="font-medium text-slate-900">{detailLeave.reviewNote}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
      <ConfirmDialog
        open={Boolean(cancelLeaveItem)}
        title="Batalkan pengajuan cuti?"
        description="Pengajuan yang dibatalkan tidak akan masuk antrian approval dan tetap tercatat di riwayat."
        confirmLabel="Batalkan cuti"
        tone="danger"
        loading={cancelLeave.isPending}
        onCancel={closeCancelDialog}
        onConfirm={handleCancelLeave}
      >
        <Textarea
          label="Catatan pembatalan (opsional)"
          placeholder="Contoh: Jadwal cuti berubah karena kebutuhan pribadi."
          value={cancelNote}
          onChange={(event) => setCancelNote(event.target.value)}
        />
      </ConfirmDialog>
      <ConfirmDialog
        open={passwordDialogOpen}
        title="Ubah kata sandi?"
        description="Masukkan kata sandi saat ini dan kata sandi baru untuk menjaga keamanan akun."
        confirmLabel="Simpan kata sandi"
        loading={changePassword.isPending}
        onCancel={closePasswordDialog}
        onConfirm={handleChangePassword}
      >
        <div className="space-y-3">
          <Input
            label="Kata sandi saat ini"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            label="Kata sandi baru"
            type="password"
            autoComplete="new-password"
            hint="Gunakan minimal 8 karakter dan jangan sama dengan kata sandi lama."
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          {passwordError ? <ErrorState message={passwordError} /> : null}
        </div>
      </ConfirmDialog>
    </div>
  );
};
