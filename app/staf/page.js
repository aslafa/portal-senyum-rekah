"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StafPage() {
  const router = useRouter();

  useEffect(() => {
    // Alamat /staf dialihkan ke modul meja depan /resepsionis
    router.replace("/resepsionis");
  }, [router]);

  return null;
}
