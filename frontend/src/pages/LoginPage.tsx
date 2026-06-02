import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PlayCircle,
  ShieldCheck,
  Users
} from "lucide-react";
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

const highlights = [
  { label: "Direktori karyawan", value: "100 data demo", icon: Users },
  { label: "Alur cuti", value: "Persetujuan transparan", icon: CalendarCheck },
  { label: "Log aktivitas", value: "Aktivitas terlacak", icon: Activity }
];

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
    <div className="min-h-screen bg-slate-100 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <Seo title="Masuk" description="Masuk ke Staffora HRMS untuk mengelola data karyawan, cuti, dan laporan HR." noIndex={false} />
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-md lg:grid lg:min-h-[calc(100vh-3rem)] lg:max-w-6xl lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3">
              <span className="rounded-2xl bg-white p-3 text-slate-950">
                <StafforaLogo compact />
              </span>
              <span>
                <span className="block text-xl font-semibold">{APP_NAME}</span>
                <span className="block text-sm text-slate-300">Portfolio HRMS</span>
              </span>
            </div>
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100">
                <ShieldCheck size={16} />
                Mode demo publik lihat saja
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Kelola karyawan, cuti, dan audit dalam satu ruang kerja.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">{APP_TAGLINE}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/preview/dashboard">
                  <Button type="button" variant="light" className="w-full sm:w-auto">
                    <PlayCircle size={16} />
                    Lihat Demo Publik
                  </Button>
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  onClick={() => fillDemo(DEMO_HR_EMAIL)}
                >
                  Isi akses HR
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:mt-12">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <Icon size={18} className="text-emerald-300" />
                  <p className="mt-3 text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center lg:min-h-0 lg:p-8">
        <Card className="w-full space-y-5 p-5 shadow-sm sm:p-7 lg:max-w-md lg:space-y-6 lg:p-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                <StafforaLogo compact />
              </div>
              <Link
                to="/preview/dashboard"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 lg:hidden"
              >
                <PlayCircle size={15} />
                Demo
              </Link>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Masuk</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Portal akses {APP_NAME}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 lg:hidden">
              Kelola data karyawan, cuti, persetujuan, dan audit dalam satu ruang kerja.
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email kerja"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              hint="Gunakan email yang terdaftar di data karyawan."
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Kata sandi"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
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
            <Link to="/preview/dashboard" className="block">
              <Button type="button" variant="outline" className="w-full">
                <PlayCircle size={16} />
                Lihat Demo Tanpa Login
              </Button>
            </Link>
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
    </div>
  );
};
