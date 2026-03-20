import { Metadata } from "next";
import { GalleryClient } from "./gallery-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Fotoğraf Galerisi",
  description:
    "Kozbeyli Konağı'nın 500 yıllık taş mimarisi, odaları, restoranı ve Ege manzaralarını keşfedin. Foça Kozbeyli'de butik otel deneyimi.",
  alternates: { canonical: "/galeri" },
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
