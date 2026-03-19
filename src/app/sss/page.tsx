import { Metadata } from "next";
import { FAQClient } from "./faq-client";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Kozbeyli Konağı hakkında merak ettikleriniz: check-in, ulaşım, restoran, evcil hayvan politikası ve daha fazlası.",
  alternates: { canonical: "/sss" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Check-in ve check-out saatleri nedir?", acceptedAnswer: { "@type": "Answer", text: "Check-in 14:00 itibarıyla, check-out 12:00'ye kadardır." } },
    { "@type": "Question", name: "Otopark mevcut mu?", acceptedAnswer: { "@type": "Answer", text: "Evet, konağımızda ücretsiz özel otopark bulunmaktadır." } },
    { "@type": "Question", name: "Evcil hayvan kabul ediyor musunuz?", acceptedAnswer: { "@type": "Answer", text: "Evet, küçük evcil hayvanlar (10 kg'a kadar) belirli odalarda kabul edilmektedir." } },
    { "@type": "Question", name: "Direkt rezervasyonun avantajı nedir?", acceptedAnswer: { "@type": "Answer", text: "En iyi fiyat garantisi, ücretsiz hoşgeldin kokteyli ve esnek iptal koşulları sunuyoruz." } },
    { "@type": "Question", name: "Restoran sadece konaklayan misafirlere mi açık?", acceptedAnswer: { "@type": "Answer", text: "Hayır, restoranımız dış misafirlere de açıktır." } },
    { "@type": "Question", name: "Kahvaltı dahil mi?", acceptedAnswer: { "@type": "Answer", text: "Evet, organik köy kahvaltısı tüm konaklama paketlerine dahildir." } },
    { "@type": "Question", name: "Havalimanı transfer hizmeti var mı?", acceptedAnswer: { "@type": "Answer", text: "Evet, İzmir Adnan Menderes Havalimanı'ndan VIP transfer hizmetimiz mevcuttur." } },
    { "@type": "Question", name: "Düğün organizasyonu yapıyor musunuz?", acceptedAnswer: { "@type": "Answer", text: "Evet, 30-60 kişilik butik düğünler düzenliyoruz." } },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQClient />
    </>
  );
}
