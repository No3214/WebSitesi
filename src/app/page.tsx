import { Metadata } from "next";
import { HomeClient } from "@/components/home-client";
import { defaultMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Kozbeyli Konağı | Foça’nın En Prestijli Taş Butik Oteli & Restoranı",
  description: "Foça Kozbeyli’de 500 yıllık tescilli taş mimari, Antakya & Ege mutfağı ve kişiselleştirilmiş hizmet. Horasan harcıyla dokunmuş huzur ve sükunet.",
  alternates: {
    canonical: "/",
  }
};

export default function HomePage() {
  return <HomeClient />;
}
