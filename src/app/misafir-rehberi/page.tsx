import { Metadata } from "next";
import { GuestGuideClient } from "@/components/guest-guide-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Misafir Rehberi",
  description:
    "Kozbeyli Konağı'nda konaklama rehberi: giriş-çıkış saatleri, kahvaltı servisi, Wi-Fi, ulaşım bilgileri ve iptal politikası.",
  alternates: { canonical: "/misafir-rehberi" },
};

export default function GuestGuidePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "Misafir Rehberi" },
      ])} />
      <GuestGuideClient />
    </>
  );
}
