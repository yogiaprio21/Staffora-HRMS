import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { IconButton } from "../components/ui/IconButton";
import { StafforaLogo } from "../components/brand/StafforaLogo";
import { Seo } from "../components/seo/Seo";
import {
  APP_NAME,
  APP_TAGLINE,
  DEMO_EMPLOYEE_EMAIL,
  DEMO_HR_EMAIL,
  DEMO_MODE,
  DEMO_PASSWORD
} from "../lib/config";
import { useAuth } from "../features/auth/AuthContext";
import { getErrorMessage } from "../lib/errors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const fillDemo = (email: string) => {
    setValue("email", email, { shouldValidate: true, shouldDirty: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (user) {
      navigate(user.role === "EMPLOYEE" ? "/profile" : "/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const employee = await login(values);
      navigate(employee.role === "EMPLOYEE" ? "/profile" : "/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Login gagal"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <Seo title="Masuk" description="Masuk ke Staffora HRMS untuk mengelola data karyawan, cuti, dan laporan HR." noIndex={false} />
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden space-y-6 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <ShieldCheck size={16} />
            Ruang kerja HR aman
          </div>
          <div className="max-w-xl">
            <h1 className="text-5xl font-semibold tracking-normal text-slate-950">{APP_NAME}</h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-slate-600">{APP_TAGLINE}</p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-3">
            {["Karyawan", "Cuti", "Audit"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{item}</p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
        <Card className="mx-auto w-full max-w-md space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
              <StafforaLogo compact />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Masuk</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Portal akses {APP_NAME}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email kerja"
              type="email"
              placeholder="name@company.com"
              hint="Gunakan email yang terdaftar di data karyawan."
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Kata sandi"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              leftIcon={<LockKeyhole size={16} />}
              rightElement={
                <IconButton
                  label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="h-8 w-8 border-none bg-transparent"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              }
              error={errors.password?.message}
              {...register("password")}
            />
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Masuk..." : "Masuk"}
            </Button>
            {DEMO_MODE ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Akses demo</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fillDemo(DEMO_HR_EMAIL)}
                    disabled={isSubmitting}
                  >
                    Demo HR
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fillDemo(DEMO_EMPLOYEE_EMAIL)}
                    disabled={isSubmitting}
                  >
                    Demo Karyawan
                  </Button>
                </div>
              </div>
            ) : null}
          </form>
        </Card>
      </div>
    </div>
  );
};
