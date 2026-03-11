export async function GET() {
  const text = `# Kozbeyli Konağı

> Foça Kozbeyli'de taş butik otel ve restoran. Direkt rezervasyon, online menü, düğün, nişan ve kurumsal organizasyon alanları sunar.

## Official Website
- https://www.kozbeylikonagi.com.tr/

## Key Pages
- /odalar
- /menu
- /organizasyonlar

## Booking
- HotelRunner entegrasyonu
- WhatsApp ve telefon ile direkt iletişim

## Brand Facts
- Marka adı: Kozbeyli Konağı
- Konum: Kozbeyli Köyü, Foça, İzmir, Türkiye
- Hizmetler: konaklama, restoran, kahvaltı, organizasyon, workshop
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
