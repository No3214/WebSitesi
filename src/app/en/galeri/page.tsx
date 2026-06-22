import type { Metadata } from "next";
import { GalleryPageContent } from "@/components/gallery-page-content";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Scenes from Kozbeyli Konağı's stone courtyard, historic rooms, Aegean views and breakfast tables. Discover five centuries of texture in photographs.",
  alternates: { canonical: "/en/galeri" },
  openGraph: {
    url: absoluteUrl("/en/galeri"),
    title: "Gallery | Kozbeyli Konağı",
    description: "The stone courtyard, historic rooms and Aegean tables in photographs.",
  },
};

export default function EnglishGalleryPage() {
  return <GalleryPageContent locale="en" />;
}
