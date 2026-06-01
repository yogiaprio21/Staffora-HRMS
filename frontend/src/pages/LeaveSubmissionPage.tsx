import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, RotateCcw, Send } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { PageHeader } from "../components/ui/PageHeader";
import { Textarea } from "../components/ui/Textarea";
import { FormSection } from "../components/ui/FormSection";
import { DateRangeField } from "../components/ui/DateRangeField";
import { Badge } from "../components/ui/Badge";
import { useToast } from "../components/ui/ToastContext";
import { Seo } from "../components/seo/Seo";
import { useAuth } from "../features/auth/AuthContext";
import { useEmployees } from "../features/employees/employeeQueries";
import { useSubmitLeave } from "../features/leaves/leaveQueries";
import { getErrorMessage } from "../lib/errors";
import { calculateInclusiveDays } from "../lib/date";

const schema = z
  .object({
    employeeId: z.string().optional(),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    reason: z.string().min(8, "Alasan minimal 8 karakter")
  })
  .refine((values) => !values.endDate || !values.startDate || values.endDate >= values.startDate, {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"]
  });

type FormValues = z.infer<typeof schema>;

export const LeaveSubmissionPage = () => {
  const { user } = useAuth();
  const { notify } = useToast();
  const [error, setError] = useState<string | null>(null);
  const submitLeave = useSubmitLeave();
  const employeesQuery = useEmployees({ page: 1, limit: 100, status: "ACTIVE" });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const durationDays = calculateInclusiveDays(startDate, endDate);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await submitLeave.mutateAsync({
        employeeId: user?.role === "EMPLOYEE" ? undefined : values.employeeId || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason
      });
      reset();
      notify("Pengajuan cuti berhasil dikirim.", "success");
    } catch (err) {
      const message = getErrorMessage(err, "Gagal mengajukan cuti");
      setError(message);
      notify(message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <Seo title="Ajukan Cuti" />
      <PageHeader
        title="Ajukan Cuti"
        eyebrow="Workflow Cuti"
        description="Ajukan cuti dengan periode, durasi, dan alasan yang jelas agar HR dapat memproses tanpa bolak-balik klarifikasi."
        meta={
          <>
            <Badge label={`${user?.leaveBalance ?? 0} hari saldo`} variant="success" />
            {durationDays > 0 ? <Badge label={`${durationDays} hari dipilih`} variant="warning" /> : null}
          </>
        }
      />
      {error ? <ErrorState message={error} /> : null}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection
          title="Pengajuan Cuti"
          description="Pastikan periode dan alasan cuti sudah jelas sebelum diajukan."
          aside={<CalendarCheck className="h-5 w-5 text-slate-400" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {user?.role !== "EMPLOYEE" ? (
              <Select label="Karyawan" error={errors.employeeId?.message} {...register("employeeId")}>
                <option value="">Gunakan akun saya</option>
                {employeesQuery.data?.items.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} - {employee.department}
                  </option>
                ))}
              </Select>
            ) : null}
            <div className="md:col-span-2">
              <input type="hidden" {...register("startDate")} />
              <input type="hidden" {...register("endDate")} />
              <DateRangeField
                fromLabel="Tanggal mulai"
                toLabel="Tanggal selesai"
                dateFrom={startDate || ""}
                dateTo={endDate || ""}
                onDateFromChange={(value) => setValue("startDate", value, { shouldValidate: true, shouldDirty: true })}
                onDateToChange={(value) => setValue("endDate", value, { shouldValidate: true, shouldDirty: true })}
              />
              {errors.startDate?.message ? <p className="mt-2 text-xs font-medium text-red-600">{errors.startDate.message}</p> : null}
              {errors.endDate?.message ? <p className="mt-2 text-xs font-medium text-red-600">{errors.endDate.message}</p> : null}
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Alasan"
                placeholder="Contoh: Cuti tahunan untuk agenda keluarga"
                hint="Tulis konteks yang cukup agar HR dapat meninjau tanpa klarifikasi ulang."
                error={errors.reason?.message}
                {...register("reason")}
              />
            </div>
          </div>
        </FormSection>
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Estimasi durasi</p>
              <p className="text-xl font-semibold text-slate-900">
                {durationDays > 0 ? `${durationDays} hari` : "Pilih tanggal"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Saldo saat ini</p>
              <p className="text-xl font-semibold text-slate-900">{user?.leaveBalance ?? 0} hari</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Setelah disetujui</p>
              <p className="text-xl font-semibold text-slate-900">
                {durationDays > 0 ? `${Math.max((user?.leaveBalance ?? 0) - durationDays, 0)} hari` : "-"}
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={() => reset()} disabled={isSubmitting}>
              <RotateCcw size={16} />
              Atur ulang
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send size={16} />
              {isSubmitting ? "Mengirim..." : "Ajukan Cuti"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
