"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listenAllJanjiFromFirestore,
  getActiveDokterFromFirestore,
  getAllUsersFromFirestore,
  getActiveLayananFromFirestore
} from "@/lib/firestore-service";
import StatusBadge from "@/components/StatusBadge";
import DataStateWrapper from "@/components/DataStateWrapper";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  ClipboardList,
  CheckCircle,
  Users,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";

export default function DasborResepsionisPage() {
  const router = useRouter();

  const [janjiTemu, setJanjiTemu] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [todayStr, setTodayStr] = useState("2026-10-16");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  // Baca metadata dokter, users, dan layanan dari Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      try {
        const [dList, uMap, lList] = await Promise.all([
          getActiveDokterFromFirestore(),
          getAllUsersFromFirestore(),
          getActiveLayananFromFirestore()
        ]);
        if (isMounted) {
          setDokterList(dList);
          setUsersMap(uMap);
          setLayananList(lList);
        }
      } catch (err) {
        console.error("Gagal membaca metadata dasbor resepsionis:", err);
      }
    }
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime listener pada seluruh janji temu Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenAllJanjiFromFirestore(
      (list) => {
        setJanjiTemu(list);
        setLoading(false);
      },
      (err) => {
        console.error("Gagal mendengarkan janji di dasbor:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Janji hari ini
  const todayJanji = useMemo(() => {
    return janjiTemu.filter((j) => j.tanggal === todayStr && j.status !== "dibatalkan");
  }, [janjiTemu, todayStr]);

  // Jumlah janji berstatus Menunggu (Bab 4.6: "Menunggu konfirmasi: jumlah janji berstatus Menunggu")
  const waitingCount = useMemo(() => {
    return janjiTemu.filter((j) => j.status === "menunggu").length;
  }, [janjiTemu]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Meja Depan & Resepsionis (Bab 4.6)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Dasbor Resepsionis
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Pantau kehadiran pasien hari ini dan tindak lanjuti janji temu yang menunggu konfirmasi.
          </p>
        </div>

        <Link
          href="/resepsionis/janji"
          className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 shrink-0"
        >
          <ClipboardList className="w-4 h-4" /> Kelola Semua Janji
        </Link>
      </div>

      {/* Kartu Ringkasan Atas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Kartu Menunggu Konfirmasi (Bisa diklik menuju /resepsionis/janji?status=menunggu sesuai Bab 4.6) */}
        <Link
          href="/resepsionis/janji?status=menunggu"
          className="bg-white p-5 rounded-2xl border-2 border-amber-200 hover:border-amber-400 bg-amber-50/20 transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Menunggu Konfirmasi
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-800 tabular-nums">
              {waitingCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">janji pasien</span>
          </div>
          <p className="mt-2 text-[11px] text-[#5A6B78] group-hover:text-amber-800 transition-colors flex items-center gap-1 font-semibold">
            Klik untuk menyaring daftar →
          </p>
        </Link>

        {/* Total Janji Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
              Janji Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#0E7490] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
              {todayJanji.length}
            </span>
            <span className="text-xs text-[#5A6B78]">kunjungan aktif</span>
          </div>
          <p className="mt-2 text-[11px] text-[#5A6B78] tabular-nums">
            Tanggal: {todayStr}
          </p>
        </div>

        {/* Pasien Hadir Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Pasien Tiba (Hadir)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-900 tabular-nums">
              {todayJanji.filter((j) => j.status === "hadir").length}
            </span>
            <span className="text-xs text-purple-700 font-medium">siap diperiksa</span>
          </div>
          <p className="mt-2 text-[11px] text-[#5A6B78]">
            Muncul di dasbor dokter penanggung jawab
          </p>
        </div>
      </div>

      {/* Janji Hari Ini: Satu Kolom per Dokter (Bab 4.6) */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0E7490]" />
            Jadwal Antrean Hari Ini per Dokter
          </h2>
          <p className="text-xs text-[#5A6B78]">
            Satu kolom per dokter gigi praktek hari ini dengan jam, pasien, layanan, dan status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dokterList.map((dokter) => {
            const docJanji = todayJanji
              .filter((j) => j.dokterId === dokter.id)
              .sort((a, b) => a.jam.localeCompare(b.jam));

            return (
              <div
                key={dokter.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col"
              >
                <div className="p-4 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      drg
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{dokter.nama}</h3>
                      <p className="text-[11px] text-[#5A6B78]">
                        {docJanji.length} janji terjadwal hari ini
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/resepsionis/janji?dokterId=${dokter.id}`}
                    className="text-[11px] text-[#0E7490] font-semibold hover:underline"
                  >
                    Semua Janji →
                  </Link>
                </div>

                <div className="p-4 flex-1 divide-y divide-gray-100">
                  {docJanji.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#5A6B78]">
                      Belum ada janji pasien untuk dokter ini hari ini.
                    </div>
                  ) : (
                    docJanji.map((item) => {
                      const pasien = usersMap[item.pasienId];
                      const layanan = layananList.find((l) => l.id === item.layananId);
                      return (
                        <div
                          key={item.id}
                          onClick={() => router.push(`/resepsionis/janji/${item.id}`)}
                          className="py-3 first:pt-0 last:pb-0 hover:bg-cyan-50/40 p-2 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-900 text-xs tabular-nums flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#0E7490]" />
                              {item.jam} WITA
                            </span>
                            <StatusBadge status={item.status} size="sm" />
                          </div>

                          <div className="flex items-baseline justify-between text-xs mt-1">
                            <span className="font-semibold text-gray-900">
                              {pasien?.nama || "Pasien"}
                            </span>
                            <span className="text-[#5A6B78] text-[11px]">
                              {layanan?.nama}
                            </span>
                          </div>

                          {item.status === "hadir" && (
                            <span className="inline-block mt-1.5 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              ✓ Pasien sudah di ruang tunggu
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
