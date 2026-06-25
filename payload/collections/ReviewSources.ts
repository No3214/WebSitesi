import type { CollectionConfig } from "payload";

type ReqUser = { req: { user?: { role?: string | null } | null } };
const isStaff = ({ req }: ReqUser) =>
  req.user?.role === "admin" || req.user?.role === "editor";

/**
 * review-sources — yorum kaynak tanimlari (Google, Booking, ETS Tur, first-party...).
 * displayPolicy public sayfada ne kadarinin gosterilecegini belirler.
 */
export const ReviewSources: CollectionConfig = {
  slug: "review-sources",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "displayPolicy", "isActive", "lastSyncAt"],
  },
  access: {
    read: ({ req }: ReqUser) => {
      if (req.user?.role === "admin" || req.user?.role === "editor") return true;
      return { isActive: { equals: true } };
    },
    create: isStaff,
    update: isStaff,
    delete: ({ req }: ReqUser) => req.user?.role === "admin",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "key", type: "text", required: true, unique: true, index: true },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "manual",
      options: [
        { label: "API (otomatik)", value: "api" },
        { label: "Manuel (admin girisi)", value: "manual" },
        { label: "First-party (konaklama-dogrulamali)", value: "first-party" },
      ],
    },
    { name: "sourceUrl", type: "text" },
    { name: "iconKey", type: "text" },
    { name: "isActive", type: "checkbox", defaultValue: true, index: true },
    {
      name: "displayPolicy",
      type: "select",
      required: true,
      defaultValue: "score-and-link",
      options: [
        { label: "Tam metin + puan + atif", value: "full-text" },
        { label: "Yalniz puan rozeti + kaynaga link", value: "score-and-link" },
        { label: "Yalniz puan", value: "score-only" },
      ],
    },
    { name: "lastSyncAt", type: "date", admin: { readOnly: true } },
    { name: "lastSyncStatus", type: "text", admin: { readOnly: true } },
  ],
  timestamps: true,
};
