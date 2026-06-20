# Last30Days Hotel Web Signal Brief - 2026-06-20

## Scope

Kozbeyli Konagi icin son 30 gunde luxury boutique hotel website, booking UX,
Next.js/Payload/Vercel ve premium hospitality web tasarimi sinyalleri incelendi.
Ham last30days ciktisi `reports/research/luxury-boutique-hotel-website-design-booking-ux-next-js-hospitality-raw.md`
altinda saklandi.

## Source coverage

- `last30days` motoru bu ortamda Reddit, GitHub, YouTube, Hacker News ve
  Polymarket kaynaklarini gorebiliyor.
- X/Twitter gercek taramasi yapilamadi: `bird_authenticated=false` ve
  `x_backend=null`. X icin `AUTH_TOKEN`/`CT0` veya `XAI_API_KEY` gerekir.
- Son calisma 2 aktif kaynak dondurdu: GitHub ve Reddit. YouTube ve Hacker News
  bu sorguda son 30 gun icinde anlamli sonuc dondurmedi.

## Fresh signals

- Reddit tarafindaki en kullanisli sinyal, tasarim iddiasi olan sitelerde bile
  karmasik navigasyon, bozuk yuklenme durumu ve erisilebilirlik kusurlarinin
  guveni hizla dusurdugu yonunde.
- GitHub sinyalleri boutique/luxury hotel listelerinde kategorilendirme,
  otel siniflandirmasi, aciklama alani ve rezervasyon linki gibi yapisal
  verilerin daha cok one ciktigini gosteriyor.
- Harici web kaynaklari 2026 hotel web tarafinda ayni yonde birlesiyor:
  mobile-first booking, ilk ekranda net direkt rezervasyon avantaji, hizli
  tarih/oda secimi, immersive ama dogrulanmis gorsel hikaye, sosyal kanit ve
  fiyat/oda bilgisinde seffaflik.

## Kozbeyli backlog

1. Domain cutover once tamamlanmali. Premium tasarim, eski Joomla/HotelRunner
   yuzeyi canonical domainde kaldigi surece kullaniciya ulasmiyor.
2. Rezervasyon CTA her public sayfada ilk ekranda ve mobilde kolay ulasilir
   kalmali; HMS handoff yeni sekmede devam etmeli.
3. Oda ve organizasyon kartlarinda siniflandirma, kapasite, manzara, metrekare,
   deneyim/faydalar ve rezervasyon yolu tek bakista okunur kalmali.
4. Menu ve dugun/organizasyon icerikleri PDF gommekten once webde taranabilir,
   hizli acilan, mobil okunabilir ozet bloklara cevrilmeli; PDF indirilebilir
   belge olarak ikincil kalmali.
5. Hero video ve gorsellerde sadece gercek otel medyasi kullanilmali. Hayali
   gorsel uretimi veya belirsiz kaynakli stok medya public urun medyasi olarak
   kullanilmamali.
6. En yuksek getirili sonraki kod isi, domain duzeldikten sonra canli
   `launch:smoke:live` ve Search Console/analytics kanitlarini kapatan evidence
   gate'lerini tamamlamaktir.

## Do not do yet

- X sinyali varmis gibi karar verme. Once X erisimi acilmali veya kullanici
  onayli export/screenshot saglanmali.
- Sabit fiyat/iptal/garanti vaatlerini isletme ve hukuk onayi olmadan buyutme.
- Remotion veya video isleme ekosistemi, mevcut hazir otel videolarina net bir
  kalite/format ihtiyaci cikmadan dependency olarak eklenmemeli.
