"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  Shield,
  CalendarCheck2,
  Calendar,
  AlertCircle,
  Users,
  Layers,
  CalendarDays,
  BarChart3,
  ArrowRight,
  TrendingUp,
  UserCheck
} from "lucide-react";

export default function DasborAdminPage() {
  const { janjiTemu, users, layanan, isLoaded } = useStore();

  const [todayStr, setTodayStr] = useState("2026-10-16");
  const [currentMonthPrefix, setCurrentMonthPrefix] = useState("2026-10");

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    setTodayStr(today);
    setCurrentMonthPrefix(`${y}-${m}`);
  }, []);

  // Bab 4.12: Kunjungan hari ini (jumlah janji berstatus Selesai hari ini)
  const kunjunganHariIni = useMemo(() => {
    return janjiTemu.filter((j) => j.tanggal === todayStr && j.status === "selesai").length;
  }, [janjiTemu, todayStr]);

  // Bab 4.12: Kunjungan bulan ini (jumlah janji berstatus Selesai bulan ini)
  const kunjunganBulanIni = useMemo(() => {
    return janjiTemu.filter(
      (j) => j.tanggal.startsWith(currentMonthPrefix) && j.status === "selesai"
    ).length;
  }, [janjiTemu, currentMonthPrefix]);

  // Bab 4.12: Menunggu konfirmasi
  const menungguKonfirmasi = useMemo(() => {
    return janjiTemu.filter((j) => j.status === "menunggu").length;
  }, [janjiTemu]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Super Admin Klinik (Bab 4.12)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Dasbor Pemilik Klinik Senyum Rekah
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Ringkasan operasional klinik, statistik kunjungan selesai, dan pengelolaan master data.
          </p>
        </div>

        <Link
          href="/admin/laporan"
          className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 shrink-0"
        >
          <BarChart3 className="w-4 h-4" /> Buka Laporan Bulanan
        </Link>
      </div>

      {/* Kartu Ringkasan Bab 4.12 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Kunjungan Hari Ini */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0E7490] uppercase tracking-wider">
              Kunjungan Hari Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
              {kunjunganHariIni}
            </span>
            <span className="text-xs text-[#5A6B78] font-medium">janji selesai</span>
          </div>
          <p className="text-[11px] text-[#5A6B78] mt-2 tabular-nums">
            Tanggal: {todayStr}
          </p>
        </div>

        {/* Kunjungan Bulan Ini (Bisa diklik menuju /admin/laporan sesuai Bab 4.12) */}
        <Link
          href="/admin/laporan"
          className="bg-white p-6 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Kunjungan Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-900 tabular-nums">
              {kunjunganBulanIni}
            </span>
            <span className="text-xs text-emerald-700 font-medium">pasien selesai</span>
          </div>
          <p className="text-[11px] text-[#5A6B78] group-hover:text-emerald-800 transition-colors mt-2 font-semibold flex items-center gap-1">
            Buka Laporan Bulan Berjalan →
          </p>
        </Link>

        {/* Menunggu Konfirmasi */}
        <Link
          href="/resepsionis/janji?status=menunggu"
          className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-amber-300 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Menunggu Konfirmasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-800 tabular-nums">
              {menungguKonfirmasi}
            </span>
            <span className="text-xs text-amber-700 font-medium">perlu respon</span>
          </div>
          <p className="text-[11px] text-[#5A6B78] mt-2">
            Dikelola oleh resepsionis klinik
          </p>
        </Link>
      </div>

      {/* Grid Pintasan Master Data Super Admin */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#0E7490]" />
          Modul Pengelolaan Master Data (Bab 4.13 - 4.16)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/pengguna"
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#0E7490] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Kelola Pengguna</h3>
            <p className="text-xs text-[#5A6B78] mt-1">
              Atur peran (role) pengguna dan nonaktifkan akun bila diperlukan.
            </p>
            <span className="mt-3 text-xs font-semibold text-[#0E7490] flex items-center gap-1">
              Buka Pengguna ({users.length}) →
            </span>
          </Link>

          <Link
            href="/admin/layanan"
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#0E7490] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center font-bold mb-3 group-hover:bg-[#0E7490] group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Kelola Layanan</h3>
            <p className="text-xs text-[#5A6B78] mt-1">
              Tambah tarif, durasi menit (kelipatan 30), dan status aktif layanan.
            </p>
            <span className="mt-3 text-xs font-semibold text-[#0E7490] flex items-center gap-1">
              Buka Layanan ({layanan.length}) →
            </span>
          </Link>

          <Link
            href="/admin/jadwal-dokter"
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#0E7490] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Jadwal Dokter</h3>
            <p className="text-xs text-[#5A6B78] mt-1">
              Atur hari (Senin-Sabtu) dan jam praktik drg. Bima & drg. Sinta.
            </p>
            <span className="mt-3 text-xs font-semibold text-[#0E7490] flex items-center gap-1">
              Atur Jadwal →
            </span>
          </Link>

          <Link
            href="/admin/laporan"
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#0E7490] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Laporan Kunjungan</h3>
            <p className="text-xs text-[#5A6B78] mt-1">
              Statistik kunjungan per dokter dan per layanan per bulan.
            </p>
            <span className="mt-3 text-xs font-semibold text-[#0E7490] flex items-center gap-1">
              Lihat Laporan →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
