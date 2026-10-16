export const instant = false;

import TenagaAhliGuard from "@/components/TenagaAhliGuard";

export default function TenagaAhliLayout({ children }) {
  return <TenagaAhliGuard>{children}</TenagaAhliGuard>;
}

