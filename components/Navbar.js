"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Menu,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  LogIn,
  UserPlus
} from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Listener autentikasi Firebase nyata untuk identitas pengguna
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        setFirebaseUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (isMounted && docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else if (isMounted) {
            setUserProfile({
              nama: user.displayName || user.email?.split("@")[0] || "Pengguna",
              email: user.email,
              role: "pasien"
            });
          }
        } catch (e) {
          console.warn("Gagal memuat profil pengguna Firestore di Navbar:", e);
          if (isMounted) {
            setUserProfile({
              nama: user.displayName || user.email?.split("@")[0] || "Pengguna",
              email: user.email,
              role: "pasien"
            });
          }
        }
      } else {
        setFirebaseUser(null);
        setUserProfile(null);
      }

      if (isMounted) setLoadingAuth(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut(auth);
      router.replace("/masuk");
    } catch (e) {
      console.error("Gagal logout:", e);
      router.replace("/masuk");
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return { label: "Super Admin", color: "bg-purple-100 text-purple-700 border-purple-200" };
      case "dokter":
      case "tenaga_ahli":
        return { label: "Dokter Gigi", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case "resepsionis":
      case "staf_depan":
        return { label: "Resepsionis", color: "bg-blue-100 text-blue-700 border-blue-200" };
      case "pasien":
      case "pelanggan":
      default:
        return { label: "Pasien", color: "bg-cyan-100 text-[#0E7490] border-cyan-200" };
    }
  };

  const role = userProfile?.role || "pasien";
  const badge = getRoleBadge(role);
  const displayName = userProfile?.nama || firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "Akun Saya";

  const getMyDashboardLink = () => {
    if (role === "super_admin") return "/admin";
    if (role === "dokter" || role === "tenaga_ahli") return "/dokter";
    if (role === "resepsionis" || role === "staf_depan") return "/resepsionis";
    return "/beranda";
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E7490] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white text-[#0E7490] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              🦷
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight block leading-tight">
                Senyum Rekah
              </span>
              <span className="text-[11px] text-cyan-100 font-normal hidden sm:block">
                Portal Janji Temu & Perawatan
              </span>
            </div>
          </Link>
        </div>

        {/* User Identity & Auth Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {loadingAuth ? (
            <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
          ) : firebaseUser ? (
            /* User Terautentikasi Nyata */
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs sm:text-sm font-medium transition-colors"
                aria-expanded={isDropdownOpen}
              >
                <div className="w-6 h-6 rounded-full bg-cyan-200 text-[#0E7490] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {displayName.charAt(0)}
                </div>
                <div className="text-left max-w-[120px] sm:max-w-[160px] truncate">
                  <span className="font-semibold block truncate leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-cyan-200 block truncate">
                    {firebaseUser.email}
                  </span>
                </div>
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.color} bg-white hidden md:inline-block`}
                >
                  {badge.label}
                </span>
                <ChevronDown className="w-4 h-4 text-cyan-200 shrink-0" />
              </button>

              {/* Dropdown Menu Pengguna Nyata */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-gray-900 shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {firebaseUser.email}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.color}`}
                        >
                          Peran: {badge.label}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={getMyDashboardLink()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#0E7490]" />
                        <span>Halaman Saya ({badge.label})</span>
                      </Link>

                      <Link
                        href="/profil"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Profil Pengguna</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Keluar (Sign Out)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Pengguna Belum Login */
            <div className="flex items-center gap-2">
              <Link
                href="/masuk"
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === "/masuk"
                    ? "bg-white text-[#0E7490] font-semibold shadow-xs"
                    : "text-white bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/daftar"
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-colors hidden sm:flex items-center gap-1.5 ${
                  pathname === "/daftar"
                    ? "bg-white text-[#0E7490] font-semibold shadow-xs"
                    : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
