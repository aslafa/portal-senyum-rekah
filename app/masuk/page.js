"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth";
import { LogIn, AlertCircle, ArrowRight, ShieldCheck, Check } from "lucide-react";

export default function MasukPage() {
  const router = useRouter();
  const { users, switchUser } = useStore();

  const [email, setEmail] = useState("andi@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role) => {
    switch (role) {
      case "super_admin":
        router.push("/admin");
        break;
      case "dokter":
      case "tenaga_ahli":
        router.push("/dokter");
        break;
      case "resepsionis":
      case "staf_depan":
        router.push("/resepsionis");
        break;
      case "pasien":
      case "pelanggan":
      default:
        router.push("/beranda");
        break;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Login menggunakan Firebase Authentication nyata
      const { user, profile } = await loginWithEmail(email, password);
      
      // Bab 4.1: Akun nonaktif melihat pesan “Akun Anda dinonaktifkan. Hubungi klinik.”
      if (profile && profile.aktif === false) {
        setError("Akun Anda dinonaktifkan. Hubungi klinik.");
        setLoading(false);
        return;
      }

      redirectByRole(profile?.role || "pasien");
    } catch (err) {
      console.warn("Firebase Auth error:", err?.code || err?.message);

      if (
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/invalid-credential"
      ) {
        setError("Email atau kata sandi tidak cocok.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else {
        setError("Gagal masuk: " + (err?.message || "Terjadi kesalahan autentikasi."));
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { user, profile } = await loginWithGoogle();
      if (profile && profile.aktif === false) {
        setError("Akun Anda dinonaktifkan. Hubungi klinik.");
        setLoading(false);
        return;
      }
      redirectByRole(profile?.role || "pasien");
    } catch (err) {
      console.error("Google login error:", err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Gagal masuk dengan Google: " + (err?.message || "Terjadi kesalahan"));
      }
      setLoading(false);
    }
  };

  const handleFillCredentials = (targetUser) => {
    setError("");
    setEmail(targetUser.email);
    setPassword("password123");
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-cyan-50 text-[#0E7490] rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            🦷
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Masuk ke Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Portal Janji Temu & Catatan Perawatan Senyum Rekah
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Kata Sandi
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#0E7490] hover:bg-[#0c627a] text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#5A6B78]">atau</span>
          </div>
        </div>

        {/* Tombol Masuk dengan Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2.5 shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Masuk dengan Google
        </button>

        {/* Kredensial Uji Coba */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-[#5A6B78] uppercase tracking-wider mb-2">
            Isi Kredensial Uji Akun:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillCredentials(users.find((u) => u.role === "pasien") || { email: "andi@example.com" })}
              className="p-2 text-left rounded-lg border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/60 transition-colors"
            >
              <span className="font-semibold text-[#0E7490] block">Pasien (Andi)</span>
              <span className="text-[10px] text-gray-500">andi@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials(users.find((u) => u.role === "resepsionis") || { email: "laras@example.com" })}
              className="p-2 text-left rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-colors"
            >
              <span className="font-semibold text-blue-700 block">Resepsionis (Laras)</span>
              <span className="text-[10px] text-gray-500">laras@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials(users.find((u) => u.role === "dokter") || { email: "bima@example.com" })}
              className="p-2 text-left rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors"
            >
              <span className="font-semibold text-emerald-700 block">Dokter (drg. Bima)</span>
              <span className="text-[10px] text-gray-500">bima@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials(users.find((u) => u.role === "super_admin") || { email: "ratna@example.com" })}
              className="p-2 text-left rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-colors"
            >
              <span className="font-semibold text-purple-700 block">Admin (Bu Ratna)</span>
              <span className="text-[10px] text-gray-500">ratna@example.com</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            Klik akun di atas untuk mengisi formulir, lalu klik Masuk.
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-[#5A6B78]">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-[#0E7490] font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
