"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TenagaAhliPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dokter");
  }, [router]);

  return null;
}
