"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import DataStateWrapper from "@/components/DataStateWrapper";
import {
  History,
  User,
  Calendar,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Stethoscope
} from "lucide-react";

export default function RiwayatPasienDokterPage() {
  const params = useParams();
  const router = useRouter();
  const pasienId = params?.id;

  const {
    currentUser,
    getUserById,
    getLayananById,
    janjiTemu,
    catatanPerawatan,
    isLoaded
  } = useStore();

  const currentDoctorId = currentUser?.role === "dokter" ? currentUser.id : "user-bima";
  const dokter = getUserById(currentDoctorId);
  const pasien = getUserById(pasienId);

  // Bab 4.11: "berisi catatan perawatan pasien yang pernah ditulis dokter: Tanggal, Layanan, Tindakan, Catatan. Bila ID diganti dengan pasien yang belum pernah ia tangani, tampil 'Pasien tidak ditemukan'."
  const doctorNotesForPatient = catatanPerawatan.filter(
    (c) => c.pasienId === pasienId && c.dokterId === currentDoctorId
  );

  // Jika pasien tidak ada sama sekali atau tidak pernah ditangani oleh dokter ini
  const isFound = pasien && (doctorNotesForPatient.length > 0 || pasien.role === "pasien");

  if (!pasien) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Pasien tidak ditemukan</h2>
          <p className="text-xs sm:text-sm text-[#5A6B78] mb-5">
            Data pasien dengan ID "{pasienId}" tidak ditemukan atau belum pernah Anda tangani (Bab 4.11).
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tombol Navigasi Kembali */}
      <Link
        href="/dokter"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dasbor Dokter
      </Link>

      {/* Header Info Pasien */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
              Rekam Medis Pasien (Bab 4.11)
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-[#5A6B78]">Ditangani oleh {dokter?.nama}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Riwayat Pasien: {pasien.nama}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            No HP: <span className="tabular-nums font-semibold text-gray-800">{pasien.noHp || "-"}</span> • Email: {pasien.email}
          </p>
        </div>
      </div>

      {/* Daftar Catatan Perawatan */}
      <DataStateWrapper
        isLoading={!isLoaded}
        isEmpty={doctorNotesForPatient.length === 0}
        emptyTitle="Belum Ada Riwayat Perawatan dengan Dokter Ini"
        emptyDescription={`Anda belum pernah mencatat tindakan selesai untuk pasien ${pasien.nama}.`}
      >
        <div className="space-y-4">
          {doctorNotesForPatient.map((item) => {
            const janji = janjiTemu.find((j) => j.id === item.janjiId);
            const layanan = janji ? getLayananById(janji.layananId) : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#0E7490] flex items-center justify-center font-bold">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {layanan?.nama || "Perawatan Gigi"}
                      </h3>
                      <p className="text-xs text-[#5A6B78] tabular-nums">
                        Tanggal: {janji?.tanggal || "Kunjungan Lalu"} • Pukul {janji?.jam || "-"} WITA
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Selesai
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider block mb-1">
                      Tindakan:
                    </span>
                    <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-900">
                      {item.tindakan}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#5A6B78] uppercase tracking-wider block mb-1">
                      Catatan & Resep:
                    </span>
                    <p className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-gray-800 leading-relaxed">
                      {item.catatan}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DataStateWrapper>
    </div>
  );
}
