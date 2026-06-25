# Supabase + Vercel — Kurulum Doğrulaması ve Güvenli Sertleştirme

Tarih: 2026-06. Kaynak: canlı Vercel + Supabase MCP yoklaması.

## Mevcut durum (kanıt)
- **Vercel** projesi `kozbeyli-konagi`: framework Next.js, Node 24.x, son prod
  deploy **READY**. Domainler: `kozbeylikonagi.com`, `www.kozbeylikonagi.com`
  (+ vercel.app). Apex + www bağlı.
- **Supabase** projesi `WebSitesi` (`oxvraodfqsrbcokqrbyi`, eu-west-1, Postgres
  17, **ACTIVE_HEALTHY**). Prod DB bu.
- Payload kontratları PASS: postgres adapter + DATABASE_URI + PAYLOAD_SECRET;
  prod'da ikisi de zorunlu (`env.ts`).

## A) Admin/şema kurulumu (yapıldı)
Sorun: Payload tabloları bu DB'de yoktu → `/api/users` 500, admin "dependency
unavailable" ekranı. Düzeltme: `payload.config.ts` → `push: true` + `migrationDir`.
Sonraki deploy + ilk `/admin` isteğinde tüm collection tabloları oluşur.

### A.1 ÖNEMLİ — DATABASE_URI bağlantı tipi
Şema oluşturma (DDL/push) ve Payload sorguları için Supabase bağlantı dizgisi:
- **Session pooler** (port 5432, `...pooler.supabase.com`) veya **Direct**
  (port 5432, `db.<ref>.supabase.co`) KULLAN → DDL + prepared statement çalışır.
- **Transaction pooler** (port 6543) DDL/prepared-statement'ı kısıtlar → push
  başarısız olabilir. Serverless'te runtime için transaction pooler tercih edilse
  de, şema kurulumunu en az bir kez session/direct ile yap.
Vercel env: `DATABASE_URI` (Production). Sırrı repoya/sohbete yazma.

### A.2 İlk admin kullanıcısı
Şema oluştuktan sonra `https://www.kozbeylikonagi.com/admin` → "create first
user" ekranı gelir. İlk kullanıcı oluşturulunca admin tam aktif.

### A.3 push → migration disiplinine geçiş (öneri)
`push: true` ilk kurulum için pratik ve güvenli (boş DB). İçerik girildikten
SONRA, prod'da otomatik şema-sync sürprizlerini önlemek için:
1) `npm run payload:types` sonrası `payload migrate:create`,
2) commit, 3) `payload.config` → `push:false`, 4) deploy'da `payload migrate`.

## B) RLS / anon-REST maruziyeti (KRİTİK güvenlik)
Supabase her `public` tabloyu otomatik **PostgREST** (anon key) ile dışarı açar.
Payload tabloları `public`'te ve RLS'siz olursa `users` (parola hash'i),
`organization-leads` (KVKK/PII) gibi tablolar anon key'le okunabilir.

**En güvenli ve sıfır-risk çözüm (öneri):** Bu site Supabase PostgREST/anon
API'sini HİÇ kullanmıyor (Payload doğrudan Postgres bağlanır). O yüzden:
- Supabase Dashboard → **Project Settings → API → Data API**: `public` şemayı
  "Exposed schemas" listesinden çıkar **veya** Data API'yi tamamen kapat.
  Uygulamayı etkilemez (PostgREST kullanılmıyor), tüm anon maruziyetini sıfırlar.

**Alternatif/defense-in-depth:** Payload tablolarında RLS deny-all. Ön koşul:
Payload'ın bağlandığı rol RLS'i bypass etmeli (Supabase `postgres` süper-rolü
bypass eder). Bu repo'da şema oluştuktan SONRA, bağlantı rolünün
`rolbypassrls=true` olduğu DOĞRULANIP uygulanır (kör uygulanmaz). Örnek:
```sql
-- her Payload tablosu icin (rol bypass dogrulandiktan SONRA):
alter table public.users enable row level security;
-- policy eklenmez => anon/authenticated PostgREST 0 satir görür;
-- Payload (owner/postgres rolu) RLS'i bypass ettigi icin etkilenmez.
```
> Not: Tablo sahibi rol RLS'i varsayılan bypass eder (`FORCE` denmedikçe). Bu
> yüzden uygulama çalışmaya devam eder, yalnız anon REST kapanır.

## C) Supabase advisor bulguları (ilgisiz 4-tablo yan-şeması)
Bu tablolar (organizations/organization_members/hotels/restaurants) web sitesine
ait DEĞİL, boş (0 satır) ve ayrı bir Supabase-Auth modeli. Web sitesini
etkilemez. Kör değiştirilMEDİ; remediation aşağıda (uygulamak kullanıcının
kararına bırakıldı):

Güvenlik:
- `function_search_path_mutable` (`current_user_org_ids`): 
  `alter function public.current_user_org_ids() set search_path = public, pg_temp;`
- `rls_auto_enable` SECURITY DEFINER anon/authenticated'a açık:
  `revoke execute on function public.rls_auto_enable() from anon, authenticated;`

Performans:
- `auth_rls_initplan` (4 policy): policy içindeki `auth.uid()`/`current_setting()`
  çağrılarını `(select auth.uid())` ile sar (satır-başı yeniden değerlendirmeyi
  önler).
- `unused_index` (4 index): tablolar boş; kullanılmıyorsa kaldırılabilir (INFO).

**Ek — gizli mantık hatası:** `org_members_*` policy'lerinde
`me.organization_id = me.organization_id` (her zaman true) görülüyor; muhtemelen
`me.organization_id = organization_members.organization_id` olmalı. Bu tablolar
canlıya girmeden DÜZELTİLMELİ (yetki sızıntısı riski). Web sitesini etkilemez.

## D) IP ban / rate-limit / kota (sistem patlamasın)
- Uygulama rate-limit'leri zaten var: checkout 5/dk, lead 8/10dk, swarm 20/10dk,
  llm-context 5/dk (Upstash opsiyonlu, yoksa in-memory). Bunları yük testiyle
  tetikleyip kendi IP'ni banlatma.
- Supabase: ücretsiz/started planda eşzamanlı bağlantı limiti düşüktür →
  serverless'te **connection pooler** kullan (yukarıdaki uyarıyla). Çok sayıda
  cold-start aynı anda direct 5432'ye bağlanırsa bağlantı tükenir.
- Vercel Cron (`/api/cron/sync-google`, 03:00) `CRON_SECRET` ister; yoksa
  fail-closed (sistem patlamaz, sadece no-op).
- Webhook replay-koruması Upstash gerektirir; yoksa modül güvenli no-op'a düşer.

## E) Doğrulama checklist
- [ ] DATABASE_URI session/direct (DDL için) — push çalıştı mı?
- [ ] `/api/users` 500 → 200/403 (şema kuruldu)
- [ ] `/admin` → create-first-user ekranı
- [ ] Data API kapatıldı VEYA Payload tabloları RLS deny-all
- [ ] `GOOGLE_SITE_VERIFICATION` Vercel env (SEO; D bölümü local-seo dokümanı)
