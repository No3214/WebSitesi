import { Metadata } from "next";

import { GalleryPageContent } from "@/components/gallery-page-content";
import { altLanguages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Galeri | Taş, Işık ve Sofra Kareleri",
  description:
    "Kozbeyli Konağı'nın taş avlusu, tarihi odaları, Ege manzaraları ve serpme kahvaltı sofralarından kareler. Beş asırlık Kozbeyli köy dokusunu fotoğraflarla keşfedin.",
  alternates: altLanguages("/galeri", "/en/gallery"),
  openGraph: {
    title: "Galeri | Kozbeyli Konağı",
    description: "Taş avlu, tarihi odalar ve Ege sofralarından kareler.",
    url: absoluteUrl("/galeri"),
    images: [{ url: absoluteUrl("/images/hero.jpg"), alt: "Kozbeyli Konağı taş avlusu" }],
  },
};

export default function GalleryPage() {
  return <GalleryPageContent locale="tr" />;
}
