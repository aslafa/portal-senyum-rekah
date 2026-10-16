import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-cyan-50 text-[#0E7490] rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
          404
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-[#5A6B78] mb-6">
          Alamat yang Anda cari tidak terdaftar di sistem Portal Janji Senyum Rekah atau telah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/beranda"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#0c627a] text-white text-sm font-semibold transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
