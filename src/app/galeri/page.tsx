import { Metadata } from "next";
import { GalleryClient } from "./gallery-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Fotoğraf Galerisi | Kozbeyli Konağı",
  description:
    "Kozbeyli Konağı'nın 500 yıllık taş mimarisi, odaları, restoranı ve Ege manzaralarını keşfedin. Foça Kozbeyli'de butik otel deneyimi.",
  keywords: ["kozbeyli konağı fotoğraflar", "foça butik otel görseller", "taş otel galeri", "ege manzarası"],
  alternates: { canonical: "/galeri" },
  openGraph: {
    title: "Fotoğraf Galerisi | Kozbeyli Konağı",
    description: "500 yıllık taş mimarisi, odaları, restoranı ve Ege manzaralarını keşfedin.",
    url: "/galeri",
    type: "website",
    images: [{ url: "/images/rooms/deniz-1.jpeg", width: 1200, height: 630, alt: "Kozbeyli Konağı galeri" }],
  },
};

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "Galeri" },
      ])} />
      <GalleryClient />
    </>
  );
}
