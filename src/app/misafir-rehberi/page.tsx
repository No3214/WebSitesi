import { Metadata } from "next";
import { GuestGuideClient } from "@/components/guest-guide-client";

export const metadata: Metadata = {
  title: "Misafir Rehberi",
  description:
    "Kozbeyli Konağı'nda konaklama rehberi: giriş-çıkış saatleri, kahvaltı servisi, Wi-Fi, ulaşım bilgileri ve iptal politikası.",
  alternates: { canonical: "/misafir-rehberi" },
};

export default function GuestGuidePage() {
  return <GuestGuideClient />;
}
