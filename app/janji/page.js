"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import StatusBadge from "@/components/StatusBadge";
import DataStateWrapper from "@/components/DataStateWrapper";
import { Calendar, PlusCircle, Clock, ChevronRight, Loader2 } from "lucide-react";

export default function DaftarJanjiPasienPage() {
  const router = useRouter();

  const [currentUid, setCurrentUid] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [janjiList, setJanjiList] = useState([]);
  const [loadingJanji, setLoadingJanji] = useState(true);

  // Cache data dokter dan layanan dari Firestore
  const [dokterMap, setDokterMap] = useState({});
  const [layananMap, setLayananMap] = useState({});

  const [statusFilter, setStatusFilter] = useState("semua");

  // Listener autentikasi Firebase
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      if (user) {
        setCurrentUid(user.uid);
      } else {
        setCurrentUid(null);
      }
      setAuthChecking(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Muat referensi nama Dokter dan Layanan dari Firestore
  useEffect(() => {
    let isMounted = true;

    async function loadReferences() {
      try {
        const [usersSnap, layananSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "layanan"))
        ]);

        if (!isMounted) return;

        const dMap = {};
        usersSnap.forEach((docSnap) => {
          dMap[docSnap.id] = docSnap.data();
        });
        setDokterMap(dMap);

        const lMap = {};
        layananSnap.forEach((docSnap) => {
          lMap[docSnap.id] = docSnap.data();
        });
        setLayananMap(lMap);
      } catch (e) {
        console.warn("Gagal memuat referensi dokter/layanan Firestore:", e);
      }
    }

    loadReferences();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listener Realtime Firestore untuk janji milik pasien ini (PRD 4.3.2 & 7.1)
  useEffect(() => {
    if (!currentUid) {
      setJanjiList([]);
      setLoadingJanji(false);
      return;
    }

    setLoadingJanji(true);

    const janjiCol = collection(db, "janji_temu");
    const q = query(janjiCol, where("pasienId", "==", currentUid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });

        // Urutkan dari tanggal dan jam terbaru
        items.sort((a, b) => {
          const dateA = new Date(`${a.tanggal}T${a.jam || "00:00"}`);
          const dateB = new Date(`${b.tanggal}T${b.jam || "00:00"}`);
          return dateB - dateA;
        });

        setJanjiList(items);
        setLoadingJanji(false);
      },
      (error) => {
        console.error("Gagal mendengarkan janji_temu dari Firestore:", error);
        setLoadingJanji(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  // Filter berdasarkan status
  const filteredJanji = janjiList.filter((j) =>
    statusFilter === "semua" ? true : j.status === statusFilter
  );

  const getDokterName = (dokterId) => {
    if (!dokterId) return "Dokter Gigi";
    if (dokterMap[dokterId]?.nama) return dokterMap[dokterId].nama;
    if (dokterId.includes("bima")) return "drg. Bima Perkasa";
    if (dokterId.includes("sinta")) return "drg. Sinta Dewi";
    return "Dokter Gigi";
  };

  const getLayananName = (layananId) => {
    if (!layananId) return "Layanan Gigi";
    if (layananMap[layananId]?.nama) return layananMap[layananId].nama;
    return "Layanan Gigi";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Janji Saya (PRD Bab 4.3.2)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Daftar Janji Temu
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Daftar pemesanan janji temu Anda yang tersimpan di Cloud Firestore.
          </p>
        </div>

        <Link
          href="/janji/baru"
          className="px-4 py-2.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Janji Baru
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
        {["semua", "menunggu", "dikonfirmasi", "hadir", "selesai", "dibatalkan"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap ${
              statusFilter === st
                ? "bg-[#0E7490] text-white font-semibold shadow-xs"
                : "bg-white text-[#5A6B78] border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Tabel Janji */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <DataStateWrapper
          isLoading={authChecking || loadingJanji}
          isEmpty={filteredJanji.length === 0}
          emptyTitle="Tidak ada janji temu"
          emptyDescription={
            statusFilter !== "semua"
              ? `Tidak ditemukan janji dengan status "${statusFilter}".`
              : "Anda belum pernah memesan janji temu di Klinik Gigi Senyum Rekah."
          }
          emptyAction={
            <Link
              href="/janji/baru"
              className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Buat Janji Sekarang
            </Link>
          }
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[#5A6B78] uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Tanggal & Jam</th>
                  <th className="py-3.5 px-4">Dokter Gigi</th>
                  <th className="py-3.5 px-4">Layanan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJanji.map((item) => {
                  const dokterName = getDokterName(item.dokterId);
                  const layananName = getLayananName(item.layananId);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/janji/${item.id}`)}
                      className="hover:bg-cyan-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-gray-900 tabular-nums text-sm">
                          {item.tanggal}
                        </div>
                        <div className="text-[#5A6B78] tabular-nums flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#0E7490]" />
                          Pukul {item.jam} WITA
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {dokterName}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-700">
                        {layananName}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-[#0E7490] font-semibold hover:underline inline-flex items-center gap-1">
                          Rincian <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredJanji.map((item) => {
              const dokterName = getDokterName(item.dokterId);
              const layananName = getLayananName(item.layananId);
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/janji/${item.id}`)}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-sm tabular-nums">
                      {item.tanggal} • {item.jam} WITA
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-[#0E7490]">
                    {layananName}
                  </p>
                  <p className="text-xs text-[#5A6B78] mt-0.5">
                    Dokter: {dokterName}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <span className="text-xs font-semibold text-[#0E7490] flex items-center gap-1">
                      Lihat Rincian <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </DataStateWrapper>
      </div>
    </div>
  );
}
