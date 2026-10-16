"use client";

import React from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";

export default function DataStateWrapper({
  isLoading = false,
  isError = false,
  errorMessage = "Terjadi kendala saat memuat data.",
  isEmpty = false,
  emptyTitle = "Belum ada data",
  emptyDescription = "Data untuk kategori ini belum tersedia saat ini.",
  emptyAction,
  onRetry,
  children
}) {
  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mb-3" />
        <p className="text-sm font-medium text-[#5A6B78]">Memuat data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-red-50/50 rounded-xl border border-red-100">
        <div className="p-3 bg-red-100 text-red-600 rounded-full mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-gray-900 mb-1">Gagal Memuat Data</h4>
        <p className="text-sm text-[#5A6B78] max-w-md mb-4">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0E7490] hover:bg-[#0c627a] rounded-lg transition-colors shadow-xs"
          >
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-16 px-6 flex flex-col items-center justify-center text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
        <div className="p-3 bg-gray-100 text-gray-400 rounded-full mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-gray-900 mb-1">{emptyTitle}</h4>
        <p className="text-sm text-[#5A6B78] max-w-md mb-4">{emptyDescription}</p>
        {emptyAction}
      </div>
    );
  }

  return <>{children}</>;
}
