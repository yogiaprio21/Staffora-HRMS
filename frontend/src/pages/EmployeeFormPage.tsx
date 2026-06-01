import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { FormSection } from "../components/ui/FormSection";
import { useToast } from "../components/ui/ToastContext";
import { Seo } from "../components/seo/Seo";
import { useAuth } from "../features/auth/AuthContext";
import {
  useCreateEmployee,
  useEmployee,
  useUpdateEmployee
} from "../features/employees/employeeQueries";
import { getErrorMessage } from "../lib/errors";
import { parseOptionalBoolean } from "../lib/form";

const passwordSchema = z
  .string()
  .min(8)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: passwordSchema,
  role: z.enum(["SUPER_ADMIN", "HR", "EMPLOYEE"]),
  department: z.string().min(1),
  position: z.string().optional(),
  leaveBalance: z.coerce.number().int().min(0).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform(parseOptionalBoolean)
});

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: "SUPER_ADMIN" | "HR" | "EMPLOYEE";
  department: string;
  position?: string;
  leaveBalance?: number;
  isActive?: boolean | string;
};

export const EmployeeFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);
  const { notify } = useToast();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const employeeQuery = useEmployee(id);
  const existing = employeeQuery.data;

  const resolver = zodResolver(schema) as Resolver<FormValues>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setError
  } = useForm<FormValues>({ resolver });

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        role: existing.role,
        department: existing.department,
        position: existing.position || "",
        leaveBalance: existing.leaveBalance,
        isActive: String(existing.isActive)
      });
    }
  }, [isEdit, existing, reset]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const goBack = () => {
    if (isDirty && !window.confirm("Perubahan belum disimpan. Tinggalkan halaman?")) {
      return;
    }
    navigate("/employees");
  };

  const onSubmit = async (values: FormValues) => {
    setPageError(null);
    try {
      if (!isEdit && !values.password) {
        setError("password", { message: "Password wajib diisi" });
        return;
      }
      if (isEdit && id) {
        await updateEmployee.mutateAsync({
          id,
          payload: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            role: values.role,
            department: values.department,
            position: values.position,
            leaveBalance: values.leaveBalance,
            isActive: values.isActive === true,
            password: values.password || undefined
          }
        });
      } else {
        await createEmployee.mutateAsync({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password || "",
          role: values.role,
          department: values.department,
          position: values.position
        });
      }
      notify(isEdit ? "Data karyawan berhasil diperbarui." : "Karyawan baru berhasil dibuat.", "success");
      navigate("/employees");
    } catch (err) {
      const message = getErrorMessage(err, "Gagal menyimpan data karyawan");
      setPageError(message);
      notify(message, "error");
    }
  };

  if (isEdit && employeeQuery.isLoading) {
    return <LoadingState label="Memuat data karyawan..." />;
  }

  if (isEdit && !existing && !employeeQuery.isLoading) {
    return <ErrorState message="Data karyawan tidak ditemukan." />;
  }

  return (
    <div className="space-y-6">
      <Seo title={isEdit ? "Ubah Karyawan" : "Tambah Karyawan"} />
      <PageHeader
        title={isEdit ? "Ubah Karyawan" : "Tambah Karyawan"}
        eyebrow="Form Karyawan"
        description="Lengkapi identitas, struktur organisasi, akses, dan kuota cuti dengan informasi yang mudah diverifikasi HR."
        actions={
          <Button variant="secondary" type="button" onClick={goBack}>
            <ArrowLeft size={16} />
            Kembali ke data karyawan
          </Button>
        }
      />

      {pageError ? <ErrorState message={pageError} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Identitas" description="Data utama karyawan dan kredensial masuk.">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nama depan" placeholder="Emma" error={errors.firstName?.message} {...register("firstName")} />
            <Input label="Nama belakang" placeholder="Putri" error={errors.lastName?.message} {...register("lastName")} />
            <Input label="Email kerja" placeholder="emma@company.com" hint="Gunakan email kerja karyawan." error={errors.email?.message} {...register("email")} />
            <Input
              label={isEdit ? "Kata sandi (opsional)" : "Kata sandi"}
              type="password"
              placeholder="Minimal 8 karakter"
              hint={isEdit ? "Kosongkan jika tidak ingin mengganti kata sandi." : "Gunakan minimal 8 karakter."}
              error={errors.password?.message}
              {...register("password")}
            />
          </div>
        </FormSection>

        <FormSection title="Organisasi & Akses" description="Peran menentukan menu dan izin yang tersedia.">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Peran" error={errors.role?.message} {...register("role")}>
              {user?.role === "SUPER_ADMIN" ? <option value="SUPER_ADMIN">Super Admin</option> : null}
              <option value="HR">HR</option>
              <option value="EMPLOYEE">Karyawan</option>
            </Select>
            <Input label="Departemen" placeholder="Engineering" error={errors.department?.message} {...register("department")} />
            <Input label="Jabatan" placeholder="Backend Engineer" hint="Ditampilkan di direktori karyawan dan profil." error={errors.position?.message} {...register("position")} />
            {isEdit ? (
              <Select label="Status akun" error={errors.isActive?.message} {...register("isActive")}>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </Select>
            ) : null}
          </div>
        </FormSection>

        {isEdit ? (
          <FormSection title="Kebijakan Cuti" description="Atur sisa hak cuti yang digunakan dalam alur pengajuan.">
            <Input
              label="Sisa hak cuti"
              type="number"
              placeholder="20"
              hint="Nilai ini dikurangi ketika cuti disetujui."
              error={errors.leaveBalance?.message}
              {...register("leaveBalance")}
            />
          </FormSection>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} />
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button variant="secondary" type="button" onClick={goBack}>
            Batal
          </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
