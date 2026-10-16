"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { registerWithEmail, loginWithGoogle } from "@/lib/auth";
import { UserPlus, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DaftarPage() {
  const router = useRouter();
  const { users, switchUser } = useStore();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi PRD Bab 4.1
    // Email wajib dan unik
    if (!email || !email.includes("@")) {
      setError("Email tidak valid atau belum diisi.");
      return;
    }

    // Nomor HP hanya angka dan diawali 08
    const phoneRegex = /^08[0-9]{8,12}$/;
    if (!phoneRegex.test(noHp)) {
      setError("Nomor HP harus berupa angka dan diawali '08' (10-14 digit).");
      return;
    }

    // Kata sandi minimal 6 karakter
    if (!password || password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      // Sesuai Bab 4.1: Sistem membuat akun dan profil berperan pasien (tanpa simpan password di Firestore), lalu membawa ke /beranda
      const { user, profile } = await registerWithEmail(email, password, nama, noHp);
      switchUser(user.uid);
      router.push("/beranda");
    } catch (err) {
      console.warn("Registration error:", err);
      if (err?.code === "auth/email-already-in-use") {
        setError("Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.");
      } else {
        // Fallback jika mode offline / auth simulasi
        const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          setError("Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.");
        } else {
          setError("Gagal mendaftar: " + (err?.message || "Terjadi kesalahan. Coba lagi."));
        }
      }
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const { user, profile } = await loginWithGoogle();
      switchUser(user.uid);
      router.push("/beranda");
    } catch (err) {
      console.error("Google signup error:", err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Gagal masuk dengan Google: " + (err?.message || "Terjadi kesalahan"));
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-cyan-50 text-[#0E7490] rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            🦷
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Daftar Akun Pasien
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6B78] mt-1">
            Buat akun untuk memesan janji temu di Klinik Gigi Senyum Rekah
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Andi Saputra"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nomor HP (WhatsApp) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent tabular-nums"
            />
            <p className="text-[11px] text-[#5A6B78] mt-1">
              Format hanya angka dan wajib diawali 08
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
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
            {loading ? "Mendaftarkan..." : "Daftar Akun"}
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

        {/* Tombol Masuk dengan Google (Bab 4.1) */}
        <button
          type="button"
          onClick={handleGoogleSignup}
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

        <p className="mt-5 text-center text-xs text-[#5A6B78]">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-[#0E7490] font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
