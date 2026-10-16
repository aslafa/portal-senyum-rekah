export const instant = false;

import ResepsionisGuard from "@/components/ResepsionisGuard";

export default function StafLayout({ children }) {
  return <ResepsionisGuard>{children}</ResepsionisGuard>;
}

