export const instant = false;

import PelangganGuard from "@/components/PelangganGuard";

export default function JanjiLayout({ children }) {
  return <PelangganGuard>{children}</PelangganGuard>;
}

