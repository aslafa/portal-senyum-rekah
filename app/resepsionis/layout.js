export const instant = false;

import ResepsionisGuard from "@/components/ResepsionisGuard";

export default function ResepsionisLayout({ children }) {
  return <ResepsionisGuard>{children}</ResepsionisGuard>;
}

