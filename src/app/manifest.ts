import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kozbeyli Konağı — Taş Butik Otel & Restoran",
    short_name: "Kozbeyli Konağı",
    description:
      "Foça Kozbeyli'de 19. yüzyıl tescilli taş konakta butik konaklama ve Antakya-Ege mutfağı.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#3d4a3b",
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
