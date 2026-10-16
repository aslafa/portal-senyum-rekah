"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import DataStateWrapper from "@/components/DataStateWrapper";
import {
  CalendarDays,
  PlusCircle,
  Clock,
  User,
  Trash2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function KelolaJadwalDokterPage() {
  const {
    getDokterList,
    jadwalDokter,
    addJadwalDokter,
    deleteJadwalDokter,
    isLoaded
  } = useStore();

  const dokterList = getDokterList();
  const [selectedDokterId, setSelectedDokterId] = useState(
    dokterList[0]?.id || "user-bima"
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hari, setHari] = useState("senin");
  const [jamMulai, setJamMulai] = useState("09:00");
  const [jamSelesai, setJamSelesai] = useState("15:00");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const currentDokter = dokterList.find((d) => d.id === selectedDokterId);

  // Jadwal dokter terpilih
  const currentJadwal = jadwalDokter.filter(
    (j) => j.dokterId === selectedDokterId
  );

  const dayOrder = { senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6 };
  const sortedJadwal = [...currentJadwal].sort(
    (a, b) => (dayOrder[a.hari.toLowerCase()] || 99) - (dayOrder[b.hari.toLowerCase()] || 99)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validasi Bab 4.15: "hari hanya Senin sampai Sabtu"
    const validDays = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    if (!validDays.includes(hari.toLowerCase())) {
      setError("Hari praktik hanya dapat dipilih antara Senin sampai Sabtu.");
      return;
    }

    // Validasi Bab 4.15: "jam selesai setelah jam mulai"
    if (jamSelesai <= jamMulai) {
      setError("Jam selesai harus setelah jam mulai.");
      return;
    }

    // Validasi Bab 4.15: "satu dokter satu jadwal per hari"
    const exists = currentJadwal.some((j) => j.hari.toLowerCase() === hari.toLowerCase());
    if (exists) {
      setError(`Dokter ${currentDokter?.nama} sudah memiliki jadwal pada hari ${hari}. Harap hapus jadwal lama jika ingin mengganti.`);
      return;
    }

    addJadwalDokter({
      dokterId: selectedDokterId,
      hari,
      jamMulai,
      jamSelesai
    });

    setIsModalOpen(false);
    setFeedback(`Jadwal hari ${hari} untuk ${currentDokter?.nama} berhasil disimpan.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Admin → Jadwal Dokter (Bab 4.15)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Pengaturan Jadwal Praktik Dokter
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Atur hari praktik dan rentang jam kerja. Hari dan jam ini otomatis menjadi acuan ketersediaan slot janji temu pasien.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Hari Praktik
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tab Pilih Dokter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3">
        <span className="text-xs font-semibold text-[#5A6B78] uppercase tracking-wider">
          Pilih Dokter:
        </span>
        <div className="flex items-center gap-2">
          {dokterList.map((dok) => {
            const isSelected = selectedDokterId === dok.id;
            return (
              <button
                key={dok.id}
                onClick={() => {
                  setSelectedDokterId(dok.id);
                  setFeedback("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#0E7490] text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                {dok.nama}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabel Jadwal Dokter Terpilih */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Jadwal Praktik: {currentDokter?.nama}
          </h2>
          <span className="text-xs text-[#5A6B78]">
            {sortedJadwal.length} hari terdaftar
          </span>
        </div>

        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={sortedJadwal.length === 0}
          emptyTitle="Belum Ada Jadwal Praktik"
          emptyDescription={`Dokter ${currentDokter?.nama} belum memiliki jadwal praktik terdaftar.`}
          emptyAction={
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#0E7490] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#0c627a] inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Jadwal Sekarang
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Hari Praktik</th>
                  <th className="py-3.5 px-4">Jam Mulai</th>
                  <th className="py-3.5 px-4">Jam Selesai</th>
                  <th className="py-3.5 px-4">Rentang Waktu</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedJadwal.map((j) => (
                  <tr key={j.id} className="hover:bg-cyan-50/30 transition-colors">
                    <td className="py-4 px-5">
                      <span className="capitalize font-bold text-gray-900 text-sm">
                        {j.hari}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-800 tabular-nums">
                      {j.jamMulai} WITA
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-800 tabular-nums">
                      {j.jamSelesai} WITA
                    </td>

                    <td className="py-4 px-4 font-medium text-gray-600 tabular-nums">
                      {j.jamMulai} s/d {j.jamSelesai}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          deleteJadwalDokter(j.id);
                          setFeedback(`Jadwal hari ${j.hari} berhasil dihapus.`);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-[#5A6B78]">
          💡 <strong>Ketentuan PRD (Bab 4.15):</strong> Hari hanya Senin sampai Sabtu. Jam selesai harus setelah jam mulai. Satu dokter hanya memiliki satu jadwal per hari.
        </div>
      </div>

      {/* Modal Tambah Jadwal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Tambah Hari Praktik</h3>
                <p className="text-xs text-[#5A6B78] mt-0.5">Untuk {currentDokter?.nama}</p>
              </div>
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
                  Pilih Hari (Senin - Sabtu) <span className="text-red-500">*</span>
                </label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] capitalize"
                >
                  <option value="senin">Senin</option>
                  <option value="selasa">Selasa</option>
                  <option value="rabu">Rabu</option>
                  <option value="kamis">Kamis</option>
                  <option value="jumat">Jumat</option>
                  <option value="sabtu">Sabtu</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Jam Mulai <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
                  >
                    {["08:00", "09:00", "10:00", "11:00", "13:00"].map((t) => (
                      <option key={t} value={t}>
                        {t} WITA
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Jam Selesai <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490] tabular-nums"
                  >
                    {["12:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
                      <option key={t} value={t}>
                        {t} WITA
                      </option>
                    ))}
                  </select>
                </div>
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
