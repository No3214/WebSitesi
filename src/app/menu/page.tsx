import { Metadata } from "next";
import { JsonLd, menuSchema, breadcrumbSchema } from "@/components/json-ld";
import MenuClient from "@/components/menu-client";

export const metadata: Metadata = {
  title: "Menü | Kozbeyli Konağı Restoran",
  description:
    "Kozbeyli Konağı'nın gurme menüsü: Serpme köy kahvaltısı, Antakya mutfağı, taş fırın pizza ve meşhur dibek kahvesi. Ege'nin en otantik lezzetleri.",
  keywords: [
    "kozbeyli konağı menü",
    "foça restoran menü",
    "serpme köy kahvaltısı",
    "antakya mutfağı izmir",
    "taş fırın pizza foça",
    "dibek kahvesi",
    "ege mutfağı",
  ],
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Menü | Kozbeyli Konağı Restoran",
    description:
      "Serpme köy kahvaltısı, Antakya lezzetleri ve taş fırın pizzalar. Kozbeyli Konağı'nın gurme menüsünü keşfedin.",
    url: "/menu",
    images: [
      {
        url: "/images/gastronomi/menu-og.jpg",
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı Restoran Menüsü",
      },
    ],
  },
};

export default function MenuPage() {
  return (
    <>
      <JsonLd
        data={[
          menuSchema(),
          breadcrumbSchema([
            { name: "Ana Sayfa", url: "/" },
            { name: "Gastronomi", url: "/gastronomi" },
            { name: "Menü" },
          ]),
        ]}
      />
      <MenuClient />
    </>
  );
}
