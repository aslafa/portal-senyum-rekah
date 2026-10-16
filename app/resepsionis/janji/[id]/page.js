"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import {
  getJanjiByIdFromFirestore,
  confirmJanjiTemuFromFirestore,
  markHadirJanjiTemuFromFirestore,
  cancelJanjiResepsionisFromFirestore,
  rescheduleJanjiResepsionisFromFirestore,
  getActiveLayananFromFirestore
} from "@/lib/firestore-service";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Calendar,
  Clock,
  User,
  Layers,
  ArrowLeft,
  CheckCircle,
  CalendarCheck,
  CalendarDays,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2
} from "lucide-react";

export default function RincianJanjiResepsionisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [janji, setJanji] = useState(null);
  const [pasienData, setPasienData] = useState(null);
  const [dokterData, setDokterData] = useState(null);
  const [layananData, setLayananData] = useState(null);

  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "", // 'konfirmasi', 'hadir', 'batalkan', 'reschedule'
    title: "",
    message: "",
    confirmVariant: "primary"
  });

  const [alasanBatal, setAlasanBatal] = useState("");
  const [batalError, setBatalError] = useState("");
  const [newTanggal, setNewTanggal] = useState("");
  const [newJam, setNewJam] = useState("10:00");
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [todayStr, setTodayStr] = useState("2026-10-16");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  // 1. Baca Role User yang Sedang Login dari Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;
      try {
        const uSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (uSnap.exists()) {
          setCurrentUserRole(uSnap.data().role || "pasien");
        }
      } catch (e) {
        console.error("Gagal membaca role pengguna login:", e);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Realtime listener pada dokumen janji temu ini dari Firestore
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const docRef = doc(db, "janji_temu", id);
    const unsubscribeDoc = onSnapshot(
      docRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          setJanji(null);
          setLoading(false);
          return;
        }

        const data = { id: docSnap.id, ...docSnap.data() };
        setJanji(data);

        // Ambil data Pasien, Dokter, Layanan dari Firestore jika belum ada
        try {
          if (data.pasienId) {
            const pSnap = await getDoc(doc(db, "users", data.pasienId));
            if (pSnap.exists()) setPasienData(pSnap.data());
          }
          if (data.dokterId) {
            const dSnap = await getDoc(doc(db, "users", data.dokterId));
            if (dSnap.exists()) setDokterData(dSnap.data());
          }
          if (data.layananId) {
            const lSnap = await getDoc(doc(db, "layanan", data.layananId));
            if (lSnap.exists()) setLayananData(lSnap.data());
          }
        } catch (e) {
          console.error("Gagal mengambil metadata pengguna/layanan:", e);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Gagal mengambil dokumen janji dari Firestore:", err);
        setLoading(false);
      }
    );

    return () => unsubscribeDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E7490] mx-auto mb-3" />
        <p className="text-sm text-[#5A6B78] font-medium">Memuat data janji dari Firestore...</p>
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
            Janji temu dengan ID "{id}" tidak ditemukan dalam basis data Firestore.
          </p>
          <Link
            href="/resepsionis/janji"
            className="px-4 py-2 bg-[#0E7490] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#0c627a] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Kelola Janji
          </Link>
        </div>
      </div>
    );
  }

  const dokter = dokterData || { nama: "Dokter Gigi" };
  const layanan = layananData || { nama: "Layanan Gigi", durasiMenit: 30, harga: 0 };
  const pasien = pasienData || { nama: "Pasien", noHp: "-" };

  const isToday = janji.tanggal === todayStr;
  const isFinishedOrCancelled = janji.status === "selesai" || janji.status === "dibatalkan";

  // Actions
  const handleOpenKonfirmasi = () => {
    setErrorMessage("");
    setModalState({
      isOpen: true,
      type: "konfirmasi",
      title: "Konfirmasi Janji Temu",
      message: `Konfirmasi pesanan janji ${pasien?.nama} pada ${janji.tanggal} pukul ${janji.jam}?`,
      confirmVariant: "primary"
    });
  };

  const handleOpenHadir = () => {
    setErrorMessage("");
    setModalState({
      isOpen: true,
      type: "hadir",
      title: "Tandai Pasien Hadir",
      message: `Tandai bahwa ${pasien?.nama} sudah tiba di klinik? Janji akan muncul di Dasbor Dokter (${dokter?.nama}) sebagai Siap Diperiksa.`,
      confirmVariant: "success"
    });
  };

  const handleOpenBatalkan = () => {
    setErrorMessage("");
    setAlasanBatal("");
    setBatalError("");
    setModalState({
      isOpen: true,
      type: "batalkan",
      title: "Batalkan Janji Temu",
      message: `Masukkan alasan pembatalan janji temu ${pasien?.nama}:`,
      confirmVariant: "danger"
    });
  };

  const handleOpenReschedule = () => {
    setErrorMessage("");
    setNewTanggal(janji.tanggal);
    setNewJam(janji.jam);
    setModalState({
      isOpen: true,
      type: "reschedule",
      title: "Jadwal Ulang Janji Temu",
      message: `Tentukan tanggal dan jam baru untuk ${pasien?.nama}:`,
      confirmVariant: "primary"
    });
  };

  const handleConfirmModal = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    setFeedback("");

    try {
      if (modalState.type === "konfirmasi") {
        await confirmJanjiTemuFromFirestore(janji.id, currentUserRole);
        setFeedback("Janji berhasil dikonfirmasi dan status tersimpan di Firestore.");
        setModalState({ isOpen: false, type: "" });
      } else if (modalState.type === "hadir") {
        await markHadirJanjiTemuFromFirestore(janji.id, currentUserRole, todayStr);
        setFeedback("Pasien ditandai Hadir dan siap dipanggil dokter.");
        setModalState({ isOpen: false, type: "" });
      } else if (modalState.type === "batalkan") {
        if (!alasanBatal.trim()) {
          setBatalError("Alasan pembatalan wajib diisi (PRD 4.7).");
          setIsProcessing(false);
          return;
        }
        await cancelJanjiResepsionisFromFirestore(janji.id, alasanBatal.trim(), currentUserRole);
        setFeedback("Janji telah dibatalkan di Firestore dan slot waktu dilepas.");
        setModalState({ isOpen: false, type: "" });
      } else if (modalState.type === "reschedule") {
        if (!newTanggal || !newJam) {
          setIsProcessing(false);
          return;
        }
        await rescheduleJanjiResepsionisFromFirestore({
          janjiId: janji.id,
          newTanggal,
          newJam,
          role: currentUserRole
        });
        setFeedback(`Janji berhasil dijadwal ulang ke ${newTanggal} pukul ${newJam}.`);
        setModalState({ isOpen: false, type: "" });
      }
    } catch (err) {
      console.error("Gagal memproses aksi resepsionis:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses janji.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tombol Navigasi Kembali */}
      <Link
        href="/resepsionis/janji"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Kelola Janji
      </Link>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Panel Utama */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Header Rincian */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
                Kelola Janji Pasien
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-[#5A6B78] font-mono">#{janji.id}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
              {pasien?.nama} - {layanan?.nama}
            </h1>
          </div>

          <StatusBadge status={janji.status} size="lg" />
        </div>

        <div className="p-6 space-y-5">
          {/* Detail Informasi Pasien & Jadwal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Data Pasien
              </span>
              <div className="mt-1 font-bold text-gray-900 text-sm">
                {pasien?.nama}
              </div>
              <div className="text-xs text-[#5A6B78] mt-0.5">
                No HP: <strong className="tabular-nums text-gray-800">{pasien?.noHp}</strong>
              </div>
              <div className="text-xs text-[#5A6B78]">
                Email: {pasien?.email}
              </div>
            </div>

            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Jadwal & Dokter
              </span>
              <div className="mt-1 font-bold text-gray-900 text-sm tabular-nums flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0E7490]" />
                {janji.tanggal} • {janji.jam} WITA
              </div>
              <div className="text-xs text-[#5A6B78] mt-0.5">
                Dokter: <strong className="text-gray-800">{dokter?.nama}</strong>
              </div>
              <div className="text-xs text-[#5A6B78]">
                Durasi: {layanan?.durasiMenit} menit • Biaya: Rp {layanan?.harga.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Keluhan Pasien */}
          <div>
            <span className="text-xs font-semibold text-[#5A6B78] block mb-1">
              Keluhan Pasien:
            </span>
            <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs sm:text-sm text-gray-800">
              {janji.keluhan || "Tidak ada catatan keluhan tertulis."}
            </p>
          </div>

          {/* Alasan Pembatalan bila dibatalkan */}
          {janji.status === "dibatalkan" && (
            <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-800">
              <span className="font-semibold block mb-0.5">Alasan Pembatalan:</span>
              <span>{janji.alasanBatal || "Tidak ada rincian alasan."}</span>
            </div>
          )}

          {/* Batasan Privasi Bab 4.7 & Bab 2.4 */}
          <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl text-xs text-[#0E7490] flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Privasi Medis: Resepsionis tidak dapat melihat tindakan & catatan perawatan dokter.
            </span>
          </div>

          {/* Tombol Aksi Resepsionis (Bab 4.7) */}
          {!isFinishedOrCancelled ? (
            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5">
              {/* 1. Konfirmasi (Hanya untuk Menunggu) */}
              {janji.status === "menunggu" && (
                <button
                  type="button"
                  onClick={handleOpenKonfirmasi}
                  className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" /> Konfirmasi Janji
                </button>
              )}

              {/* 2. Tandai Hadir (Hanya untuk Dikonfirmasi hari ini) */}
              {janji.status === "dikonfirmasi" && isToday && (
                <button
                  type="button"
                  onClick={handleOpenHadir}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Tandai Pasien Hadir
                </button>
              )}

              {/* 3. Jadwal Ulang */}
              <button
                type="button"
                onClick={handleOpenReschedule}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CalendarDays className="w-4 h-4 text-[#0E7490]" /> Jadwal Ulang
              </button>

              {/* 4. Batalkan */}
              <button
                type="button"
                onClick={handleOpenBatalkan}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#E53935] border border-red-200 text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Batalkan Janji
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 text-xs text-[#5A6B78] italic">
              Status janji {janji.status === "selesai" ? "telah selesai" : "dibatalkan"} dan tidak dapat diubah lagi (Bab 4.7).
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={
          modalState.type === "batalkan"
            ? "Batalkan Janji"
            : modalState.type === "hadir"
            ? "Tandai Hadir"
            : modalState.type === "reschedule"
            ? "Simpan Jadwal Baru"
            : "Konfirmasi"
        }
        confirmVariant={modalState.confirmVariant}
        onConfirm={handleConfirmModal}
        onCancel={() => setModalState({ isOpen: false, type: "" })}
      >
        {modalState.type === "batalkan" && (
          <div className="mt-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={alasanBatal}
              onChange={(e) => setAlasanBatal(e.target.value)}
              placeholder="Contoh: Pasien berhalangan hadir atau dokter mendadak cuti..."
              className="w-full p-2.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {batalError && <p className="text-xs text-red-600 mt-1">{batalError}</p>}
          </div>
        )}

        {modalState.type === "reschedule" && (
          <div className="mt-2 space-y-2 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Pilih Tanggal Baru:
              </label>
              <input
                type="date"
                value={newTanggal}
                onChange={(e) => setNewTanggal(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Pilih Jam Baru:
              </label>
              <select
                value={newJam}
                onChange={(e) => setNewJam(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
              >
                {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00"].map((t) => (
                  <option key={t} value={t}>
                    {t} WITA
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}
