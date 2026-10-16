"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import DataStateWrapper from "@/components/DataStateWrapper";
import { History, Calendar, User, FileText, PlusCircle, CheckCircle2 } from "lucide-react";

export default function RiwayatPerawatanPage() {
  const { currentUser, janjiTemu, catatanPerawatan, getUserById, getLayananById, isLoaded } =
    useStore();

  // Janji berstatus Selesai milik pasien saat ini
  const completedJanji = janjiTemu
    .filter((j) => j.pasienId === currentUser?.id && j.status === "selesai")
    .sort((a, b) => new Date(`${b.tanggal}T${b.jam}`) - new Date(`${a.tanggal}T${a.jam}`));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
          Riwayat Medis Pasien (Bab 4.4)
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
          Riwayat Perawatan Gigi
        </h1>
        <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
          Catatan tindakan medis, diagnosis, dan anjuran dokter dari kunjungan yang telah selesai.
        </p>
      </div>

      {/* List Riwayat */}
      <DataStateWrapper
        isLoading={!isLoaded}
        isEmpty={completedJanji.length === 0}
        emptyTitle="Belum Ada Riwayat Perawatan"
        emptyDescription="Catatan perawatan akan otomatis muncul di sini setelah dokter menyelesaikan pemeriksaan dan memberikan tindakan medis."
        emptyAction={
          <Link
            href="/janji/baru"
            className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c627a] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Buat Janji Temu
          </Link>
        }
      >
        <div className="space-y-4">
          {completedJanji.map((item) => {
            const dokter = getUserById(item.dokterId);
            const layanan = getLayananById(item.layananId);
            const catatan = catatanPerawatan.find((c) => c.janjiId === item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15A66A] flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {layanan?.nama || "Perawatan Gigi"}
                      </h3>
                      <p className="text-xs text-[#5A6B78] tabular-nums">
                        {item.tanggal} • Pukul {item.jam} WITA
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5A6B78] hidden sm:inline">
                      Dokter: <strong>{dokter?.nama}</strong>
                    </span>
                    <StatusBadge status="selesai" />
                  </div>
                </div>

                {/* Tindakan & Catatan Dokter */}
                <div className="mt-4 space-y-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider block mb-1">
                      Tindakan Medis Dilakukan:
                    </span>
                    <p className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-gray-900 font-medium">
                      {catatan?.tindakan || "Pemeriksaan dan tindakan klinis standar."}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#5A6B78] uppercase tracking-wider block mb-1">
                      Catatan & Instruksi Dokter:
                    </span>
                    <p className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-gray-800 leading-relaxed">
                      {catatan?.catatan || "Tidak ada instruksi khusus."}
                    </p>
                  </div>

                  {item.keluhan && (
                    <div className="text-xs text-[#5A6B78] pt-1">
                      <span>Keluhan Awal: </span>
                      <span className="italic">&ldquo;{item.keluhan}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DataStateWrapper>
    </div>
  );
}
