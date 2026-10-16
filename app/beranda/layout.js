export const instant = false;

import PelangganGuard from "@/components/PelangganGuard";

export default function BerandaLayout({ children }) {
  return <PelangganGuard>{children}</PelangganGuard>;
}
