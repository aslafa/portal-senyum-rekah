"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TenagaAhliUnderscorePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dokter");
  }, [router]);

  return null;
}
