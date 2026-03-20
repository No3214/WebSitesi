import { Metadata } from "next";
import { FAQClient } from "./faq-client";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";

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
    { "@type": "Question", name: "Check-in ve check-out saatleri nedir?", acceptedAnswer: { "@type": "Answer", text: "Check-in 14:00 itibarıyla, check-out 12:00'ye kadardır. Erken giriş ve geç çıkış müsaitliğe bağlı olarak ücretli sunulabilir." } },
    { "@type": "Question", name: "Evcil hayvan kabul ediyor musunuz?", acceptedAnswer: { "@type": "Answer", text: "Evet, küçük ırklar ücretsiz kabul edilir. Önceden bildirilmesi gerekmektedir." } },
    { "@type": "Question", name: "İptal koşulları nedir?", acceptedAnswer: { "@type": "Answer", text: "Varıştan 72 saat öncesine kadar iptal ücretsiz. 72 saat içinde yapılan iptallerde ücret iadesi yapılmaz." } },
    { "@type": "Question", name: "Restoran sadece konaklayan misafirlere mi açık?", acceptedAnswer: { "@type": "Answer", text: "Hayır, restoranımız dış misafirlere de açıktır. Fix menü servis, mutfak kapanış 22:00." } },
    { "@type": "Question", name: "Kahvaltı dahil mi?", acceptedAnswer: { "@type": "Answer", text: "Evet, serpme kahvaltı (sucuklu yumurta + pişi dahil) tüm konaklama paketlerine dahildir." } },
    { "@type": "Question", name: "Düğün organizasyonu yapıyor musunuz?", acceptedAnswer: { "@type": "Answer", text: "Evet, 100 kişiye kadar düğün ve organizasyon düzenliyoruz. 16 odalı konak tümüyle kiralanabilir." } },
    { "@type": "Question", name: "Foça merkeze ne kadar uzakta?", acceptedAnswer: { "@type": "Answer", text: "Foça merkezine araçla 10-15 dakika mesafedeyiz. Foça plajlarına kolayca ulaşabilirsiniz." } },
  ],
};

export default function FAQPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "SSS" },
      ]), faqSchema]} />
      <FAQClient />
    </>
  );
}
