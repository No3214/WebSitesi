import { Metadata } from "next";
import { RoomsClient } from "@/components/rooms-client";
import { getDictionary } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Lüks Taş Odalar & Konaklama",
  description: "Kozbeyli Konağı'nın Horasan harcıyla restore edilmiş, yüksek tavanlı ve nefes alan taş odaları. Foça'da sükunet dolu, izole ve lüks butik konaklama deneyimi. Tarihi mimari ile buluşun.",
  keywords: ["kozbeyli taş odalar", "foça butik otel", "tarihi mimari konaklama", "izole butik tatil", "foça lüks konaklama", "izmir butik otel odaları", "restore edilmiş konak", "sessiz doğa tatili"],
};

export default async function RoomsPage() {
  const dict = await getDictionary("tr");
  return <RoomsClient initialDict={dict} initialLocale="tr" />;
}
