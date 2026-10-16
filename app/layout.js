import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export const metadata = {
  title: "Portal Janji Senyum Rekah - Klinik Gigi",
  description: "Aplikasi Janji Temu dan Catatan Perawatan Klinik Gigi Senyum Rekah, Makassar.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦷</text></svg>"
  }
};

import { Suspense } from "react";

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F4F7F9] text-[#1F2937]">
        <StoreProvider>
          <Suspense fallback={<div className="min-h-screen bg-[#F4F7F9]" />}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
