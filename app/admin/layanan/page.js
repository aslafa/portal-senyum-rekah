"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import DataStateWrapper from "@/components/DataStateWrapper";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Layers,
  PlusCircle,
  Clock,
  Tag,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Power
} from "lucide-react";

export default function KelolaLayananPage() {
  const { layanan, addLayanan, toggleLayananActive, isLoaded } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [durasiMenit, setDurasiMenit] = useState("30");
  const [harga, setHarga] = useState("");
  const [aktif, setAktif] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama layanan wajib diisi.");
      return;
    }

    const durationNum = Number(durasiMenit);
    // Validasi Bab 4.14: "durasi kelipatan 30 menit"
    if (!durationNum || durationNum % 30 !== 0 || durationNum <= 0) {
      setError("Durasi wajib berupa angka positif dan kelipatan 30 menit (30, 60, 90, dst).");
      return;
    }

    const priceNum = Number(harga);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Harga layanan harus berupa angka valid dalam Rupiah.");
      return;
    }

    addLayanan({
      nama: nama.trim(),
      durasiMenit: durationNum,
      harga: priceNum,
      aktif
    });

    setNama("");
    setDurasiMenit("30");
    setHarga("");
    setAktif(true);
    setIsModalOpen(false);
    setFeedback(`Layanan "${nama}" berhasil ditambahkan dan langsung aktif.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Admin → Layanan Klinik (Bab 4.14)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Katalog Layanan & Tarif Perawatan
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Kelola daftar tindakan gigi, durasi konsultasi (kelipatan 30 menit), dan tarif resmi klinik.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Layanan
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabel Layanan */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={layanan.length === 0}
          emptyTitle="Belum Ada Layanan"
          emptyDescription="Tambahkan layanan pertama klinik Anda."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Nama Layanan</th>
                  <th className="py-3.5 px-4">Durasi Pengerjaan</th>
                  <th className="py-3.5 px-4">Harga / Tarif</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {layanan.map((lay) => (
                  <tr key={lay.id} className="hover:bg-cyan-50/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900 text-sm">{lay.nama}</div>
                      <div className="text-[10px] text-[#5A6B78] font-mono">ID: {lay.id}</div>
                    </td>

                    <td className="py-4 px-4 font-medium text-gray-700 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#0E7490]" />
                        <span>{lay.durasiMenit} Menit</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-900 tabular-nums text-sm">
                      Rp {lay.harga.toLocaleString("id-ID")}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          lay.aktif !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {lay.aktif !== false ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      {/* Bab 4.14: "Layanan yang pernah dipakai janji tidak dihapus, cukup dinonaktifkan." */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleLayananActive(lay.id);
                          setFeedback(
                            `Status layanan "${lay.nama}" diubah menjadi ${
                              lay.aktif !== false ? "Nonaktif" : "Aktif"
                            }.`
                          );
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
                          lay.aktif !== false
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {lay.aktif !== false ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-[#5A6B78]">
          💡 <strong>Aturan PRD (Bab 4.14):</strong> Durasi harus berupa kelipatan 30 menit. Layanan yang pernah digunakan tidak boleh dihapus agar riwayat kunjungan tetap utuh, melainkan dinonaktifkan agar tidak muncul di form Buat Janji.
        </div>
      </div>

      {/* Modal Tambah Layanan (Bab 4.14) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Tambah Layanan Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="m-5 mb-0 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nama Layanan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Cabut Gigi Bungsu"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Durasi Menit <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-[#5A6B78]">Kelipatan 30 menit</span>
                </label>
                <select
                  value={durasiMenit}
                  onChange={(e) => setDurasiMenit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
                >
                  <option value="30">30 Menit</option>
                  <option value="60">60 Menit (1 Jam)</option>
                  <option value="90">90 Menit (1.5 Jam)</option>
                  <option value="120">120 Menit (2 Jam)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Harga Layanan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: 250000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="aktifCheck"
                  checked={aktif}
                  onChange={(e) => setAktif(e.target.checked)}
                  className="w-4 h-4 text-[#0E7490] rounded border-gray-300 focus:ring-[#0E7490]"
                />
                <label htmlFor="aktifCheck" className="text-xs font-semibold text-gray-700">
                  Layanan Aktif (Bisa langsung dipesan pasien)
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
