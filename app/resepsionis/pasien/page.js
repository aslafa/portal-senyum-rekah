"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import DataStateWrapper from "@/components/DataStateWrapper";
import { Contact, Search, Phone, Mail, ShieldAlert, User } from "lucide-react";

export default function DataPasienResepsionisPage() {
  const { getPasienList, isLoaded } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const pasienList = getPasienList();

  const filteredPasien = pasienList.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nama.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.noHp && p.noHp.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Resepsionis → Data Pasien (Bab 4.8)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Buku Kontak Pasien
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Data kontak pasien untuk konfirmasi kedatangan dan koordinasi janji temu.
          </p>
        </div>
      </div>

      {/* Kotak Pencarian */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pasien atau nomor HP (contoh: Andi)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Tabel Data Pasien */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={filteredPasien.length === 0}
          emptyTitle="Pasien Tidak Ditemukan"
          emptyDescription={`Tidak ditemukan data pasien dengan kata kunci "${searchQuery}".`}
          emptyAction={
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Pencarian
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Nama Pasien</th>
                  <th className="py-3.5 px-4">Nomor HP (WhatsApp)</th>
                  <th className="py-3.5 px-4">Alamat Email</th>
                  <th className="py-3.5 px-4 text-right">Status Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPasien.map((pasien) => (
                  <tr key={pasien.id} className="hover:bg-cyan-50/30 transition-colors">
                    <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0E7490] flex items-center justify-center text-xs font-bold shrink-0">
                        {pasien.nama.charAt(0)}
                      </div>
                      <div>
                        <div>{pasien.nama}</div>
                        <div className="text-[10px] text-[#5A6B78] font-mono">
                          ID: {pasien.id}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-gray-800 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{pasien.noHp || "-"}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#5A6B78]" />
                        <span>{pasien.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          pasien.aktif !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {pasien.aktif !== false ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>

        {/* Pemberitahuan Privasi Bab 4.8 */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-[#5A6B78] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Batasan v1 (Bab 4.8):</strong> Resepsionis hanya melihat kontak pasien dan tidak dapat mengakses catatan atau riwayat medis perawatan.
          </span>
        </div>
      </div>
    </div>
  );
}
