# Ödeme Mimarisi Kararı — Garanti BBVA Sanal POS

> Karar tarihi: 2026-06-10 · Karar veren: Yunuscan · Analiz: xhigh disipliniyle (3 yaklaşım + stress-test)
> Durum: **KARAR VERİLDİ, entegrasyon BEKLEMEDE** (banka bağlantı bilgileri henüz alınmadı).

## Karar

Sitedeki rezervasyon sihirbazı **ön-rezervasyon talebi** alır (kart bilgisi ASLA istemez);
tahsilat, **Garanti BBVA Sanal POS'un 3D Secure güvenli ödeme sayfasında** ayrı bir adımda yapılır.

Bu modelde kart numarası (PAN) hiçbir zaman bizim sunucuya/forma girmez → PCI-DSS kapsamı
minimumda kalır (SAQ-A sınıfı), Audit bulgusu **F13 kökten kapanır**.

## Değerlendirilen alternatifler (neden bunlar değil)

| Yaklaşım | Neden reddedildi |
|---|---|
| (a) Yalnız HMS booking engine | Resmi HMS handoff URL'i artık mevcut, ancak tahsilat tamamen üçüncü tarafın UX'ine kilitlenir ve Garanti POS kararının kapsadığı banka kontrollü ödeme akışını sağlamaz. |
| (b) Sitede kart formu + API tahsilatı | PAN bizim altyapıdan geçer → PCI yükü (SAQ-A-EP+), 3DS akışı, chargeback operasyonu; tek geliştirici için bakım bombası. |
| (c-eski) iyzico pay-by-link | Banka tercihi Garanti olarak netleşti; komisyon/anlaşma bankayla. |

**Kararı çeviren tek varsayım:** "Misafir, talep → ödeme sayfası yönlendirmesi arasındaki
beklemeyi tolere eder." Terk oranı belirgin artarsa sitede gömülü (b) modeline geçiş tartışılır.

**En zayıf nokta (stress-test):** Talep ile ödeme arasında insan döngüsü varsa misafir soğuyabilir.
Önlem: success ekranı beklentiyi netliyor ("24 saat içinde teyit"); entegrasyon sonrası akış
otomatikleşecek (aşağıda).

## Bugün yapılanlar (kod, 2026-06-10)

- Sihirbazdan kart alanları tamamen kaldırıldı (`payment-step.tsx`, `use-payment-wizard.ts`)
- `api/checkout` şemasından `cardNumber` çıktı; mock kart doğrulaması silindi; route saf
  "doğrulanmış talep kaydı" oldu
- UI metinleri: "kart bilgisi istemiyoruz; ödeme Garanti BBVA Sanal POS güvenli sayfasında"
- Public `/odeme` sayfası demo/simülasyon akışı değil; kart verisi almayan ve ödeme
  UAT kanıtı tamamlanana kadar tahsilat başlatmayan güvenli ödeme bilgilendirmesi oldu.

## Garanti'den İSTENECEKLER (başvuru/teslimde)

1. **Sanal POS başvurusu** (işyeri hesabı üzerinden) → onay sonrası:
2. `Merchant ID (Üye İşyeri No)` · `Terminal ID` · `Provizyon kullanıcısı + şifresi`
3. **3D Secure Store Key** (3D işlemler için zorunlu)
4. **Test ortamı bilgileri** (test terminali + test kartları dokümanı)
5. Entegrasyon dokümanı: "Garanti Sanal POS (GVP) 3D Pay / 3D Model" — **3D Model**
   (kart bilgisinin BANKA sayfasında girildiği varyant) talep edilecek
6. Başarılı/başarısız dönüş (callback) URL'lerinin tanımlatılması:
   `https://www.kozbeylikonagi.com/api/payment/garanti/callback`

## Entegrasyon günü yapılacaklar (bilgiler gelince — tahmini yarım gün)

1. `src/lib/payments/garanti.ts`: hash üretimi (SHA-512, store key) + 3D form alanları
2. `api/payment/garanti/init`: bookingId'den tutarı SUNUCUDA yeniden hesapla → bankaya
   yönlendirme formu döndür (tutar asla client'tan alınmaz)
3. `api/payment/garanti/callback`: hash doğrula → `organization-leads` kaydını "paid" işaretle
   (mevcut webhook altyapısındaki imza-doğrulama desenleri yeniden kullanılır)
4. Success ekranına "Ödemeyi Tamamla" butonu (init'e gider)
5. e2e: callback hash reddi + mutlu yol testi; `.env.example`'a GARANTI_* anahtarları
6. KVKK/mesafeli satış metinlerine ödeme sağlayıcı ibaresi

## İlgili

- AUDIT.md → F1 (kapalı), F13 (bu kararla kökten kapalı)
- memory/fable5-playbook.md §2.8 — kararın çalışıldığı şablon
