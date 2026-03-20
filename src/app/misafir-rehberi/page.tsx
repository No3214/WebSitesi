import { Metadata } from "next";
import { GuestGuideClient } from "@/components/guest-guide-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Misafir Rehberi",
  description:
    "Kozbeyli Konağı'nda konaklama rehberi: giriş-çıkış saatleri, kahvaltı servisi, Wi-Fi, ulaşım bilgileri ve iptal politikası.",
  alternates: { canonical: "/misafir-rehberi" },
  openGraph: {
    images: [
      {
        url: absoluteUrl("/images/rooms/aile-1.jpeg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı - Misafir Rehberi",
      },
    ],
  },
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
