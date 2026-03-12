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
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
});
