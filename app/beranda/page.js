"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import DataStateWrapper from "@/components/DataStateWrapper";
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileText,
  AlertCircle
} from "lucide-react";

export default function BerandaPage() {
  const router = useRouter();
  const { currentUser, janjiTemu, getUserById, getLayananById, isLoaded } = useStore();

  // Ambil janji milik pasien yang belum selesai atau dibatalkan, diurutkan tanggal & jam terdekat
  const patientJanji = janjiTemu
    .filter(
      (j) =>
        j.pasienId === currentUser?.id &&
        j.status !== "selesai" &&
        j.status !== "dibatalkan"
    )
    .sort((a, b) => new Date(`${a.tanggal}T${a.jam}`) - new Date(`${b.tanggal}T${b.jam}`));

  const nearestJanji = patientJanji[0];
  const dokter = nearestJanji ? getUserById(nearestJanji.dokterId) : null;
  const layanan = nearestJanji ? getLayananById(nearestJanji.layananId) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Salam */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Beranda Pasien
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Halo, {currentUser?.nama} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Selamat datang di Portal Janji Senyum Rekah. Pantau jadwal periksa gigi Anda di sini.
          </p>
        </div>

        <Link
          href="/janji/baru"
          className="px-5 py-2.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-sm rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Janji Baru
        </Link>
      </div>

      {/* Kartu Janji Terdekat Sesuai Bab 4.2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0E7490]" />
            Janji Terdekat Anda
          </h2>
          {nearestJanji && (
            <Link
              href="/janji"
              className="text-xs text-[#0E7490] font-semibold hover:underline flex items-center gap-1"
            >
              Lihat Semua Janji ({patientJanji.length}) →
            </Link>
          )}
        </div>

        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={!nearestJanji}
          emptyTitle="Belum ada janji"
          emptyDescription="Anda belum memiliki jadwal janji temu aktif. Klik tombol di bawah untuk membuat janji baru dengan dokter gigi kami."
          emptyAction={
            <Link
              href="/janji/baru"
              className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Janji Sekarang
            </Link>
          }
        >
          {nearestJanji && (
            <div
              onClick={() => router.push(`/janji/${nearestJanji.id}`)}
              className="bg-white rounded-2xl border-2 border-cyan-100 hover:border-[#0E7490] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center font-bold text-sm">
                    🗓️
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5A6B78]">
                      Jadwal Pemeriksaan
                    </p>
                    <p className="text-base font-bold text-gray-900 tabular-nums">
                      {nearestJanji.tanggal} • Pukul {nearestJanji.jam} WITA
                    </p>
                  </div>
                </div>

                <StatusBadge status={nearestJanji.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-[#5A6B78] block">Dokter Penanggung Jawab</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {dokter?.nama || "Dokter Gigi Senyum Rekah"}
                  </span>
                </div>

                <div>
                  <span className="text-[#5A6B78] block">Layanan Gigi</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {layanan?.nama || "Pemeriksaan Gigi"}
                  </span>
                </div>

                {nearestJanji.keluhan && (
                  <div className="sm:col-span-2">
                    <span className="text-[#5A6B78] block">Keluhan</span>
                    <p className="font-medium text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-1">
                      "{nearestJanji.keluhan}"
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#0E7490] font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Klik kartu untuk membuka rincian janji & pembatalan</span>
                <span className="flex items-center gap-1">
                  Rincian Janji <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          )}
        </DataStateWrapper>
      </div>

      {/* Pintasan Menu Pasien Lainnya */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          href="/janji"
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0E7490] transition-colors shadow-xs group"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-50 text-[#0E7490] flex items-center justify-center mb-2 font-bold group-hover:bg-[#0E7490] group-hover:text-white transition-colors">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Daftar Janji Saya</h3>
          <p className="text-xs text-[#5A6B78] mt-1">
            Lihat semua daftar janji temu Anda dan status konfirmasinya.
          </p>
        </Link>

        <Link
          href="/riwayat"
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0E7490] transition-colors shadow-xs group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Riwayat Perawatan</h3>
          <p className="text-xs text-[#5A6B78] mt-1">
            Baca tindakan dan catatan dokter dari kunjungan yang selesai.
          </p>
        </Link>

        <Link
          href="/profil"
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0E7490] transition-colors shadow-xs group"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center mb-2 font-bold group-hover:bg-[#0E7490] group-hover:text-white transition-colors">
            <User className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Profil Akun</h3>
          <p className="text-xs text-[#5A6B78] mt-1">
            Perbarui nama lengkap dan nomor WhatsApp aktif Anda.
          </p>
        </Link>
      </div>
    </div>
  );
}
