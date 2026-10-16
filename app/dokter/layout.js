export const instant = false;

import TenagaAhliGuard from "@/components/TenagaAhliGuard";

export default function DokterLayout({ children }) {
  return <TenagaAhliGuard>{children}</TenagaAhliGuard>;
}

