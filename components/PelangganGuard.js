"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ShieldAlert, ArrowLeft, Loader2, AlertTriangle, RotateCw, LogOut } from "lucide-react";

/**
 * Route guard untuk semua halaman pelanggan (pasien) beserta seluruh subhalamannya:
 * - Hanya role "pasien", "pelanggan", dan "super_admin" yang boleh mengakses.
 * - Jika Firebase Authentication belum selesai diperiksa, tampilkan Memuat...
 * - Jika pengguna belum login, arahkan ke /masuk.
 * - Jika pengguna sudah login, baca role dari dokumen users/{uid} di Firestore.
 * - Selama profil dan role sedang dibaca, tampilkan Memuat... dan jangan mengambil keputusan akses.
 * - Jika dokumen profil tidak ditemukan, gagal dibaca, atau role tidak valid, jangan memberikan akses. Tampilkan pesan dan sediakan cara mencoba lagi.
 * - Jika role tidak diizinkan, tampilkan Akses Ditolak.
 * - Jika role diizinkan, tampilkan halaman yang diminta.
 */
export default function PelangganGuard({ children }) {
  const router = useRouter();

  // Status: "loading" | "authenticated" | "unauthorized" | "redirecting" | "error"
  const [status, setStatus] = useState("loading");
  const [userRole, setUserRole] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      // 1. Jika belum login -> arahkan ke /masuk
      if (!firebaseUser) {
        setStatus("redirecting");
        router.replace("/masuk");
        return;
      }

      // 2. Jika sudah login -> baca role dari Firestore users/{uid}
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (!isMounted) return;

        // Dokumen profil tidak ditemukan
        if (!docSnap.exists()) {
          setStatus("error");
          setErrorMessage(
            `Dokumen profil pengguna (users/${firebaseUser.uid}) tidak ditemukan di Firestore. Silakan hubungi administrator atau masuk kembali.`
          );
          return;
        }

        const data = docSnap.data() || {};
        const role = data.role;

        // Role tidak valid
        if (!role || typeof role !== "string" || !role.trim()) {
          setStatus("error");
          setErrorMessage(
            "Peran (role) pengguna tidak terdefinisi atau tidak valid pada dokumen profil Firestore."
          );
          return;
        }

        setUserRole(role);

        // Peran yang diizinkan: pasien (atau alias pelanggan) atau super_admin
        if (role === "pasien" || role === "pelanggan" || role === "super_admin") {
          setStatus("authenticated");
        } else {
          setStatus("unauthorized");
        }
      } catch (error) {
        console.error("Gagal membaca profil role pasien dari Firestore:", error);
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(
          "Gagal membaca data profil dan peran dari Firestore: " +
            (error?.message || "Terjadi gangguan koneksi jaringan.")
        );
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [reloadKey, router]);

  const handleRetry = () => {
    setStatus("loading");
    setErrorMessage("");
    setReloadKey((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/masuk");
    } catch (e) {
      console.error("Gagal keluar:", e);
      router.replace("/masuk");
    }
  };

  // 1. Layar Memuat... (Auth belum selesai diperiksa atau profil sedang dibaca)
  if (status === "loading" || status === "redirecting") {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-cyan-50 text-[#0E7490] rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#0E7490]" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          Memuat...
        </h2>
        <p className="text-xs text-[#5A6B78] mt-1.5 max-w-sm">
          {status === "redirecting"
            ? "Mengarahkan ke halaman masuk..."
            : "Memeriksa status autentikasi dan membaca peran dari Firestore..."}
        </p>
      </div>
    );
  }

  // 2. Layar Gagal / Dokumen Tidak Ditemukan / Role Tidak Valid (Dengan tombol Coba Lagi)
  if (status === "error") {
    return (
      <div className="min-h-[460px] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Kendala Pembacaan Profil
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 mb-2">
            Akses Belum Dapat Diberikan
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] leading-relaxed mb-6">
            {errorMessage || "Dokumen profil tidak ditemukan atau gagal dibaca dari Firestore."}
          </p>
          <div className="space-y-2.5">
            <button
              onClick={handleRetry}
              className="w-full py-2.5 px-4 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Coba Lagi
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Keluar & Masuk dengan Akun Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Layar Akses Ditolak (Role tidak diizinkan)
  if (status === "unauthorized") {
    return (
      <div className="min-h-[460px] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
            Akses Ditolak
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 mb-2">
            Halaman Khusus Pasien (Pelanggan)
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] leading-relaxed mb-6">
            Halaman ini hanya boleh diakses oleh pengguna dengan peran{" "}
            <span className="font-semibold text-gray-900">Pasien</span> atau{" "}
            <span className="font-semibold text-gray-900">Super Admin</span>. Peran akun Anda saat ini di Firestore:{" "}
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-semibold capitalize text-xs">
              {userRole || "Staf"}
            </span>.
          </p>
          <div className="space-y-2.5">
            <Link
              href={
                userRole === "resepsionis" || userRole === "staf_depan"
                  ? "/resepsionis"
                  : userRole === "dokter" || userRole === "tenaga_ahli"
                  ? "/dokter"
                  : userRole === "super_admin"
                  ? "/admin"
                  : "/beranda"
              }
              className="w-full py-2.5 px-4 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Halaman Saya
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Keluar & Masuk dengan Akun Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Role diizinkan -> Render halaman yang diminta
  return children;
}
