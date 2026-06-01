import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Download, Plus, UserRound, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { MobileDataItem } from "../components/ui/MobileDataList";
import { DataTable } from "../components/ui/DataTable";
import { Drawer } from "../components/ui/Drawer";
import { RowActionsMenu } from "../components/ui/DropdownMenu";
import { SearchInput } from "../components/ui/SearchInput";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Toolbar } from "../components/ui/Toolbar";
import { useToast } from "../components/ui/ToastContext";
import { Seo } from "../components/seo/Seo";
import { useAuth } from "../features/auth/AuthContext";
import {
  useDeleteEmployee,
  useEmployeeMeta,
  useEmployeeSummary,
  useEmployees,
  useRestoreEmployee
} from "../features/employees/employeeQueries";
import { reportingApi } from "../features/reporting/reportingApi";
import { downloadBlob } from "../lib/download";
import { getErrorMessage } from "../lib/errors";
import { formatRole } from "../lib/labels";
import type { Employee } from "../types";
import { useTableQueryState } from "../hooks/useTableQueryState";
import { usePreviewGuard } from "../features/preview/previewMode";

export const EmployeesPage = () => {
  const tableState = useTableQueryState({ sortBy: "createdAt", sortOrder: "desc", limit: 10 });
  const navigate = useNavigate();
  const { user } = useAuth();
  const status = tableState.status || "ACTIVE";
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [actionType, setActionType] = useState<"deactivate" | "restore" | null>(null);
  const { notify } = useToast();
  const { isPreviewMode, guardPreviewAction } = usePreviewGuard();
  const { data, isLoading, error } = useEmployees({
    page: tableState.page,
    limit: tableState.limit,
    search: tableState.search || undefined,
    department: tableState.department || undefined,
    role: tableState.role || undefined,
    status: status || undefined,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder
  });
  const metaQuery = useEmployeeMeta();
  const summaryQuery = useEmployeeSummary();
  const deleteEmployee = useDeleteEmployee();
  const restoreEmployee = useRestoreEmployee();

  const openAction = useCallback((employee: Employee, type: "deactivate" | "restore") => {
    if (guardPreviewAction("Mode demo tidak mengubah data karyawan. Masuk sebagai HR untuk menjalankan aksi ini.")) {
      return;
    }
    setSelectedEmployee(employee);
    setActionType(type);
  }, [guardPreviewAction]);

  const closeAction = () => {
    setSelectedEmployee(null);
    setActionType(null);
  };

  const handleEmployeeAction = async () => {
    if (!selectedEmployee || !actionType) {
      return;
    }
    try {
      if (actionType === "deactivate") {
        await deleteEmployee.mutateAsync(selectedEmployee.id);
        notify("Karyawan berhasil dinonaktifkan.", "success");
      } else {
        await restoreEmployee.mutateAsync(selectedEmployee.id);
        notify("Karyawan berhasil dipulihkan.", "success");
      }
      closeAction();
    } catch (err) {
      notify(getErrorMessage(err, "Gagal memproses karyawan"), "error");
    }
  };

  const handleExport = async () => {
    if (guardPreviewAction("Mode demo tidak mengunduh data. Masuk sebagai HR untuk mengekspor laporan asli.")) {
      return;
    }
    setExportError(null);
    setExporting(true);
    try {
      const blob = await reportingApi.downloadEmployeesPdf({
        search: tableState.search || undefined,
        department: tableState.department || undefined,
        role: tableState.role || undefined,
        status: status || undefined
      });
      downloadBlob(blob, "laporan-karyawan.pdf");
      notify("Laporan karyawan berhasil diunduh.", "success");
    } catch (err) {
      const message = getErrorMessage(err, "Gagal mengunduh laporan karyawan");
      setExportError(message);
      notify(message, "error");
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo<ColumnDef<Employee, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Nama",
        accessorFn: (employee) => `${employee.firstName} ${employee.lastName}`,
        cell: ({ row }) => (
          <button
            type="button"
            className="flex items-center gap-3 text-left font-medium text-slate-900 hover:text-primary-700"
            onClick={() => setDetailEmployee(row.original)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
              {row.original.firstName.charAt(0)}
              {row.original.lastName.charAt(0)}
            </span>
            <span>
              <span className="block">{row.original.firstName} {row.original.lastName}</span>
              <span className="block text-xs font-normal text-slate-500">{row.original.position || "Belum ada jabatan"}</span>
            </span>
          </button>
        )
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email"
      },
      {
        id: "department",
        header: "Departemen",
        accessorKey: "department"
      },
      {
        id: "role",
        header: "Peran",
        accessorKey: "role"
        ,
        cell: ({ row }) => formatRole(row.original.role)
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (employee) => employee.isActive,
        cell: ({ row }) => (
          <Badge
            label={row.original.isActive ? "Aktif" : "Nonaktif"}
            variant={row.original.isActive ? "success" : "neutral"}
          />
        )
      },
      {
        id: "leaveBalance",
        header: "Sisa Hak Cuti",
        accessorKey: "leaveBalance"
      },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActionsMenu
              items={[
                { label: "Lihat detail", onSelect: () => setDetailEmployee(row.original) },
                {
                  label: "Ubah",
                  disabled: isPreviewMode,
                  onSelect: () => {
                    if (guardPreviewAction("Mode demo tidak mengubah data karyawan. Masuk sebagai HR untuk mengedit data.")) {
                      return;
                    }
                    navigate(`/employees/${row.original.id}/edit`);
                  }
                },
                {
                  label: row.original.isActive ? "Nonaktifkan" : "Pulihkan",
                  tone: row.original.isActive ? "danger" : "default",
                  disabled: deleteEmployee.isPending || restoreEmployee.isPending,
                  onSelect: () =>
                    openAction(row.original, row.original.isActive ? "deactivate" : "restore")
                }
              ]}
            />
          </div>
        )
      }
    ],
    [deleteEmployee.isPending, guardPreviewAction, isPreviewMode, navigate, openAction, restoreEmployee.isPending]
  );

  const sorting = tableState.sorting as SortingState;
  const activeFilters = [
    tableState.search
      ? { key: "search", label: "Pencarian", value: tableState.search, onRemove: () => tableState.setFilter("search", "") }
      : null,
    tableState.department
      ? { key: "department", label: "Departemen", value: tableState.department, onRemove: () => tableState.setFilter("department", "") }
      : null,
    tableState.role
      ? { key: "role", label: "Peran", value: formatRole(tableState.role as Employee["role"]), onRemove: () => tableState.setFilter("role", "") }
      : null,
    status && status !== "ACTIVE"
      ? {
          key: "status",
          label: "Status",
          value: status === "INACTIVE" ? "Nonaktif" : "Semua terlihat",
          onRemove: () => tableState.setFilter("status", "")
        }
      : null
  ].filter(Boolean) as Array<{ key: string; label: string; value: string; onRemove: () => void }>;

  return (
    <div className="space-y-6">
      <Seo title="Data Karyawan" description="Kelola direktori karyawan, peran, departemen, status akun, dan sisa hak cuti." />
      <PageHeader
        title={user?.role === "SUPER_ADMIN" ? "Manajemen Pengguna" : "Data Karyawan"}
        eyebrow={user?.role === "SUPER_ADMIN" ? "Administrasi Akses" : "Karyawan"}
        description={
          user?.role === "SUPER_ADMIN"
            ? "Kelola akun pengguna, peran, status akses, struktur organisasi, dan sisa hak cuti dari satu tempat."
            : "Kelola direktori karyawan, status akun, struktur organisasi, dan sisa hak cuti dari satu tempat."
        }
        meta={
          <>
            <Badge label={`${summaryQuery.data?.active ?? 0} aktif`} variant="success" />
            <Badge label={`${summaryQuery.data?.inactive ?? 0} nonaktif`} variant="neutral" />
          </>
        }
        actions={
          <>
          <Button variant="outline" type="button" onClick={handleExport}>
            <Download size={16} />
            {exporting ? "Mengunduh..." : "Unduh PDF"}
          </Button>
          <Link
            to={isPreviewMode ? "/preview/employees" : "/employees/new"}
            onClick={(event) => {
              if (guardPreviewAction("Mode demo tidak menambah data karyawan. Masuk sebagai HR untuk membuat data baru.")) {
                event.preventDefault();
              }
            }}
          >
            <Button type="button" disabled={isPreviewMode}>
              <Plus size={16} />
              Tambah Karyawan
            </Button>
          </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Aktif" value={summaryQuery.data?.active ?? 0} icon={<Users size={20} />} tone="success" />
        <StatCard label="Nonaktif" value={summaryQuery.data?.inactive ?? 0} icon={<UserRound size={20} />} tone="neutral" />
        <StatCard label="Diarsipkan" value={summaryQuery.data?.archived ?? 0} icon={<UserRound size={20} />} tone="warning" />
        <StatCard label="Departemen" value={summaryQuery.data?.departments.length ?? 0} icon={<Users size={20} />} />
      </div>

      {exportError ? <ErrorState message={exportError} /> : null}

      <Card className="space-y-4">
        <SectionHeader
          title="Direktori Karyawan"
          description="Gunakan pencarian dan filter untuk menemukan karyawan, lalu buka detail tanpa meninggalkan daftar."
        />
        <Toolbar
          activeFilters={activeFilters}
          onClear={tableState.clearFilters}
          summary={`${data?.meta.total ?? 0} karyawan sesuai filter`}
        >
          <SearchInput
            label="Cari karyawan"
            placeholder="Cari nama atau email"
            value={tableState.search}
            onChange={(value) => tableState.setFilter("search", value)}
          />
          <Select
            label="Departemen"
            value={tableState.department}
            onChange={(event) => tableState.setFilter("department", event.target.value)}
          >
            <option value="">Semua departemen</option>
            {(metaQuery.data?.departments || []).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
          <Select
            label="Peran"
            value={tableState.role}
            onChange={(event) => tableState.setFilter("role", event.target.value)}
          >
            <option value="">Semua peran</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="HR">HR</option>
            <option value="EMPLOYEE">Karyawan</option>
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(event) => tableState.setFilter("status", event.target.value)}
          >
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
            <option value="ALL">Semua terlihat</option>
          </Select>
        </Toolbar>

        {isLoading ? (
          <LoadingState label="Memuat data karyawan..." />
        ) : error ? (
          <ErrorState message={getErrorMessage(error, "Gagal memuat data karyawan")} />
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
            emptyMessage="Tidak ada karyawan yang sesuai dengan pencarian atau filter saat ini."
            mobileRender={(employee) => (
                <MobileDataItem
                  key={employee.id}
                  title={`${employee.firstName} ${employee.lastName}`}
                  subtitle={`${employee.email} • ${employee.department}`}
                  meta={
                    <Badge
                      label={employee.isActive ? "Aktif" : "Nonaktif"}
                      variant={employee.isActive ? "success" : "neutral"}
                    />
                  }
                  actions={
                    <>
                      <Button variant="secondary" type="button" onClick={() => setDetailEmployee(employee)}>
                        Detail
                      </Button>
                      <Link
                        to={isPreviewMode ? "/preview/employees" : `/employees/${employee.id}/edit`}
                        onClick={(event) => {
                          if (guardPreviewAction("Mode demo tidak mengubah data karyawan. Masuk sebagai HR untuk mengedit data.")) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <Button variant="secondary" type="button" disabled={isPreviewMode}>
                          Ubah
                        </Button>
                      </Link>
                      <Button
                        variant={employee.isActive ? "danger" : "secondary"}
                        type="button"
                        onClick={() => openAction(employee, employee.isActive ? "deactivate" : "restore")}
                      >
                        {employee.isActive ? "Nonaktifkan" : "Pulihkan"}
                      </Button>
                    </>
                  }
                >
                  <p>Peran: {formatRole(employee.role)}</p>
                  <p>Jabatan: {employee.position || "-"}</p>
                  <p>Sisa hak cuti: {employee.leaveBalance} hari</p>
                </MobileDataItem>
            )}
          />
        ) : (
          null
        )}
      </Card>
      <Drawer
        open={Boolean(detailEmployee)}
        title={detailEmployee ? `${detailEmployee.firstName} ${detailEmployee.lastName}` : "Detail karyawan"}
        description="Profil ringkas, status akses, dan sisa hak cuti."
        onClose={() => setDetailEmployee(null)}
      >
        {detailEmployee ? (
          <div className="space-y-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                  {detailEmployee.firstName.charAt(0)}
                  {detailEmployee.lastName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{detailEmployee.email}</p>
                  <p className="text-sm text-slate-500">{detailEmployee.position || "Belum ada jabatan"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Badge
                  label={detailEmployee.isActive ? "Aktif" : "Nonaktif"}
                  variant={detailEmployee.isActive ? "success" : "neutral"}
                />
              <Link
                to={isPreviewMode ? "/preview/employees" : `/employees/${detailEmployee.id}/edit`}
                onClick={(event) => {
                  if (guardPreviewAction("Mode demo tidak mengubah data karyawan. Masuk sebagai HR untuk mengedit data.")) {
                    event.preventDefault();
                  }
                }}
              >
                <Button type="button" disabled={isPreviewMode}>Ubah karyawan</Button>
              </Link>
              </div>
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{detailEmployee.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Peran</p>
                <p className="font-medium text-slate-900">{formatRole(detailEmployee.role)}</p>
              </div>
              <div>
                <p className="text-slate-500">Departemen</p>
                <p className="font-medium text-slate-900">{detailEmployee.department}</p>
              </div>
              <div>
                <p className="text-slate-500">Jabatan</p>
                <p className="font-medium text-slate-900">{detailEmployee.position || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">Sisa hak cuti</p>
                <p className="font-medium text-slate-900">{detailEmployee.leaveBalance} hari</p>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
      <ConfirmDialog
        open={Boolean(selectedEmployee && actionType)}
        title={actionType === "restore" ? "Pulihkan karyawan?" : "Nonaktifkan karyawan?"}
        description={
          actionType === "restore"
            ? "Karyawan akan kembali aktif dan dapat menggunakan akun kembali."
            : "Karyawan akan menjadi nonaktif dan tidak dapat masuk hingga dipulihkan."
        }
        confirmLabel={actionType === "restore" ? "Pulihkan" : "Nonaktifkan"}
        tone={actionType === "deactivate" ? "danger" : "default"}
        loading={deleteEmployee.isPending || restoreEmployee.isPending}
        onCancel={closeAction}
        onConfirm={handleEmployeeAction}
      />
    </div>
  );
};
