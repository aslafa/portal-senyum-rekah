"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  confirmVariant = "primary", // primary, danger, success
  onConfirm,
  onCancel,
  children
}) {
  if (!isOpen) return null;

  const variantStyles = {
    primary: "bg-[#0E7490] hover:bg-[#0c627a] text-white",
    danger: "bg-[#E53935] hover:bg-[#c62828] text-white",
    success: "bg-[#15A66A] hover:bg-[#0e8654] text-white"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          <div
            className={`p-2.5 rounded-full shrink-0 ${
              confirmVariant === "danger"
                ? "bg-red-50 text-red-600"
                : confirmVariant === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-cyan-50 text-[#0E7490]"
            }`}
          >
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-[#5A6B78]">{message}</p>
            {children && <div className="mt-3">{children}</div>}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-gray-50 px-5 py-3.5 flex justify-end gap-2.5 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200/70 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-xs ${variantStyles[confirmVariant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
