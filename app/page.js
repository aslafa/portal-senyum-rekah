"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  Calendar,
  CalendarPlus,
  History,
  LayoutDashboard,
  ClipboardList,
  Contact,
  Stethoscope,
  Shield,
  Users,
  Layers,
  CalendarDays,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Phone
} from "lucide-react";

export default function HomePage() {
  const { currentUser, switchUser, users } = useStore();

  const roleCards = [
    {
      role: "pasien",
      title: "Area Pasien (Andi / Maya)",
      description: "Membuat janji, memantau status slot jam, dan membaca riwayat perawatan.",
      userExampleId: "user-andi",
      links: [
        { label: "Beranda Pasien", href: "/beranda", icon: Calendar },
        { label: "Daftar Janji Temu", href: "/janji", icon: Clock },
        { label: "Buat Janji Baru", href: "/janji/baru", icon: CalendarPlus },
        { label: "Riwayat Perawatan", href: "/riwayat", icon: History }
      ],
      color: "border-cyan-200 bg-cyan-50/40 text-[#0E7490]"
    },
    {
      role: "resepsionis",
      title: "Area Resepsionis (Laras)",
      description: "Memeriksa janji hari ini, konfirmasi, jadwal ulang, batalkan, dan tandai hadir.",
      userExampleId: "user-laras",
      links: [
        { label: "Dasbor Resepsionis", href: "/resepsionis", icon: LayoutDashboard },
        { label: "Kelola Janji Temu", href: "/resepsionis/janji", icon: ClipboardList },
        { label: "Data Kontak Pasien", href: "/resepsionis/pasien", icon: Contact }
      ],
      color: "border-blue-200 bg-blue-50/40 text-blue-700"
    },
    {
      role: "dokter",
      title: "Area Dokter (drg. Bima / drg. Sinta)",
      description: "Melihat jadwal hari ini, mencatat tindakan & catatan pasien, dan riwayat pasien.",
      userExampleId: "user-bima",
      links: [
        { label: "Dasbor Dokter", href: "/dokter", icon: Stethoscope },
        { label: "Riwayat Pasien (Andi)", href: "/dokter/pasien/user-andi", icon: History }
      ],
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-700"
    },
    {
      role: "super_admin",
      title: "Area Super Admin (Bu Ratna)",
      description: "Pengelolaan pengguna & peran, tarif layanan, jadwal praktik dokter, dan laporan bulanan.",
      userExampleId: "user-ratna",
      links: [
        { label: "Dasbor Admin", href: "/admin", icon: Shield },
        { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
        { label: "Kelola Layanan", href: "/admin/layanan", icon: Layers },
        { label: "Jadwal Praktik Dokter", href: "/admin/jadwal-dokter", icon: CalendarDays },
        { label: "Laporan Kunjungan", href: "/admin/laporan", icon: BarChart3 }
      ],
      color: "border-purple-200 bg-purple-50/40 text-purple-700"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#0E7490] to-[#084b5e] rounded-2xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <span className="text-9xl">🦷</span>
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-cyan-100 border border-white/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            Makassar • Buka Senin – Sabtu
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Portal Janji Senyum Rekah
          </h1>
          <p className="mt-2 sm:mt-3 text-cyan-100 text-sm sm:text-base leading-relaxed">
            Aplikasi janji temu dan catatan perawatan modern untuk Klinik Gigi Senyum Rekah.
            Slot jam terjadwal otomatis tanpa bentrok, pencatatan perawatan aman, dan laporan tersusun rapi.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/beranda"
              className="px-5 py-2.5 rounded-xl bg-white text-[#0E7490] font-semibold text-sm hover:bg-cyan-50 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              Masuk ke Beranda Pasien <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/masuk"
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-sm transition-colors border border-white/20"
            >
              Halaman Masuk (Login)
            </Link>
            <Link
              href="/daftar"
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-sm transition-colors border border-white/20"
            >
              Halaman Daftar
            </Link>
          </div>
        </div>
      </div>

      {/* Role Directory Grid (All Bab 4 Pages) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Modul Layanan Klinik (PRD Bab 4)
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6B78]">
              Setiap rute halaman dilindungi oleh Route Guard sesuai peran akun pengguna yang tersimpan di Firestore:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roleCards.map((card) => {
            const isUserRole = currentUser?.role === card.role;
            return (
              <div
                key={card.role}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isUserRole ? "ring-2 ring-[#0E7490] border-transparent" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-base">{card.title}</h3>
                    {isUserRole && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-[#0E7490] border border-cyan-200">
                        Peran Akun Anda
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5A6B78] mb-4">{card.description}</p>

                  <div className="space-y-2">
                    {card.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/70 hover:bg-[#0E7490]/10 hover:border-[#0E7490]/30 transition-colors text-xs font-semibold text-gray-800 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-[#0E7490]" />
                            <span>{link.label}</span>
                          </div>
                          <span className="text-[#5A6B78] group-hover:text-[#0E7490] group-hover:translate-x-0.5 transition-all text-xs">
                            {link.href} →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#5A6B78]">
                  <span>Hak Akses:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {card.role === "pasien"
                      ? "Pasien & Super Admin"
                      : card.role === "resepsionis"
                      ? "Resepsionis & Super Admin"
                      : card.role === "dokter"
                      ? "Dokter & Super Admin"
                      : "Khusus Super Admin"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinic Information Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-[#5A6B78]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0E7490]" />
          <span>Jl. Pengayoman, Panakkukang, Makassar</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0E7490]" />
          <span>Senin – Sabtu (09:00 – 16:00 WITA)</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#0E7490]" />
          <span>0812-3456-7890 (Meja Resepsionis)</span>
        </div>
      </div>
    </div>
  );
}
