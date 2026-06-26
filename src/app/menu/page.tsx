import { Metadata } from "next";

import { MenuBook } from "@/components/menu-book";
import { SiteHeader } from "@/components/site-header";
import { menuSections } from "@/data/menu";
import { altLanguages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gurme Yemek Menüsü | Taş Fırın & Kahvaltı",
  description:
    "Kozbeyli Konağı restoran menüsü: serpme kahvaltı, Antakya mezeleri, Napoliten pizza, ana yemekler, tatlılar ve Paşaeli şarap eşleşmeleri.",
  keywords: [
    "kozbeyli konağı menü",
    "serpme kahvaltı menüsü foça",
    "antakya yemekleri izmir",
    "napoliten pizza foça",
    "foça akşam yemeği mekanları",
    "paşaeli şarap eşleşmeleri",
  ],
  alternates: altLanguages("/menu", "/en/menu"),
  openGraph: {
    title: "Gurme Yemek Menüsü | Kozbeyli Konağı",
    description:
      "Kozbeyli Konağı gurme restoran menüsü. Kahvaltı, Antakya mezeleri, Napoliten pizza, ana yemek ve şarap eşleşmeleri.",
    url: absoluteUrl("/menu"),
    images: [
      {
        url: absoluteUrl("/videos/mihlama-poster.jpg"),
        alt: "Taş ateşinde hazırlanan mıhlama - Kozbeyli Konağı mutfağı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozbeyli Konağı Gurme Restoran Menüsü",
    description: "Serpme kahvaltı, Antakya mezeleri, Napoliten pizza ve şarap eşleşmeleri.",
    images: [absoluteUrl("/videos/mihlama-poster.jpg")],
  },
};

export default function MenuPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <MenuBook
        sections={menuSections}
        title="Kozbeyli Konağı"
        subtitle="Restoran Menüsü"
        note="Beş asırlık Kozbeyli köy dokusunun içinde, Antakya'dan gelen aile tariflerini Ege'nin zeytinyağı ve otlarıyla buluşturuyoruz. Taş fırınımızdan çıkan pizzalar, özenle seçilmiş malzemeler ve şarap eşleşmeleriyle her tabakta rafine bir konak deneyimi sunuyoruz. Menü içerikleri, stok ve fiyatlar dönemsel olarak değişebilir; servis öncesinde güncel bilgi ekibimizden teyit edilir."
        signature="Şef Yunuscan Oruk"
        ctaTitle="Size Özel Bir Akşam?"
        ctaText="Özel kutlamalarınız, grup yemekleriniz ve şarap tadımı talepleriniz için ekibimizle iletişime geçebilirsiniz."
        ctaHref="/organizasyonlar#teklif"
        ctaLabel="İLETİŞİME GEÇİN"
        featuredLabel="Konağın Seçimi"
        bundleLabel="Özel Seçki"
        indexLabel="Menü kategorileri"
        itemCountLabel="ürün"
        signalLanguage="tr"
        allergenNotes={[
          "(G) Gluten",
          "(S) Süt",
          "(F) Fındık/Kabuklu",
          "(Y) Yumurta",
          "(SU) Susam",
          "(B) Balık",
          "Diyet tercihinizi servis ekibimize bildiriniz.",
          "Kalori değerleri tahmini olup porsiyon boyutuna göre değişebilir.",
        ]}
      />
    </>
  );
}
