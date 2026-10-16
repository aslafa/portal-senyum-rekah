"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  getActiveLayananFromFirestore,
  getActiveDokterFromFirestore,
  getJadwalDokterFromFirestore,
  getSlotTerisiFromFirestore,
  calculateAvailableSlots,
  createJanjiTemuAtomic,
  getHariFromTanggal
} from "@/lib/firestore-service";
import {
  Calendar,
  Clock,
  User,
  Layers,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles
} from "lucide-react";

export default function BuatJanjiPage() {
  const router = useRouter();

  // 1. Autentikasi Pengguna Nyata (UID Pasien)
  const [currentUid, setCurrentUid] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // 2. Data Master dari Firestore
  const [layananList, setLayananList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [masterError, setMasterError] = useState("");

  // 3. Pilihan Formulir Pemesanan Janji
  const [selectedLayananId, setSelectedLayananId] = useState("");
  const [selectedDokterId, setSelectedDokterId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [selectedJam, setSelectedJam] = useState("");
  const [keluhan, setKeluhan] = useState("");

  // 4. Jadwal dan Slot
  const [dokterJadwalList, setDokterJadwalList] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 5. Status Transaksi
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // Tanggal minimal besok (PRD 4.3.1: "Validasi: tanggal paling cepat besok")
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    // Hitung tanggal besok (format YYYY-MM-DD)
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const tomorrowStr = now.toISOString().split("T")[0];
    setMinDate(tomorrowStr);
  }, []);

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

  // Muat data master Layanan dan Dokter aktif dari Firestore
  useEffect(() => {
    let isMounted = true;

    async function loadMasterData() {
      setLoadingMaster(true);
      setMasterError("");
      try {
        const [layananData, dokterData] = await Promise.all([
          getActiveLayananFromFirestore(),
          getActiveDokterFromFirestore()
        ]);

        if (!isMounted) return;
        setLayananList(layananData);
        setDokterList(dokterData);
      } catch (err) {
        console.error("Gagal memuat data master pemesanan janji:", err);
        if (isMounted) {
          setMasterError("Gagal memuat daftar layanan atau dokter dari Firestore. Silakan muat ulang.");
        }
      } finally {
        if (isMounted) setLoadingMaster(false);
      }
    }

    loadMasterData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Muat Jadwal Dokter ketika Dokter dipilih
  useEffect(() => {
    let isMounted = true;

    async function loadDokterJadwal() {
      if (!selectedDokterId) {
        setDokterJadwalList([]);
        return;
      }

      const dokterObj = dokterList.find((d) => d.id === selectedDokterId);
      try {
        const jadwal = await getJadwalDokterFromFirestore(selectedDokterId, dokterObj?.email || "");
        if (isMounted) setDokterJadwalList(jadwal);
      } catch (err) {
        console.error("Gagal memuat jadwal dokter:", err);
        if (isMounted) setDokterJadwalList([]);
      }
    }

    loadDokterJadwal();

    return () => {
      isMounted = false;
    };
  }, [selectedDokterId, dokterList]);

  // Muat Slot Terisi dari Firestore ketika Dokter dan Tanggal dipilih
  useEffect(() => {
    let isMounted = true;

    async function loadOccupiedSlots() {
      if (!selectedDokterId || !tanggal) {
        setOccupiedSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const slots = await getSlotTerisiFromFirestore(selectedDokterId, tanggal);
        if (isMounted) setOccupiedSlots(slots);
      } catch (err) {
        console.error("Gagal memuat slot terisi dari Firestore:", err);
        if (isMounted) setOccupiedSlots([]);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    loadOccupiedSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedDokterId, tanggal]);

  // Layanan terpilih
  const selectedLayanan = useMemo(() => {
    return layananList.find((l) => l.id === selectedLayananId) || null;
  }, [layananList, selectedLayananId]);

  // Hari-hari praktik dokter terpilih
  const activeDaysForDoctor = useMemo(() => {
    return dokterJadwalList.map((j) => (j.hari || "").toLowerCase());
  }, [dokterJadwalList]);

  // Cek apakah tanggal yang dipilih sesuai dengan hari praktik dokter
  const isSelectedDateValidForDoctor = useMemo(() => {
    if (!tanggal || !selectedDokterId || activeDaysForDoctor.length === 0) return false;
    const hari = getHariFromTanggal(tanggal);
    return activeDaysForDoctor.includes(hari.toLowerCase());
  }, [tanggal, selectedDokterId, activeDaysForDoctor]);

  // Jadwal dokter pada hari yang dipilih
  const jadwalHariIni = useMemo(() => {
    if (!isSelectedDateValidForDoctor || !tanggal) return null;
    const hari = getHariFromTanggal(tanggal);
    return dokterJadwalList.find((j) => (j.hari || "").toLowerCase() === hari.toLowerCase()) || null;
  }, [isSelectedDateValidForDoctor, tanggal, dokterJadwalList]);

  // Hitung ketersediaan slot jam kosong (PRD 4.3.1)
  const availableSlots = useMemo(() => {
    if (!jadwalHariIni || !selectedLayanan) return [];

    return calculateAvailableSlots({
      jadwal: jadwalHariIni,
      durasiMenit: selectedLayanan.durasiMenit,
      existingSlots: occupiedSlots
    });
  }, [jadwalHariIni, selectedLayanan, occupiedSlots]);

  // Handler Submit Pembuatan Janji
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUid) {
      setError("Sesi login Anda tidak terdeteksi. Silakan masuk terlebih dahulu.");
      return;
    }
    if (!selectedLayananId) {
      setError("Silakan pilih layanan gigi terlebih dahulu.");
      return;
    }
    if (!selectedDokterId) {
      setError("Silakan pilih dokter gigi.");
      return;
    }
    if (!tanggal) {
      setError("Silakan tentukan tanggal janji temu.");
      return;
    }
    if (minDate && tanggal < minDate) {
      setError("Sesuai PRD, tanggal janji temu paling cepat adalah besok (H+1).");
      return;
    }
    if (!isSelectedDateValidForDoctor) {
      setError(
        `Dokter tidak memiliki jadwal praktik pada hari tersebut. Hari praktik: ${activeDaysForDoctor.join(
          ", "
        )}.`
      );
      return;
    }
    if (!selectedJam) {
      setError("Silakan pilih slot jam yang tersedia.");
      return;
    }
    if (!keluhan.trim()) {
      setError("Keluhan wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      // Jalankan transaksi atomik Firestore
      const result = await createJanjiTemuAtomic({
        pasienId: currentUid,
        dokterId: selectedDokterId,
        layananId: selectedLayananId,
        tanggal,
        jam: selectedJam,
        keluhan,
        durasiMenit: selectedLayanan?.durasiMenit || 30
      });

      setSuccessInfo(result);

      // Sesuai PRD 4.3.1: Sistem menyimpan janji dan membawa pasien ke rincian janji
      setTimeout(() => {
        router.push(`/janji/${result.janjiId}`);
      }, 800);
    } catch (err) {
      console.error("Gagal membuat janji temu:", err);
      // Tangkap pesan khusus PRD: "Slot ini baru saja terisi. Pilih jam lain."
      const msg = err?.message || "Terjadi kesalahan saat menyimpan janji ke Firestore. Silakan coba lagi.";
      setError(msg);

      // Muat ulang slot terisi agar slot yang baru terisi tidak lagi tampil
      if (selectedDokterId && tanggal) {
        try {
          const freshSlots = await getSlotTerisiFromFirestore(selectedDokterId, tanggal);
          setOccupiedSlots(freshSlots);
          setSelectedJam("");
        } catch (e) {
          // ignore
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authChecking || loadingMaster) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-cyan-50 text-[#0E7490] rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#0E7490]" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          Memuat Data Layanan & Dokter...
        </h2>
        <p className="text-xs text-[#5A6B78] mt-1.5">
          Sedang membaca data master dari Firestore. Mohon tunggu sebentar...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tombol Kembali */}
      <Link
        href="/janji"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Janji Saya
      </Link>

      {/* Notifikasi Berhasil */}
      {successInfo && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Janji Temu Berhasil Dibuat!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Data tersimpan di Firestore dengan status <strong>Menunggu</strong>. Mengalihkan Anda ke halaman rincian...
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Janji Saya → Buat Janji (PRD Bab 4.3.1)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Form Pemesanan Janji Temu
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Pilih layanan, dokter, tanggal praktik, dan slot waktu yang tersedia langsung dari Firestore.
          </p>
        </div>

        {masterError && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{masterError}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Pilih Layanan* (Hanya layanan aktif PRD 4.3.1) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>
                1. Pilih Layanan Gigi <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] text-[#5A6B78] font-normal">
                {layananList.length} layanan aktif tersedia
              </span>
            </label>
            <select
              value={selectedLayananId}
              onChange={(e) => {
                setSelectedLayananId(e.target.value);
                setSelectedJam("");
              }}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
            >
              <option value="">-- Pilih Layanan --</option>
              {layananList.map((lay) => (
                <option key={lay.id} value={lay.id}>
                  {lay.nama} ({lay.durasiMenit} menit) - Rp {Number(lay.harga || 0).toLocaleString("id-ID")}
                </option>
              ))}
            </select>
            {selectedLayanan && (
              <p className="text-[11px] text-[#5A6B78] mt-1">
                Estimasi durasi: <strong>{selectedLayanan.durasiMenit} menit</strong> • Tarif: Rp {Number(selectedLayanan.harga || 0).toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {/* 2. Pilih Dokter* */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              2. Pilih Dokter Gigi <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDokterId}
              onChange={(e) => {
                setSelectedDokterId(e.target.value);
                setSelectedJam("");
              }}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
            >
              <option value="">-- Pilih Dokter Gigi --</option>
              {dokterList.map((dok) => (
                <option key={dok.id} value={dok.id}>
                  {dok.nama}
                </option>
              ))}
            </select>

            {selectedDokterId && (
              <div className="mt-2 p-2.5 bg-cyan-50/70 border border-cyan-100 rounded-lg text-xs text-[#0E7490]">
                <span className="font-semibold block">Hari Praktik Dokter:</span>
                <span className="capitalize">
                  {activeDaysForDoctor.length > 0
                    ? activeDaysForDoctor.join(", ")
                    : "Memuat jadwal..."}
                </span>
              </div>
            )}
          </div>

          {/* 3. Pilih Tanggal* (Minimal H+1 / Besok) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>
                3. Tanggal Janji Temu <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] text-[#5A6B78] font-normal">
                Paling cepat besok ({minDate})
              </span>
            </label>
            <input
              type="date"
              min={minDate}
              value={tanggal}
              onChange={(e) => {
                setTanggal(e.target.value);
                setSelectedJam("");
              }}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent tabular-nums"
            />

            {tanggal && selectedDokterId && !isSelectedDateValidForDoctor && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                ⚠️ Dokter tidak berpraktik pada hari{" "}
                <span className="capitalize font-semibold">{getHariFromTanggal(tanggal)}</span>. Silakan pilih hari{" "}
                <span className="capitalize font-semibold">{activeDaysForDoctor.join(", ")}</span>.
              </p>
            )}
          </div>

          {/* 4. Slot Jam Tersedia* (Dihitung dari Firestore slot_terisi) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>
                4. Slot Jam Tersedia <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] text-[#5A6B78] font-normal">
                Interval 30 menit bebas bentrok
              </span>
            </label>

            {!selectedDokterId || !tanggal || !selectedLayananId ? (
              <p className="text-xs text-[#5A6B78] italic p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Lengkapi pilihan layanan, dokter, dan tanggal di atas untuk melihat slot jam kosong.
              </p>
            ) : !isSelectedDateValidForDoctor ? (
              <p className="text-xs text-amber-700 italic p-3 bg-amber-50 rounded-xl border border-amber-200">
                Dokter tidak berpraktik pada tanggal ini. Pilih tanggal lain yang sesuai dengan hari praktik dokter.
              </p>
            ) : loadingSlots ? (
              <div className="p-4 flex items-center justify-center gap-2 text-xs text-[#0E7490]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa ketersediaan slot di Firestore...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Tidak ada slot jam kosong untuk dokter dan tanggal ini. Silakan pilih tanggal lain.
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedJam === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedJam(slot)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold tabular-nums border transition-all ${
                          isSelected
                            ? "bg-[#0E7490] text-white border-[#0E7490] shadow-xs scale-102"
                            : "bg-white text-gray-800 border-gray-200 hover:border-[#0E7490] hover:bg-cyan-50/50"
                        }`}
                      >
                        {slot} WITA
                      </button>
                    );
                  })}
                </div>
                {selectedJam && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ✓ Slot terpilih: <strong>{selectedJam} WITA</strong> (Durasi: {selectedLayanan?.durasiMenit} menit)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 5. Keluhan Gigi* */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>
                5. Keluhan Gigi <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] text-[#5A6B78] font-normal">Wajib diisi</span>
            </label>
            <textarea
              required
              rows={3}
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              placeholder="Contoh: Gigi geraham kiri ngilu saat minum dingin dan terasa berdenyut di malam hari..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
            />
          </div>

          {/* Tombol Kirim Pemesanan */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting || !selectedJam || !selectedLayananId || !selectedDokterId || !tanggal || !keluhan.trim()}
              className="w-full py-3 px-4 bg-[#0E7490] hover:bg-[#0c627a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memvalidasi & Menyimpan Janji Temu...</span>
                </>
              ) : (
                <span>Kirim & Buat Janji Temu</span>
              )}
            </button>
            <p className="text-[11px] text-[#5A6B78] text-center mt-2">
              Status janji otomatis tersimpan sebagai <strong>Menunggu</strong> untuk dikonfirmasi oleh resepsionis klinik.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
