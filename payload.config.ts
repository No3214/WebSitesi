import path from "path";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { AgentPerformanceLogs } from "./payload/collections/AgentPerformanceLogs";
import { HotelRunnerEvents } from "./payload/collections/HotelRunnerEvents";
import { Media } from "./payload/collections/Media";
import { MenuSections } from "./payload/collections/MenuSections";
import { OrganizationLeads } from "./payload/collections/OrganizationLeads";
import { OrganizationPackages } from "./payload/collections/OrganizationPackages";
import { Rooms } from "./payload/collections/Rooms";
import { Users } from "./payload/collections/Users";

const payloadSecret = process.env.PAYLOAD_SECRET;
const databaseUri = process.env.DATABASE_URI;

if (!payloadSecret) {
  throw new Error("PAYLOAD_SECRET is required. Refusing to boot with an insecure default.");
}

if (!databaseUri) {
  throw new Error("DATABASE_URI is required.");
}

export default buildConfig({
  secret: payloadSecret,
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  admin: {
    user: "users",
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
  }),
  cors: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
  collections: [
    Users,
    Media,
    Rooms,
    MenuSections,
    OrganizationPackages,
    OrganizationLeads,
    AgentPerformanceLogs,
    HotelRunnerEvents,
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
});
