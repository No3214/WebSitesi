# kozbeylikonagi.com → Vercel DNS Geçişi (E-posta Korunarak)

> Amaç: web'i Vercel'e taşı, **info@kozbeylikonagi.com e-postasını kesintisiz koru** (mail sunucusu Veridyen, 78.142.208.142).
> Mevcut otorite: Cloudflare NS (THEO / ANASTASIA .NS.CLOUDFLARE.COM) — erişilemeyen hesap.
> Registrar: isimtescil (yönetim ID 2585507).

---

## KORUNMASI ZORUNLU KAYITLAR (e-posta + doğrulama)

| Tip  | Ad / Host           | Değer | Öncelik |
|------|---------------------|-------|---------|
| MX   | @                   | mx.kozbeylikonagi.com | 0 |
| A    | mx                  | 78.142.208.142 | — |
| A    | webmail             | 78.142.208.142 | — |
| TXT  | @ (SPF)             | `v=spf1 include:_spf.protection.veridyen.com include:relay.mailchannels.net ~all` | — |
| TXT  | _dmarc              | `v=DMARC1; p=quarantine;` | — |
| TXT  | default._domainkey  | `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmZwuWMX4KbBjaTZNVABLQy39FyN2+XzJaB/ieLWlxLmfGzQ7BlDanGPmkoaqewzV/jgpMMtvgEE1Ll/pIyNQIbV6VDpyFVJ2aaw1Z9kv01AH9hLXMsSRhRQjFM8O4fTkqz49EgiKbMuIolhpoUKqVD2wmACXAjFG+RUg0dgrbH1PlPG3wByEb7mnGAeDToQEReNMqNzmLRQYA1fS3AW5vyqZiGN7uTjUYZk6bR0KGWW+KmE9rBqCpYVPksBVZ9EtOs/OOHClEPMpdytwmvdRhrzs/t/+/NU6XO9Acuy0Zl956UVn3/2GQUimusQjVNMdB36QTuDxg5aAvmVcqGcINwIDAQAB;` | — |

## WEB KAYITLARI (Vercel)

| Tip   | Ad   | Değer |
|-------|------|-------|
| A     | @    | 76.76.21.21 |
| CNAME | www  | dacb3ec12ca81d22.vercel-dns-017.com |

---

## YÖNTEM A — Cloudflare içe-aktarım (ÖNERİLEN, SIFIR KESİNTİ)

Yeni bir Cloudflare hesabında zone'u kurup hazır olunca NS'i çevirirsin; eski zone NS değişene kadar yayında kalır → e-posta hiç kesilmez.

1. dash.cloudflare.com → **Add a site** → `kozbeylikonagi.com` → **Free** plan.
2. Cloudflare mevcut kayıtları taramaya çalışır. **Yukarıdaki 8 kaydın hepsinin** içe alındığını DOĞRULA; eksik olanı elle ekle. Özellikle MX, mx A, webmail A, SPF, DMARC, DKIM.
3. Web kayıtlarını ekle/güncelle: A @ → 76.76.21.21, CNAME www → vercel hedefi. (Proxy turuncu bulutu KAPALı bırak — "DNS only" — Vercel SSL için.)
4. Cloudflare sana 2 yeni nameserver verir (ör. `xxx.ns.cloudflare.com`).
5. isimtescil → Host Name (DNS) Yönetimi (`/panel/domain/ns/2585507`) → **Müşteriye Özel Dns'ler** → DNS1/DNS2'ye Cloudflare'ın verdiği yeni NS'leri yaz → Güncelle.
6. Vercel → Project → Settings → Domains → `kozbeylikonagi.com` → **Refresh / Verify**. SSL otomatik gelir.
7. 1-24 saat içinde propagasyon. `nslookup -type=mx kozbeylikonagi.com` ile MX'in hâlâ Veridyen'i gösterdiğini doğrula.

---

## YÖNTEM B — isimtescil Default DNS (kullanıcının seçtiği; küçük risk penceresi)

isimtescil kayıt editörü ancak NS isimtescil'e çevrildikten SONRA açılır → NS değişimiyle kayıt eklemek arasında kısa bir e-posta riski oluşur. Riski azaltmak için kayıtları HIZLI ekle.

