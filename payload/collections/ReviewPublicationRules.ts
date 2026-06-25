import type { CollectionConfig } from "payload";

type ReqUser = { req: { user?: { role?: string | null } | null } };
const isStaff = ({ req }: ReqUser) =>
  req.user?.role === "admin" || req.user?.role === "editor";

/**
 * review-publication-rules — yorum yayin kurallari (eşik, manuel inceleme, etiket).
 * Tipik olarak tek kayit kullanilir; public read yok (yalniz staff).
 */
export const ReviewPublicationRules: CollectionConfig = {
  slug: "review-publication-rules",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "autoPublishThreshold", "requireManualReview"],
  },
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: ({ req }: ReqUser) => req.user?.role === "admin",
  },
  fields: [
    { name: "label", type: "text", defaultValue: "Varsayilan yayin kurali" },
    {
      name: "autoPublishThreshold",
      type: "number",
      min: 1,
      max: 5,
      defaultValue: 4,
      admin: { description: "Bu puan ve uzeri yorumlar otomatik yayinlanabilir." },
    },
    { name: "requireManualReview", type: "checkbox", defaultValue: true },
    { name: "featuredLabelText", type: "text", defaultValue: "Öne çıkan yorumlar" },
  ],
  timestamps: true,
};
