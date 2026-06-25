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
    // Prod DB'de Payload tabloları yoktu (yeni kurulum) → admin /api/users 500
    // veriyordu. `push` açık: ilk boot'ta tüm collection tabloları otomatik
    // oluşturulur/senkronlanır. DB'de Payload verisi olmadığı için bu güvenlidir.
    // İçerik girdikten sonra migration disiplinine geçmek için payload/migrations
    // + `payload migrate` kullanılabilir (migrationDir hazır).
    // ÖNEMLİ: DDL push, Supabase "Session"/"Direct" connection string ile çalışır;
    // "Transaction pooler" (6543) prepared-statement/DDL'i kısıtlayabilir.
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