1. isimtescil → Host Name (DNS) Yönetimi → **İsimtescil Default DNS'ler** kutusunu işaretle (tr/us/eu.dnsenable.com) → Güncelle.
2. HEMEN DNS bölge editörünü aç (genelde Default DNS seçilince "DNS Yönetimi" görünür) ve önce **e-posta kayıtlarını** gir: MX @, A mx, A webmail, SPF, DMARC, DKIM default._domainkey.
3. Sonra web kayıtları: A @ → 76.76.21.21, CNAME www → vercel hedefi.
4. Vercel → Domains → Refresh.
5. Propagasyon sırasında eski Cloudflare NS hâlâ kullanılan resolver'larda e-posta çalışmaya devam eder; isimtescil NS'i kullananlar için kayıtlar zaten hazır olur.

**Geri dönüş (revert):** sorun olursa isimtescil NS'leri tekrar THEO.NS.CLOUDFLARE.COM + ANASTASIA.NS.CLOUDFLARE.COM yap.

---

## DOĞRULAMA KOMUTLARI (geçiş sonrası)

```
nslookup -type=mx kozbeylikonagi.com      # mx.kozbeylikonagi.com (Veridyen) görünmeli
nslookup -type=a  kozbeylikonagi.com      # 76.76.21.21 (Vercel)
nslookup -type=a  mx.kozbeylikonagi.com   # 78.142.208.142
nslookup -type=txt kozbeylikonagi.com     # SPF görünmeli
```

> Not: Yöntem A sıfır kesinti sağladığı için canlı e-postada önerilen yoldur.

---

## ÖNEMLİ KEŞİF (17.06.2026 denemesi) — dnsenable yansıtma gecikmesi

isimtescil "Gelişmiş DNS Yönetimi" (`/panel/domain/dns/2585507`) panelinde TÜM kayıtlar
önceden eklendi (apex A→76.76.21.21, MX @→mx.kozbeylikonagi.com, A mx/webmail→78.142.208.142,
SPF, DMARC, DKIM*, www CNAME). Ardından NS isimtescil default DNS'e (dnsenable) çevrildi.

SORUN: dnsenable'ın YETKİLİ sunucuları (tr/us/eu.dnsenable.com) panel kayıtlarını ANINDA
sunmadı — sadece varsayılan zone'u (apex→93.89.226.17, **MX YOK**) döndü. dnsenable panel→sunucu
senkronu saatler alıyor (kendi notu: global yansıma 24-48s). NS dnsenable'a geçince MX bir süre
boş kaldığı için CANLI E-POSTA RİSKE GİRDİ → derhal Cloudflare NS'e (profil 1317878) geri dönüldü.
E-posta Cloudflare üzerinden sağlam doğrulandı (MX/mx/SPF tamam).

\* DKIM: dnsenable TXT'i 255 karaktere kırpıyor; DKIM anahtarı 411 karakter → kırpılıyor (geçersiz).
   E-posta yine çalışır (DMARC SPF üzerinden geçer) ama DKIM imzası dnsenable'da tam barınmaz.

## DOĞRU isimtescil-only SIFIR-KESİNTİ PLANI (kayıtlar zaten panelde hazır)

1. NS şu an Cloudflare'da (e-posta güvende). Dokunma.
2. dnsenable kayıtları zaten panelde kayıtlı. Yetkili sunucularının bunları YAYINLAMASINI bekle.
3. Periyodik kontrol (NS'e DOKUNMADAN): `dig MX kozbeylikonagi.com @tr.dnsenable.com` ve
   `dig A kozbeylikonagi.com @tr.dnsenable.com`.
   - MX → `mx.kozbeylikonagi.com` VE apex A → `76.76.21.21` GÖRÜNENE KADAR NS'i ÇEVİRME.
4. dnsenable doğru kayıtları sunmaya başlayınca → NS'i isimtescil default DNS'e çevir (sıfır kesinti).
5. Vercel → Domains → Refresh.
6. Geri dönüş her zaman: isimtescil NS sayfasında "Müşteriye Özel Dns'ler" → profil 1317878
   (anastasia/theo.ns.cloudflare.com) → Güncelle.

> DKIM'i tam istiyorsan: Veridyen'den daha kısa bir DKIM anahtarı (1024-bit) talep et ya da
> DKIM kaydını dnsenable yerine bir CNAME ile Veridyen'in barındırdığı host'a yönlendir.
