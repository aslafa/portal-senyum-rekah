import React from "react";

// Sesuai Bab 5.2 Warna status janji
// Menunggu: #F59E0B
// Dikonfirmasi: #2563EB
// Hadir: #7C3AED
// Selesai: #15A66A
// Dibatalkan: #E53935

const STATUS_CONFIG = {
  menunggu: {
    label: "Menunggu",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-[#F59E0B]"
  },
  dikonfirmasi: {
    label: "Dikonfirmasi",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-[#2563EB]"
  },
  hadir: {
    label: "Hadir",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-[#7C3AED]"
  },
  selesai: {
    label: "Selesai",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-[#15A66A]"
  },
  dibatalkan: {
    label: "Dibatalkan",
    bg: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-[#E53935]"
  }
};

export default function StatusBadge({ status, size = "md", showDot = true }) {
  const normStatus = (status || "").toLowerCase();
  const config = STATUS_CONFIG[normStatus] || {
    label: status || "Tidak Diketahui",
    bg: "bg-gray-50 text-gray-700 border-gray-200",
    dot: "bg-gray-400"
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} shadow-xs tabular-nums`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
}
