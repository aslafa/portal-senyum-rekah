"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import DataStateWrapper from "@/components/DataStateWrapper";
import {
  BarChart3,
  Calendar,
  User,
  Layers,
  CheckCircle2,
  TrendingUp,
  Info
} from "lucide-react";

function LaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { janjiTemu, getDokterList, layanan, isLoaded } = useStore();

  const initialBulan = searchParams.get("bulan") || "2026-10";
  const [selectedBulan, setSelectedBulan] = useState(initialBulan);

  useEffect(() => {
    const qBulan = searchParams.get("bulan");
    if (!qBulan) {
      const now = new Date();
      const y = now.getFullYear();
      const m = (now.getMonth() + 1).toString().padStart(2, "0");
      setSelectedBulan(`${y}-${m}`);
    }
  }, [searchParams]);

  // Simpan bulan di URL search params (Bab 4.16: "Bulan yang dipilih tersimpan di alamat halaman.")
  useEffect(() => {
    if (selectedBulan) {
      window.history.replaceState(null, "", `/admin/laporan?bulan=${selectedBulan}`);
    }
  }, [selectedBulan]);

  const dokterList = getDokterList();

  // Bab 4.16: Kunjungan dihitung dari janji berstatus Selesai
  const selesaiJanjiBulanIni = useMemo(() => {
    return janjiTemu.filter(
      (j) => j.status === "selesai" && j.tanggal.startsWith(selectedBulan)
    );
  }, [janjiTemu, selectedBulan]);

  // Tabel 1: Jumlah kunjungan per dokter
  const kunjunganPerDokter = useMemo(() => {
    return dokterList.map((dok) => {
      const count = selesaiJanjiBulanIni.filter((j) => j.dokterId === dok.id).length;
      return {
        id: dok.id,
        nama: dok.nama,
        email: dok.email,
        kunjungan: count
      };
    });
  }, [dokterList, selesaiJanjiBulanIni]);

  // Tabel 2: Jumlah kunjungan per layanan
  const kunjunganPerLayanan = useMemo(() => {
    return layanan.map((lay) => {
      const count = selesaiJanjiBulanIni.filter((j) => j.layananId === lay.id).length;
      return {
        id: lay.id,
        nama: lay.nama,
        durasiMenit: lay.durasiMenit,
        kunjungan: count
      };
    });
  }, [layanan, selesaiJanjiBulanIni]);

  const totalKunjungan = selesaiJanjiBulanIni.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Super Admin → Laporan Kunjungan (Bab 4.16)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Laporan Kunjungan Pasien
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Statistik jumlah kunjungan yang telah selesai diperiksa per dokter dan per layanan per bulan.
          </p>
        </div>

        {/* Pemilih Bulan (Bab 4.16) */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <Calendar className="w-4 h-4 text-[#0E7490]" />
          <label className="text-xs font-semibold text-gray-700">Pilih Periode:</label>
          <input
            type="month"
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
          />
        </div>
      </div>

      {/* Ringkasan Banner Total */}
      <div className="bg-gradient-to-r from-cyan-900 to-[#0E7490] rounded-2xl p-6 text-white shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-cyan-200 uppercase tracking-wider">
            Total Kunjungan Pasien Selesai Periode {selectedBulan}
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold tabular-nums">{totalKunjungan}</span>
            <span className="text-sm text-cyan-100">tindakan perawatan tuntas</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-2xl">
          📈
        </div>
      </div>

      {/* Tabel 1: Jumlah Kunjungan per Dokter (Bab 4.16) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#0E7490]" />
            Tabel 1: Jumlah Kunjungan per Dokter
          </h2>
          <span className="text-xs text-[#5A6B78]">
            Dihitung dari janji berstatus <strong>Selesai</strong>
          </span>
        </div>

        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={kunjunganPerDokter.length === 0}
          emptyTitle="Belum Ada Data Dokter"
          emptyDescription="Data kunjungan dokter belum tersedia."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Nama Dokter Gigi</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4 text-center">Persentase</th>
                  <th className="py-3.5 px-4 text-right">Jumlah Kunjungan Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kunjunganPerDokter.map((item) => {
                  const percent =
                    totalKunjungan > 0
                      ? Math.round((item.kunjungan / totalKunjungan) * 100)
                      : 0;

                  return (
                    <tr key={item.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="py-4 px-5 font-bold text-gray-900 text-sm">
                        {item.nama}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{item.email}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 tabular-nums">
                          {percent}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-base text-[#0E7490] tabular-nums">
                          {item.kunjungan}
                        </span>{" "}
                        <span className="text-[#5A6B78]">pasien</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>
      </div>

      {/* Tabel 2: Jumlah Kunjungan per Layanan (Bab 4.16) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0E7490]" />
            Tabel 2: Jumlah Kunjungan per Layanan
          </h2>
          <span className="text-xs text-[#5A6B78]">
            Frekuensi tindakan medis yang selesai
          </span>
        </div>

        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={kunjunganPerLayanan.length === 0}
          emptyTitle="Belum Ada Layanan"
          emptyDescription="Data kunjungan per layanan belum tersedia."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Nama Layanan Tindakan</th>
                  <th className="py-3.5 px-4">Durasi Standar</th>
                  <th className="py-3.5 px-4 text-center">Persentase</th>
                  <th className="py-3.5 px-4 text-right">Jumlah Kunjungan Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kunjunganPerLayanan.map((item) => {
                  const percent =
                    totalKunjungan > 0
                      ? Math.round((item.kunjungan / totalKunjungan) * 100)
                      : 0;

                  return (
                    <tr key={item.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="py-4 px-5 font-bold text-gray-900 text-sm">
                        {item.nama}
                      </td>
                      <td className="py-4 px-4 text-gray-600 tabular-nums">
                        {item.durasiMenit} Menit
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 tabular-nums">
                          {percent}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-base text-emerald-700 tabular-nums">
                          {item.kunjungan}
                        </span>{" "}
                        <span className="text-[#5A6B78]">tindakan</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-[#5A6B78] flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            <strong>Batasan v1 (Bab 4.16 & Bab 9):</strong> Ekspor Excel/PDF dan perhitungan pendapatan tidak termasuk pada rilis v1.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LaporanAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat laporan...</div>}>
      <LaporanContent />
    </Suspense>
  );
}
