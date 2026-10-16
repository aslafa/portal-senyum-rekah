export const instant = false;

import PelangganGuard from "@/components/PelangganGuard";

export default function PelangganLayout({ children }) {
  return <PelangganGuard>{children}</PelangganGuard>;
}

