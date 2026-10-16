"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  AlertCircle
} from "lucide-react";

export default function PemeriksaanDokterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const {
    janjiTemu,
    getUserById,
    getLayananById,
    catatanPerawatan,
    addCatatanPerawatan
  } = useStore();

  const [tindakan, setTindakan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const janji = janjiTemu.find((j) => j.id === id);

  if (!janji) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Janji tidak ditemukan</h2>
          <p className="text-xs sm:text-sm text-[#5A6B78] mb-5">
            Janji temu dengan ID "{id}" tidak ditemukan dalam basis data klinik.
          </p>
          <Link
            href="/dokter"
            className="px-4 py-2 bg-[#0E7490] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#0c627a] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dasbor Dokter
          </Link>
        </div>
      </div>
    );
  }

  const dokter = getUserById(janji.dokterId);
  const layanan = getLayananById(janji.layananId);
  const pasien = getUserById(janji.pasienId);

  // Cek apakah catatan sudah pernah diisi
  const existingCatatan = catatanPerawatan.find((c) => c.janjiId === janji.id);

  const handleSubmitPemeriksaan = (e) => {
    e.preventDefault();
    setError("");

    if (!tindakan.trim()) {
      setError("Tindakan medis wajib diisi (Bab 4.10).");
      return;
    }
    if (!catatan.trim()) {
      setError("Catatan dokter wajib diisi (Bab 4.10).");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmFinish = () => {
    addCatatanPerawatan(janji.id, tindakan.trim(), catatan.trim());
    setIsConfirmModalOpen(false);
    setSavedSuccess(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tombol Navigasi Kembali */}
      <Link
        href="/dokter"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dasbor Dokter
      </Link>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Pemeriksaan Selesai & Catatan Tersimpan!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Status janji kini <strong>Selesai</strong>. Pasien dapat langsung membaca hasilnya di menu Riwayat Perawatan.
              </p>
            </div>
          </div>
          <Link
            href="/dokter"
            className="px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded-lg text-xs hover:bg-emerald-800 transition-colors shrink-0"
          >
            Selesai & Ke Dasbor →
          </Link>
        </div>
      )}

      {/* Panel Rincian Pasien */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
                Pemeriksaan Dokter (Bab 4.10)
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-[#5A6B78] font-mono">#{janji.id}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
              Pemeriksaan Pasien: {pasien?.nama}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={janji.status} size="lg" />
            {/* Tautan ke Riwayat Pasien (Bab 4.11) */}
            <Link
              href={`/dokter/pasien/${janji.pasienId}`}
              className="px-3.5 py-2 bg-cyan-50 hover:bg-cyan-100 text-[#0E7490] font-semibold text-xs rounded-xl border border-cyan-200 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <History className="w-4 h-4" /> Lihat Riwayat Pasien
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Info Pasien & Layanan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Pasien
              </span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{pasien?.nama}</p>
              <p className="text-xs text-[#5A6B78] tabular-nums">{pasien?.noHp}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Layanan
              </span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{layanan?.nama}</p>
              <p className="text-xs text-[#5A6B78]">{layanan?.durasiMenit} menit</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Jadwal Janji
              </span>
              <p className="font-bold text-gray-900 text-sm mt-0.5 tabular-nums">{janji.tanggal}</p>
              <p className="text-xs text-[#5A6B78] tabular-nums">Pukul {janji.jam} WITA</p>
            </div>
          </div>

          {/* Keluhan Pasien */}
          <div>
            <span className="text-xs font-semibold text-[#5A6B78] block mb-1">
              Keluhan Awal Pasien:
            </span>
            <p className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs sm:text-sm text-gray-900">
              {janji.keluhan || "Tidak ada keluhan spesifik tertulis."}
            </p>
          </div>

          {/* Form Pemeriksaan atau Catatan yang Sudah Ada */}
          {existingCatatan ? (
            <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Catatan Perawatan Tersimpan
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-700 block">Tindakan Medis:</span>
                <p className="text-xs sm:text-sm text-gray-900 font-medium bg-white p-3 rounded-lg border border-emerald-100 mt-1">
                  {existingCatatan.tindakan}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-700 block">Catatan & Resep:</span>
                <p className="text-xs sm:text-sm text-gray-900 bg-white p-3 rounded-lg border border-emerald-100 mt-1">
                  {existingCatatan.catatan}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitPemeriksaan} className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#0E7490]" />
                  Isi Tindakan & Catatan Perawatan
                </h3>
                <span className="text-xs text-[#5A6B78]">* Wajib diisi</span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tindakan Klinis Dilakukan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={tindakan}
                  onChange={(e) => setTindakan(e.target.value)}
                  placeholder="Contoh: Tambal gigi dengan komposit resin shade A2 pada gigi 36..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan, Instruksi Pasien & Resep <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Hindari makanan keras 24 jam. Minum analgetik bila terasa ngilu..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal Bab 5.4 */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Konfirmasi Selesai Pemeriksaan"
        message={`Tandai pemeriksaan ${pasien?.nama} telah selesai? Catatan tindakan akan langsung tersimpan permanen dan dapat dibaca oleh pasien di riwayat perawatannya.`}
        confirmText="Ya, Selesaikan & Simpan"
        cancelText="Periksa Lagi"
        confirmVariant="success"
        onConfirm={handleConfirmFinish}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}
