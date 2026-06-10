import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { getPayloadClient } from "@/lib/payload";
import { GrowthDashboardClient } from "./growth-client";

// Auth guard (Audit F2/T2): bu sayfa yalnızca Payload admin oturumu olan
// kullanıcılara açıktır. Oturum yoksa Payload login'e yönlendirilir.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Growth Dashboard | Kozbeyli Konağı",
  robots: { index: false, follow: false },
};

export default async function GrowthDashboardPage() {
  let authenticated = false;

  try {
    const payload = await getPayloadClient();
    const requestHeaders = await nextHeaders();
    const { user } = await payload.auth({ headers: requestHeaders });
    authenticated = Boolean(user);
  } catch {
    authenticated = false;
  }

  // redirect() throw eder; try/catch DIŞINDA çağrılmalı.
  if (!authenticated) {
    redirect("/admin");
  }

  return <GrowthDashboardClient />;
}
