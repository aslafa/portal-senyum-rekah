"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PelangganPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/beranda");
  }, [router]);

  return null;
}
