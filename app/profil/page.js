"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilPage() {
  const { currentUser, updateUserProfile } = useStore();

  const [nama, setNama] = useState(currentUser?.nama || "");
  const [noHp, setNoHp] = useState(currentUser?.noHp || "");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setNama(currentUser.nama || "");
      setNoHp(currentUser.noHp || "");
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    // Validasi No HP jika diisi (Bab 4.1: hanya angka dan diawali 08)
    if (noHp) {
      const phoneRegex = /^08[0-9]{8,12}$/;
      if (!phoneRegex.test(noHp)) {
        setError("Nomor HP harus berupa angka dan diawali '08' (10-14 digit).");
        return;
      }
    }

    setSaving(true);
    setTimeout(() => {
      updateUserProfile(currentUser.id, { nama, noHp });
      setSaving(false);
      setFeedback("Profil berhasil diperbarui.");
    }, 400);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin (Pemilik Klinik)";
      case "dokter":
        return "Dokter Gigi";
      case "resepsionis":
        return "Resepsionis";
      case "pasien":
      default:
        return "Pasien";
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Akun & Keamanan (Bab 4.5)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Profil Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Kelola nama lengkap dan nomor kontak Anda. Email dan peran hanya dapat diubah oleh Super Admin.
          </p>
        </div>

        {feedback && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama (Bisa diubah) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Nomor HP (Bisa diubah) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nomor HP (WhatsApp)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent tabular-nums"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-1">
              Hanya angka dan diawali '08'
            </p>
          </div>

          {/* Email (Tidak bisa diubah - Bab 4.5) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>Alamat Email</span>
              <span className="text-[10px] text-gray-400 font-normal">Terkunci</span>
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={currentUser?.email || ""}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Peran (Tidak bisa diubah - Bab 4.5) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>Peran Akun</span>
              <span className="text-[10px] text-gray-400 font-normal">Terkunci</span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={getRoleLabel(currentUser?.role)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
              />
              <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-1">
              Peran hanya dapat diubah oleh Super Admin melalui menu Kelola Pengguna.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
