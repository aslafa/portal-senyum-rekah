"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import DataStateWrapper from "@/components/DataStateWrapper";
import { Users, Search, ChevronRight, ShieldCheck, Mail, Phone } from "lucide-react";

export default function KelolaPenggunaPage() {
  const router = useRouter();
  const { users, isLoaded } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");

  const filteredUsers = users
    .filter((u) => (roleFilter === "semua" ? true : u.role === roleFilter))
    .filter((u) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.nama.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.noHp && u.noHp.includes(q))
      );
    });

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "dokter":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "resepsionis":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pasien":
      default:
        return "bg-cyan-100 text-[#0E7490] border-cyan-200";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0E7490] uppercase tracking-wider">
            Admin → Kelola Pengguna (Bab 4.13)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Daftar Pengguna Sistem
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Ubah peran pengguna (Pasien, Resepsionis, Dokter, Super Admin) atau nonaktifkan akun.
          </p>
        </div>
      </div>

      {/* Saringan & Pencarian */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau no HP..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          {["semua", "pasien", "resepsionis", "dokter", "super_admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? "bg-[#0E7490] text-white font-semibold shadow-xs"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Pengguna (Bab 4.13: Nama, Email, Peran, Status) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <DataStateWrapper
          isLoading={!isLoaded}
          isEmpty={filteredUsers.length === 0}
          emptyTitle="Pengguna Tidak Ditemukan"
          emptyDescription={`Tidak ditemukan pengguna dengan kriteria pencarian saat ini.`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-[#5A6B78] uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Nama Lengkap</th>
                  <th className="py-3.5 px-4">Alamat Email</th>
                  <th className="py-3.5 px-4">Nomor HP</th>
                  <th className="py-3.5 px-4">Peran (Role)</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/admin/pengguna/${u.id}`)}
                    className="hover:bg-cyan-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900">{u.nama}</div>
                      <div className="text-[10px] text-[#5A6B78] font-mono">UID: {u.id}</div>
                    </td>

                    <td className="py-4 px-4 font-medium text-gray-700">
                      {u.email}
                    </td>

                    <td className="py-4 px-4 text-gray-600 tabular-nums">
                      {u.noHp || "-"}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          u.aktif !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {u.aktif !== false ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="text-[#0E7490] font-semibold hover:underline inline-flex items-center gap-1">
                        Ubah <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>
      </div>
    </div>
  );
}
