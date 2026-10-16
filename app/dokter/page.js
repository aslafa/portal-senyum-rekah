"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import DataStateWrapper from "@/components/DataStateWrapper";
import {
  Stethoscope,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  ArrowRight
} from "lucide-react";

export default function DasborDokterPage() {
  const router = useRouter();
  const { currentUser, janjiTemu, getUserById, getLayananById, isLoaded } = useStore();

  const [todayStr, setTodayStr] = useState("2026-10-16");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  // Perilaku otomatis Bab 4.9:
  // "Hanya janji dengan dokterId miliknya yang tampil. Janji drg. Sinta tidak terlihat oleh drg. Bima."
  // Jika saat ini sedang mode peran bukan dokter (misal admin atau penguji), kita default ke drg. Bima agar halaman tetap terisi indah
  const currentDoctorId = currentUser?.role === "dokter" ? currentUser.id : "user-bima";
  const doctorProfile = getUserById(currentDoctorId);

  // Janji hari ini milik dokter ini
  const todayJanji = janjiTemu
    .filter((j) => j.dokterId === currentDoctorId && j.tanggal === todayStr)
    .sort((a, b) => a.jam.localeCompare(b.jam));

  const hadirCount = todayJanji.filter((j) => j.status === "hadir").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Ruang Praktik Dokter Gigi (Bab 4.9)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Dasbor {doctorProfile?.nama || "Dokter Gigi"}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Jadwal pasien hari ini. Pasien yang berstatus <strong>Hadir</strong> siap dipanggil ke ruang periksa.
          </p>
        </div>

        {/* Doctor Switcher Quick Pill */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl text-xs font-medium">
          <Link
            href="/dokter"
            onClick={() => {}}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentDoctorId === "user-bima"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            drg. Bima
          </Link>
          <Link
            href="/dokter"
            onClick={() => {}}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentDoctorId === "user-sinta"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            drg. Sinta
          </Link>
        </div>
      </div>

      {/* Kartu Ringkasan Pasien Hadir */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 bg-purple-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Pasien Siap Diperiksa (Hadir)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-900 tabular-nums">
                {hadirCount}
              </span>
              <span className="text-xs text-purple-700 font-medium">menunggu di antrean</span>
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-1">
              Ditandai oleh resepsionis saat pasien tiba di klinik
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
            🩺
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
              Total Pasien Hari Ini
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
                {todayJanji.length}
              </span>
              <span className="text-xs text-[#5A6B78]">terdaftar</span>
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-1 tabular-nums">
              Tanggal: {todayStr}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center font-bold text-xl">
            🗓️
          </div>
        </div>
      </div>

      {/* Tabel Antrean Hari Ini (Bab 4.9: Jam, Pasien, Layanan, Keluhan, Status) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#0E7490]" /> Antrean Pasien Hari Ini
          </h2>
          <span className="text-xs text-[#5A6B78]">
            Klik pasien <strong>Hadir</strong> untuk membuka form pemeriksaan
          </span>
        </div>

        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={todayJanji.length === 0}
          emptyTitle="Belum Ada Jadwal Pasien Hari Ini"
          emptyDescription={`Tidak ada janji temu terdaftar untuk ${doctorProfile?.nama} pada tanggal ${todayStr}.`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Jam</th>
                  <th className="py-3.5 px-4">Nama Pasien</th>
                  <th className="py-3.5 px-4">Layanan</th>
                  <th className="py-3.5 px-4">Keluhan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todayJanji.map((item) => {
                  const pasien = getUserById(item.pasienId);
                  const layanan = getLayananById(item.layananId);
                  const isReady = item.status === "hadir";

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        // Bab 4.9: "Janji Hadir ditandai Siap diperiksa. Klik Andi yang berstatus Hadir membuka /dokter/janji/[id]"
                        router.push(`/dokter/janji/${item.id}`);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isReady
                          ? "bg-purple-50/30 hover:bg-purple-50/60 font-semibold"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-5 font-bold text-gray-900 tabular-nums">
                        {item.jam} WITA
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{pasien?.nama}</div>
                        <div className="text-[11px] text-[#5A6B78] font-normal tabular-nums">
                          {pasien?.noHp}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-gray-800">
                        {layanan?.nama}
                      </td>

                      <td className="py-4 px-4 text-gray-600 max-w-xs truncate">
                        {item.keluhan || "-"}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={item.status} />
                          {isReady && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 animate-pulse">
                              ★ Siap diperiksa
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {isReady ? (
                          <span className="px-3 py-1.5 bg-[#0E7490] hover:bg-[#0c627a] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 shadow-xs">
                            <FileEdit className="w-3.5 h-3.5" /> Periksa Pasien
                          </span>
                        ) : item.status === "selesai" ? (
                          <span className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                          </span>
                        ) : (
                          <span className="text-[#5A6B78] text-xs">
                            Menunggu Kedatangan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>
      </div>
    </div>
  );
}
