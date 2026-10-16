"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Users,
  Shield,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Power,
  AlertCircle
} from "lucide-react";

export default function RincianPenggunaAdminPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const { users, currentUser, updateUserRole, toggleUserActive } = useStore();

  const user = users.find((u) => u.id === userId);

  const [selectedRole, setSelectedRole] = useState(user?.role || "pasien");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Pengguna tidak ditemukan</h2>
          <p className="text-xs sm:text-sm text-[#5A6B78] mb-5">
            Dokumen pengguna dengan ID "{userId}" tidak ditemukan di koleksi users.
          </p>
          <Link
            href="/admin/pengguna"
            className="px-4 py-2 bg-[#0E7490] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#0c627a] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Kelola Pengguna
          </Link>
        </div>
      </div>
    );
  }

  // Validasi Bab 4.13: "Bu Ratna tidak bisa menonaktifkan atau menurunkan peran akunnya sendiri."
  const isSelf = user.id === "user-ratna" || user.id === currentUser?.id;

  const handleSaveRole = () => {
    setError("");
    if (isSelf && selectedRole !== "super_admin") {
      setError("Anda tidak dapat menurunkan peran akun Super Admin milik Anda sendiri (Bab 4.13).");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRoleChange = () => {
    updateUserRole(user.id, selectedRole);
    setIsConfirmModalOpen(false);
    setFeedback(`Peran ${user.nama} berhasil diubah menjadi "${selectedRole}".`);
  };

  const handleConfirmToggleActive = () => {
    if (isSelf && user.aktif !== false) {
      setError("Anda tidak dapat menonaktifkan akun Anda sendiri (Bab 4.13).");
      setIsToggleModalOpen(false);
      return;
    }
    toggleUserActive(user.id);
    setIsToggleModalOpen(false);
    setFeedback(
      `Akun ${user.nama} berhasil ${user.aktif !== false ? "dinonaktifkan" : "diaktifkan kembali"}.`
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/admin/pengguna"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Kelola Pengguna
      </Link>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Header Rincian */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
                Kelola Pengguna (Bab 4.13)
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-[#5A6B78] font-mono">#{user.id}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
              {user.nama}
            </h1>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              user.aktif !== false
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {user.aktif !== false ? "Akun Aktif" : "Akun Dinonaktifkan"}
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Info Identitas Pengguna */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Alamat Email
              </span>
              <div className="mt-1 font-medium text-gray-900 text-sm flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {user.email}
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider block">
                Nomor HP (WhatsApp)
              </span>
              <div className="mt-1 font-medium text-gray-900 text-sm tabular-nums flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {user.noHp || "Belum diisi"}
              </div>
            </div>
          </div>

          {/* Form Ubah Peran (Bab 4.13) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Ubah Peran Hak Akses (Role) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: "pasien", label: "Pasien", desc: "Buat janji & riwayat" },
                { val: "resepsionis", label: "Resepsionis", desc: "Kelola janji klinik" },
                { val: "dokter", label: "Dokter", desc: "Praktik & pemeriksaan" },
                { val: "super_admin", label: "Super Admin", desc: "Akses penuh sistem" }
              ].map((r) => {
                const isSelected = selectedRole === r.val;
                return (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setSelectedRole(r.val)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-cyan-50/80 border-[#0E7490] ring-2 ring-[#0E7490]/30 shadow-xs"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-bold text-xs text-gray-900 block">{r.label}</span>
                    <span className="text-[10px] text-[#5A6B78] mt-0.5 block">{r.desc}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#5A6B78] mt-2">
              Saat pengguna masuk lagi, sistem otomatis mengarahkannya sesuai peran barunya.
            </p>
          </div>

          {/* Aksi Simpan & Nonaktifkan Akun */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={isSelf && user.aktif !== false}
              onClick={() => setIsToggleModalOpen(true)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isSelf && user.aktif !== false
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : user.aktif !== false
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {user.aktif !== false ? "Nonaktifkan Akun" : "Aktifkan Akun"}
            </button>

            <button
              type="button"
              onClick={handleSaveRole}
              className="px-5 py-2.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
            >
              Simpan Peran
            </button>
          </div>

          {isSelf && (
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Perhatian: Sesuai PRD Bab 4.13, akun Super Admin milik Anda sendiri tidak dapat dinonaktifkan atau diturunkan perannya demi menjaga ketersediaan hak akses sistem.
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal Ubah Peran */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Konfirmasi Perubahan Peran"
        message={`Ubah peran ${user.nama} dari "${user.role}" menjadi "${selectedRole}"?`}
        confirmText="Ya, Simpan Peran"
        cancelText="Batal"
        confirmVariant="primary"
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      {/* Confirmation Modal Toggle Aktif */}
      <ConfirmationModal
        isOpen={isToggleModalOpen}
        title={user.aktif !== false ? "Nonaktifkan Akun Pengguna" : "Aktifkan Kembali Akun"}
        message={
          user.aktif !== false
            ? `Apakah Anda yakin ingin menonaktifkan akun ${user.nama}? Pengguna tidak akan dapat mengakses portal dan melihat pesan "Akun Anda dinonaktifkan. Hubungi klinik." saat mencoba masuk.`
            : `Aktifkan kembali akun ${user.nama}? Pengguna akan dapat masuk kembali ke portal sesuai perannya.`
        }
        confirmText={user.aktif !== false ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        cancelText="Batal"
        confirmVariant={user.aktif !== false ? "danger" : "success"}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setIsToggleModalOpen(false)}
      />
    </div>
  );
}
