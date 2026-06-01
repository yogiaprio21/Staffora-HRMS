import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Seo } from "../components/seo/Seo";

export const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <Seo title="Halaman Tidak Ditemukan" />
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <SearchX size={26} />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">Halaman tidak ditemukan</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
        Halaman yang dibuka tidak tersedia atau sudah dipindahkan.
      </p>
      <Link to="/" className="mt-6 inline-flex">
        <Button type="button">
          <Home size={16} />
          Kembali ke beranda
        </Button>
      </Link>
    </div>
  </div>
);
