import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kozbeyli Konağı — Taş Butik Otel & Restoran",
    short_name: "Kozbeyli Konağı",
    description:
      "Foça Kozbeyli'de 500 yıllık taş konakta butik konaklama ve Antakya-Ege mutfağı.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#6b725c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
