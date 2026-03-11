import path from "path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Rooms } from "./payload/collections/Rooms";
import { MenuSections } from "./payload/collections/MenuSections";
import { OrganizationPackages } from "./payload/collections/OrganizationPackages";
import { OrganizationLeads } from "./payload/collections/OrganizationLeads";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "change-me",
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  admin: {
    user: "users"
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI
    }
  }),
  cors: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
  collections: [
    Users,
    Media,
    Rooms,
    MenuSections,
    OrganizationPackages,
    OrganizationLeads
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts")
  }
});
