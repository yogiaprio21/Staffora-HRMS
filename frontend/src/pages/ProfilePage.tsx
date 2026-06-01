import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BriefcaseBusiness, CalendarDays, Mail, UserRound } from "lucide-react";
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
import { Seo } from "../components/seo/Seo";
import { useAuth } from "../features/auth/AuthContext";
import { useLeaves } from "../features/leaves/leaveQueries";
import { getErrorMessage } from "../lib/errors";
import { formatDate, formatLeaveStatus, formatRole } from "../lib/labels";
import type { LeaveRequest, LeaveStatus } from "../types";
import { useTableQueryState } from "../hooks/useTableQueryState";

const statusVariant: Record<LeaveStatus, "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger"
};

export const ProfilePage = () => {
  const { user } = useAuth();
  const tableState = useTableQueryState({ sortBy: "createdAt", sortOrder: "desc", limit: 10 });
  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);
  const leavesQuery = useLeaves({
    page: tableState.page,
    limit: tableState.limit,
    employeeId: user?.id,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder
  });

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
          <div className="text-right">
            <Button variant="secondary" type="button" onClick={() => setDetailLeave(row.original)}>
              Detail
            </Button>
          </div>
        )
      }
    ],
    []
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
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <SectionHeader
            title="Ringkasan Akun"
            description="Data utama karyawan yang digunakan di workflow cuti dan laporan HR."
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
            label="Saldo Cuti"
            value={`${user.leaveBalance} hari`}
            hint="Saldo tersedia untuk pengajuan berikutnya."
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
                    <Button variant="secondary" type="button" onClick={() => setDetailLeave(leave)}>
                      Detail
                    </Button>
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
    </div>
  );
};
