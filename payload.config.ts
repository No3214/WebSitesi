import path from "path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { env, getAllowedOrigins } from "@/lib/env";
import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Rooms } from "./payload/collections/Rooms";
import { MenuSections } from "./payload/collections/MenuSections";
import { OrganizationPackages } from "./payload/collections/OrganizationPackages";
import { OrganizationLeads } from "./payload/collections/OrganizationLeads";
import { AgentPerformanceLogs } from "./payload/collections/AgentPerformanceLogs";
import { WebhookEvents } from "./payload/collections/WebhookEvents";
import { ReviewSources } from "./payload/collections/ReviewSources";
import { ReviewItems } from "./payload/collections/ReviewItems";
import { ReviewPublicationRules } from "./payload/collections/ReviewPublicationRules";
import { ReviewModerationEvents } from "./payload/collections/ReviewModerationEvents";

export default buildConfig({
  secret: env.PAYLOAD_SECRET,
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  admin: {
    user: "users",
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URI,
      // Supabase "Enforce SSL" açık → uzak (pooler/supabase) host'ta SSL zorunlu;
      // localhost dev'de kapalı kalır. rejectUnauthorized:false → Supabase
      // sertifikasını kabul eder (pg + Supabase standart kalıbı).
      ...(/supabase\.(co|com)|pooler\./i.test(env.DATABASE_URI)
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    },
    // Payload tablolari ayri "payload" şemasinda (public yan-tablolar korunur).
    schemaName: "payload",
    // ŞEMA PUSH GÜVENLİĞİ — KRİTİK (asla uzak/Supabase'e push etme):
    // `push`, drizzle ile tablolari model'e eslestirir; UZAK semaya calistiginda
    // tablolari DROP/RECREATE edip TÜM VERİYİ (admin hesabi dahil) ve el ile uygulanan
    // RLS'i SİLER. Bu yuzden push YALNIZ yerel (localhost) DB'de aciktir. Vercel build'i
    // Supabase pooler host'una baglandigindan push otomatik KAPALI kalir — db-push.ts
    // NODE_ENV=development'a zorlasa BİLE bu host kapisini gecemez. Uzak sema degisikligi
    // icin GÜVENLİ yol Payload migration'dur (push DEĞİL).
    push: /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(env.DATABASE_URI),
    migrationDir: path.resolve(process.cwd(), "payload/migrations"),
  }),
  cors: getAllowedOrigins(),
  csrf: getAllowedOrigins(),
  collections: [
    Users,
    Media,
    Rooms,
    MenuSections,
    OrganizationPackages,
    OrganizationLeads,
    AgentPerformanceLogs,
    WebhookEvents,
    ReviewSources,
    ReviewItems,
    ReviewPublicationRules,
    ReviewModerationEvents,
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
});
