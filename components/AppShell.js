"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === "/masuk" || pathname === "/daftar";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] text-[#1F2937] flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🦷</span>
            <div>
              <span className="font-bold text-gray-900 text-lg block leading-tight">
                Portal Janji Senyum Rekah
              </span>
              <span className="text-xs text-[#5A6B78]">
                Klinik Gigi Senyum Rekah - Makassar
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#5A6B78] hidden sm:inline">Pratinjau Tanpa Login:</span>
            <Link
              href="/beranda"
              className="px-3 py-1.5 bg-[#0E7490] hover:bg-[#0c627a] text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              Langsung ke Beranda <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-[#1F2937] flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />



      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
