-- =============================================================================
-- Supabase RLS sertlestirme — Payload "payload" semasi (deny-all)
-- =============================================================================
-- Bu dosya, Supabase'e UYGULANMIS guvenlik durumunun repo icindeki kayitidir
-- (IaC/denetim icin). Migration Supabase uzerinde apply_migration ile
-- "payload_schema_rls_deny_all" adiyla uygulandi. Idempotenttir.
--
-- NEDEN: payload semasindaki 21 tablo RLS kapaliydi (Supabase advisor: CRITICAL
-- "rls_disabled" — anon/authenticated rollerine acik). Payload bu tablolara
-- "postgres" rolu (pooler kullanicisi postgres.<ref>) ile baglanir.
--
-- GUVENLI OLDUGUNUN KANITI (pg_roles):
--   postgres      rolbypassrls = true   -> Payload baglantisi RLS'i BYPASS eder
--   service_role  rolbypassrls = true   -> sunucu tarafi erisim BYPASS eder
--   anon          rolbypassrls = false  -> RLS'e TABI (deny-all)
--   authenticated rolbypassrls = false  -> RLS'e TABI (deny-all)
-- Tablolarin sahibi (owner) = postgres. Owner + BYPASSRLS roller RLS'ten muaftir;
-- FORCE ROW LEVEL SECURITY KULLANILMADI -> Payload kesinlikle kirilmaz.
--
-- SONUC: RLS acik + policy yok => anon/authenticated hicbir satir goremez;
-- postgres (Payload) ve service_role tam erisimi korur. Advisor'daki CRITICAL
-- uyari giderildi; geriye kalan "rls_enabled_no_policy" yalniz INFO seviyesindedir
-- ve bu deny-all tasariminin beklenen halidir (kasitli policy-suzluk).
-- =============================================================================

alter table payload.users                          enable row level security;
alter table payload.users_sessions                 enable row level security;
alter table payload.media                          enable row level security;
alter table payload.rooms                          enable row level security;
alter table payload.rooms_images                   enable row level security;
alter table payload.menu_sections                  enable row level security;
alter table payload.menu_sections_items            enable row level security;
alter table payload.organization_packages          enable row level security;
alter table payload.organization_leads             enable row level security;
alter table payload.agent_performance_logs         enable row level security;
alter table payload.webhook_events                 enable row level security;
alter table payload.review_sources                 enable row level security;
alter table payload.review_items                   enable row level security;
alter table payload.review_publication_rules       enable row level security;
alter table payload.review_moderation_events       enable row level security;
alter table payload.payload_kv                     enable row level security;
alter table payload.payload_locked_documents       enable row level security;
alter table payload.payload_locked_documents_rels  enable row level security;
alter table payload.payload_preferences            enable row level security;
alter table payload.payload_preferences_rels       enable row level security;
alter table payload.payload_migrations             enable row level security;

-- Savunma derinligi: Supabase API rollerinden tum dogrudan ayricaliklari geri al.
revoke all   on all tables    in schema payload from anon, authenticated;
revoke all   on all sequences in schema payload from anon, authenticated;
revoke all   on all functions in schema payload from anon, authenticated;
revoke usage on schema payload                  from anon, authenticated;
