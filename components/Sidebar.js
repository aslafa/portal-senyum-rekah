"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  Home,
  Calendar,
  CalendarPlus,
  Clock,
  History,
  User,
  Users,
  LayoutDashboard,
  ClipboardList,
  Contact,
  Stethoscope,
  Shield,
  Layers,
  CalendarDays,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  Compass
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { currentUser } = useStore();
  const [janjiSayaOpen, setJanjiSayaOpen] = useState(true);
  const [showAllModules, setShowAllModules] = useState(false);

  const role = currentUser?.role || "pasien";

  // Active check helper
  const isActive = (href) => {
    if (href === "/janji" && pathname === "/janji/baru") return false;
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  };

  const navLinkClass = (active) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-[#0E7490] text-white shadow-xs"
        : "text-[#1F2937] hover:bg-gray-100 hover:text-[#0E7490]"
    }`;

  const subNavLinkClass = (active) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-4 ${
      active
        ? "bg-cyan-100/70 text-[#0E7490] font-semibold"
        : "text-[#5A6B78] hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0E7490]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A6B78]">
              {showAllModules ? "Semua Halaman" : `Menu ${role.toUpperCase()}`}
            </span>
          </div>

          <button
            onClick={() => setShowAllModules(!showAllModules)}
            title="Tampilkan semua modul menu"
            className="text-[11px] px-2 py-0.5 rounded border border-gray-200 text-[#5A6B78] hover:text-[#0E7490] hover:border-[#0E7490] flex items-center gap-1 transition-colors"
          >
            <Compass className="w-3 h-3" />
            {showAllModules ? "Peran Aktif" : "Buka Semua"}
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* 1. Modul Pasien (Ditampilkan jika role pasien, super_admin, atau saat showAllModules aktif) */}
          {(role === "pasien" || role === "super_admin" || showAllModules) && (
            <div>
              <p className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#5A6B78] uppercase">
                Menu Pasien
              </p>
              <div className="space-y-1">
                <Link
                  href="/beranda"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/beranda")}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>Beranda</span>
                </Link>

                {/* Collapsible Janji Saya */}
                <div>
                  <button
                    onClick={() => setJanjiSayaOpen(!janjiSayaOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#1F2937] hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 shrink-0 text-[#0E7490]" />
                      <span>Janji Saya</span>
                    </div>
                    {janjiSayaOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {janjiSayaOpen && (
                    <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-100 ml-3">
                      <Link
                        href="/janji"
                        onClick={onClose}
                        className={subNavLinkClass(pathname === "/janji")}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Daftar Janji</span>
                      </Link>
                      <Link
                        href="/janji/baru"
                        onClick={onClose}
                        className={subNavLinkClass(pathname === "/janji/baru")}
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[#0E7490]" />
                        <span className="text-[#0E7490] font-medium">Buat Janji</span>
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/riwayat"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/riwayat")}
                >
                  <History className="w-4 h-4 shrink-0" />
                  <span>Riwayat Perawatan</span>
                </Link>
              </div>
            </div>
          )}

          {/* 2. Modul Resepsionis */}
          {(role === "resepsionis" || role === "super_admin" || showAllModules) && (
            <div>
              <p className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#5A6B78] uppercase">
                Menu Resepsionis
              </p>
              <div className="space-y-1">
                <Link
                  href="/resepsionis"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/resepsionis")}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dasbor Resepsionis</span>
                </Link>
                <Link
                  href="/resepsionis/janji"
                  onClick={onClose}
                  className={navLinkClass(pathname.startsWith("/resepsionis/janji"))}
                >
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  <span>Kelola Janji</span>
                </Link>
                <Link
                  href="/resepsionis/pasien"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/resepsionis/pasien")}
                >
                  <Contact className="w-4 h-4 shrink-0" />
                  <span>Data Pasien</span>
                </Link>
              </div>
            </div>
          )}

          {/* 3. Modul Dokter */}
          {(role === "dokter" || role === "super_admin" || showAllModules) && (
            <div>
              <p className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#5A6B78] uppercase">
                Menu Dokter
              </p>
              <div className="space-y-1">
                <Link
                  href="/dokter"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/dokter")}
                >
                  <Stethoscope className="w-4 h-4 shrink-0" />
                  <span>Dasbor Dokter</span>
                </Link>
              </div>
            </div>
          )}

          {/* 4. Modul Super Admin */}
          {(role === "super_admin" || showAllModules) && (
            <div>
              <p className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-[#5A6B78] uppercase">
                Menu Super Admin
              </p>
              <div className="space-y-1">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/admin")}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Dasbor Admin</span>
                </Link>
                <Link
                  href="/admin/pengguna"
                  onClick={onClose}
                  className={navLinkClass(pathname.startsWith("/admin/pengguna"))}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Kelola Pengguna</span>
                </Link>
                <Link
                  href="/admin/layanan"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/admin/layanan")}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Layanan</span>
                </Link>
                <Link
                  href="/admin/jadwal-dokter"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/admin/jadwal-dokter")}
                >
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  <span>Jadwal Dokter</span>
                </Link>
                <Link
                  href="/admin/laporan"
                  onClick={onClose}
                  className={navLinkClass(pathname === "/admin/laporan")}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Laporan</span>
                </Link>
              </div>
            </div>
          )}

          {/* Profil (Ada di semua peran) */}
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/profil"
              onClick={onClose}
              className={navLinkClass(pathname === "/profil")}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profil Saya</span>
            </Link>
          </div>
        </div>

        {/* Bottom Clinic Info */}
        <div className="p-3 bg-gray-50/80 border-t border-gray-100 text-xs text-[#5A6B78]">
          <p className="font-semibold text-gray-800">Klinik Gigi Senyum Rekah</p>
          <p className="text-[11px] mt-0.5">Makassar • Buka Sen-Sab</p>
        </div>
      </aside>
    </>
  );
}
