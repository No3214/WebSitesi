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
    },
    // Supabase/Postgres şema yönetimi.
    // ÖNEMLİ (Payload kaynak davranışı): otomatik `push` YALNIZ
    // NODE_ENV !== "production" iken çalışır → prod'da `push: true` NO-OP'tur.
    // Prod şeması MIGRATION ile kurulur (dev'de push açık, yerel kolaylık).
    // Prod kurulumu (tek seferlik, DATABASE_URI prod'a bakarken):
    //   npm run migrate:create -- initial   # payload/migrations üretir
    //   npm run migrate                      # prod DB'ye uygular
    // Sürekli otomatik: Vercel "Build Command" = `npm run ci`
    //   (önce payload migrate, sonra next build). Detay: docs/supabase-vercel-setup.md.
    // Bağlantı: DDL/migration için Supabase "Session"/"Direct" string kullan;
    // "Transaction pooler" (6543) DDL/prepared-statement'ı kısıtlar.
    push: true,
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
