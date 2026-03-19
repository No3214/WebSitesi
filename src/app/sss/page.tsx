import { Metadata } from "next";
import { FAQClient } from "./faq-client";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Kozbeyli Konağı hakkında merak ettikleriniz: check-in, ulaşım, restoran, evcil hayvan politikası ve daha fazlası.",
  alternates: { canonical: "/sss" },
};

export default function FAQPage() {
  return <FAQClient />;
}
