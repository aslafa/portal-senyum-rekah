"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  listenAllJanjiFromFirestore,
  getAllUsersFromFirestore,
  getActiveDokterFromFirestore,
  getActiveLayananFromFirestore
} from "@/lib/firestore-service";
import StatusBadge from "@/components/StatusBadge";
import DataStateWrapper from "@/components/DataStateWrapper";
import {
  ClipboardList,
  Filter,
  Calendar,
  Clock,
  User,
  Search,
  ChevronRight,
  RotateCcw,
  Loader2
} from "lucide-react";

function KelolaJanjiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status") || "semua";
  const initialTanggal = searchParams.get("tanggal") || "";
  const initialDokter = searchParams.get("dokterId") || "semua";

  const [janjiList, setJanjiList] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [dokterList, setDokterList] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [tanggalFilter, setTanggalFilter] = useState(initialTanggal);
  const [dokterFilter, setDokterFilter] = useState(initialDokter);
  const [searchQuery, setSearchQuery] = useState("");

  // Baca metadata pengguna, dokter, dan layanan dari Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      try {
        const [uMap, dList, lList] = await Promise.all([
          getAllUsersFromFirestore(),
          getActiveDokterFromFirestore(),
          getActiveLayananFromFirestore()
        ]);
        if (isMounted) {
          setUsersMap(uMap);
          setDokterList(dList);
          setLayananList(lList);
        }
      } catch (err) {
        console.error("Gagal memuat metadata:", err);
      }
    }

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime listener untuk janji temu dari Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenAllJanjiFromFirestore(
      (list) => {
        setJanjiList(list);
        setLoading(false);
      },
      (err) => {
        console.error("Gagal mendengarkan janji temu:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Sinkronkan ke URL query params (Bab 4.7: "saringan yang dipilih ikut tersimpan di alamat halaman")
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "semua") params.set("status", statusFilter);
    if (tanggalFilter) params.set("tanggal", tanggalFilter);
    if (dokterFilter !== "semua") params.set("dokterId", dokterFilter);

    const qs = params.toString();
    const newUrl = qs ? `/resepsionis/janji?${qs}` : `/resepsionis/janji`;
    window.history.replaceState(null, "", newUrl);
  }, [statusFilter, tanggalFilter, dokterFilter]);

  // Filter list
  const filteredJanji = useMemo(() => {
    return janjiList
      .filter((j) => (statusFilter === "semua" ? true : j.status === statusFilter))
      .filter((j) => (tanggalFilter ? j.tanggal === tanggalFilter : true))
      .filter((j) => (dokterFilter === "semua" ? true : j.dokterId === dokterFilter))
      .filter((j) => {
        if (!searchQuery) return true;
        const pasien = usersMap[j.pasienId];
        const q = searchQuery.toLowerCase();
        return (
          pasien?.nama?.toLowerCase().includes(q) ||
          pasien?.noHp?.includes(q) ||
          j.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(`${b.tanggal}T${b.jam}`) - new Date(`${a.tanggal}T${a.jam}`));
  }, [janjiList, statusFilter, tanggalFilter, dokterFilter, searchQuery, usersMap]);

  const handleResetFilters = () => {
    setStatusFilter("semua");
    setTanggalFilter("");
    setDokterFilter("semua");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Resepsionis → Kelola Janji (Bab 4.7)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Daftar & Pengelolaan Janji Temu
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Konfirmasi janji baru, lakukan jadwal ulang, batalkan janji, atau tandai kedatangan pasien.
          </p>
        </div>
      </div>

      {/* Panel Saringan / Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#0E7490]" />
            Saringan Data
          </div>
          {(statusFilter !== "semua" || tanggalFilter || dokterFilter !== "semua" || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#0E7490] font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Bersihkan Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Saringan Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Status Janji
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="dikonfirmasi">Dikonfirmasi</option>
              <option value="hadir">Hadir</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Saringan Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Filter Tanggal
            </label>
            <input
              type="date"
              value={tanggalFilter}
              onChange={(e) => setTanggalFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
            />
          </div>

          {/* Saringan Dokter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Dokter Gigi
            </label>
            <select
              value={dokterFilter}
              onChange={(e) => setDokterFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            >
              <option value="semua">Semua Dokter</option>
              {dokterList.map((dok) => (
                <option key={dok.id} value={dok.id}>
                  {dok.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Pencarian Nama Pasien */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Cari Nama / No HP
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama pasien..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Janji Temu */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between text-xs text-[#5A6B78]">
          <span>
            Menampilkan <strong>{filteredJanji.length}</strong> janji temu
          </span>
          <span className="hidden sm:inline">
            Klik baris mana saja untuk mengonfirmasi, menjadwal ulang, atau menandai hadir.
          </span>
        </div>

        <DataStateWrapper
          isLoading={loading}
          isEmpty={filteredJanji.length === 0}
          emptyTitle="Tidak Ada Janji Temu"
          emptyDescription="Tidak ditemukan data janji temu yang sesuai dengan saringan yang dipilih."
          emptyAction={
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Bersihkan Filter
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Tanggal & Jam</th>
                  <th className="py-3.5 px-4">Pasien</th>
                  <th className="py-3.5 px-4">Dokter</th>
                  <th className="py-3.5 px-4">Layanan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJanji.map((item) => {
                  const pasien = usersMap[item.pasienId];
                  const dokter =
                    dokterList.find((d) => d.id === item.dokterId || d.uid === item.dokterId) ||
                    usersMap[item.dokterId];
                  const layanan = layananList.find((l) => l.id === item.layananId);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/resepsionis/janji/${item.id}`)}
                      className="hover:bg-cyan-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold text-gray-900 tabular-nums">
                        <div>{item.tanggal}</div>
                        <div className="text-[11px] text-[#5A6B78] font-normal flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#0E7490]" />
                          {item.jam} WITA
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{pasien?.nama}</div>
                        <div className="text-[11px] text-[#5A6B78] tabular-nums">
                          {pasien?.noHp || "-"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {dokter?.nama}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-700">
                        {layanan?.nama}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[#0E7490] font-semibold hover:underline inline-flex items-center gap-1">
                          Kelola <ChevronRight className="w-3.5 h-3.5" />
                        </span>
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

export default function KelolaJanjiResepsionisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Memuat modul janji...</div>}>
      <KelolaJanjiContent />
    </Suspense>
  );
}
