"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  getJanjiByIdFromFirestore,
  cancelJanjiTemuFromFirestore,
  getActiveLayananFromFirestore,
  getActiveDokterFromFirestore
} from "@/lib/firestore-service";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Calendar,
  Clock,
  User,
  Layers,
  FileText,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2
} from "lucide-react";

export default function RincianJanjiPasienPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { janjiTemu, getUserById, getLayananById, updateJanjiStatus, currentUser } = useStore();

  const [janji, setJanji] = useState(() => janjiTemu.find((j) => j.id === id) || null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [dokterData, setDokterData] = useState(null);
  const [layananData, setLayananData] = useState(null);

  // Ambil detail janji dari Firestore
  useEffect(() => {
    let isMounted = true;

    async function loadJanjiDetail() {
      if (!id) return;
      setLoading(true);
      setErrorMsg("");

      try {
        const firestoreJanji = await getJanjiByIdFromFirestore(id);
        if (isMounted) {
          if (firestoreJanji) {
            setJanji(firestoreJanji);
          } else {
            // Cek di store sebagai fallback
            const localJanji = janjiTemu.find((j) => j.id === id);
            if (localJanji) {
              setJanji(localJanji);
            }
          }
        }
      } catch (err) {
        console.error("Gagal mengambil janji:", err);
        if (isMounted) {
          const localJanji = janjiTemu.find((j) => j.id === id);
          if (localJanji) {
            setJanji(localJanji);
          } else {
            setErrorMsg("Gagal memuat data janji dari server.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadJanjiDetail();

    return () => {
      isMounted = false;
    };
  }, [id, janjiTemu]);

  // Ambil dokter dan layanan
  useEffect(() => {
    let isMounted = true;
    async function resolveMetadata() {
      if (!janji) return;

      // Cek store dulu
      const localDoc = getUserById(janji.dokterId);
      const localLay = getLayananById(janji.layananId);

      if (localDoc) setDokterData(localDoc);
      if (localLay) setLayananData(localLay);

      // Jika salah satu belum ada, ambil dari Firestore
      try {
        if (!localDoc) {
          const allDocs = await getActiveDokterFromFirestore();
          const match = allDocs.find((d) => d.id === janji.dokterId || d.uid === janji.dokterId);
          if (isMounted && match) setDokterData(match);
        }
        if (!localLay) {
          const allLays = await getActiveLayananFromFirestore();
          const matchLay = allLays.find((l) => l.id === janji.layananId);
          if (isMounted && matchLay) setLayananData(matchLay);
        }
      } catch (e) {
        console.error("Gagal resolve dokter/layanan:", e);
      }
    }

    resolveMetadata();
    return () => {
      isMounted = false;
    };
  }, [janji, getUserById, getLayananById]);

  const [todayStr, setTodayStr] = useState("2026-10-16");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E7490] mx-auto mb-3" />
        <p className="text-sm text-[#5A6B78] font-medium">Memuat rincian janji temu...</p>
      </div>
    );
  }

  if (!janji) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Janji tidak ditemukan</h2>
          <p className="text-xs sm:text-sm text-[#5A6B78] mb-5">
            {errorMsg || `Janji temu dengan ID "${id}" tidak terdaftar dalam sistem atau Anda tidak memiliki akses.`}
          </p>
          <Link
            href="/janji"
            className="px-4 py-2 bg-[#0E7490] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#0c627a] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Janji
          </Link>
        </div>
      </div>
    );
  }

  const dokter = dokterData || getUserById(janji.dokterId);
  const layanan = layananData || getLayananById(janji.layananId);
  const pasien = getUserById(janji.pasienId) || currentUser;

  // Periksa aturan pembatalan Bab 4.3.2:
  // "Pasien hanya bisa membatalkan janji Menunggu atau Dikonfirmasi, paling lambat H-1. Pada hari janji tombol Batalkan tidak tampil."
  const isCancellableStatus = janji.status === "menunggu" || janji.status === "dikonfirmasi";
  const isBeforeAppointmentDay = todayStr < janji.tanggal;
  const canCancel = isCancellableStatus && isBeforeAppointmentDay;

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      // 1. Batalkan di Firestore
      await cancelJanjiTemuFromFirestore(janji.id, "Dibatalkan oleh pasien");

      // 2. Update state lokal
      setJanji((prev) => ({
        ...prev,
        status: "dibatalkan",
        alasanBatal: "Dibatalkan oleh pasien"
      }));

      // 3. Sinkronkan ke store jika ada
      if (updateJanjiStatus) {
        updateJanjiStatus(janji.id, "dibatalkan", "Dibatalkan oleh pasien");
      }

      setIsCancelModalOpen(false);
      setCancelFeedback("Janji berhasil dibatalkan. Slot waktu kini kembali tersedia.");
    } catch (err) {
      console.error("Gagal membatalkan janji:", err);
      alert("Gagal membatalkan janji di server: " + (err.message || "Terjadi kesalahan."));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tombol Navigasi Kembali */}
      <Link
        href="/janji"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Janji
      </Link>

      {cancelFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{cancelFeedback}</span>
        </div>
      )}

      {/* Panel Utama Rincian Janji */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Header Rincian */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
                Rincian Janji Pasien
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-[#5A6B78] font-mono">#{janji.id}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
              {layanan?.nama || "Pemeriksaan Gigi"}
            </h1>
          </div>

          <StatusBadge status={janji.status} size="lg" />
        </div>

        {/* Info Grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Tanggal & Jam
              </span>
              <div className="mt-1 font-bold text-gray-900 text-sm tabular-nums flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0E7490]" />
                {janji.tanggal} • {janji.jam} WITA
              </div>
            </div>

            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Dokter Pemeriksa
              </span>
              <div className="mt-1 font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0E7490]" />
                {dokter?.nama || "Dokter Gigi"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Durasi & Estimasi Tarif
              </span>
              <div className="mt-1 font-medium text-gray-900 text-sm tabular-nums">
                {layanan?.durasiMenit || 30} Menit • Rp {layanan?.harga.toLocaleString("id-ID") || "-"}
              </div>
            </div>

            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Nama Pasien
              </span>
              <div className="mt-1 font-medium text-gray-900 text-sm">
                {pasien?.nama} ({pasien?.noHp})
              </div>
            </div>
          </div>

          {/* Keluhan */}
          <div>
            <span className="text-xs font-semibold text-[#5A6B78] block mb-1">
              Keluhan Pasien:
            </span>
            <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed">
              {janji.keluhan || "Tidak ada catatan keluhan tertulis."}
            </p>
          </div>

          {/* Alasan Dibatalkan (Bab 4.3.2: "Bila dibatalkan resepsionis, alasannya ikut tampil.") */}
          {janji.status === "dibatalkan" && (
            <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-800">
              <span className="font-semibold block mb-0.5">Alasan Pembatalan:</span>
              <span>{janji.alasanBatal || "Dibatalkan oleh klinik atau pasien."}</span>
            </div>
          )}

          {/* Validasi & Tombol Batalkan Janji */}
          {canCancel ? (
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-[#5A6B78]">
                <p>Pembatalan mandiri dibuka hingga H-1 sebelum tanggal janji.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#E53935] border border-red-200 font-semibold text-xs rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Batalkan Janji Ini
              </button>
            </div>
          ) : isCancellableStatus && !isBeforeAppointmentDay ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Janji dijadwalkan untuk hari ini. Pembatalan hari H hanya dapat dilakukan dengan menghubungi resepsionis klinik langsung via telepon atau WhatsApp.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Confirmation Modal Bab 5.4 */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Konfirmasi Pembatalan Janji"
        message={`Apakah Anda yakin ingin membatalkan janji temu pada ${janji.tanggal} pukul ${janji.jam}? Slot waktu ini akan dilepas dan dapat diambil pasien lain.`}
        confirmText="Ya, Batalkan Janji"
        cancelText="Jangan Batalkan"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
