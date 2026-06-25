import type { CollectionConfig } from "payload";

type ReqUser = { req: { user?: { role?: string | null } | null } };
const isStaff = ({ req }: ReqUser) =>
  req.user?.role === "admin" || req.user?.role === "editor";

/**
 * review-moderation-events — moderasyon denetim kaydi (audit log).
 * Hangi yorumda kim, ne zaman, hangi aksiyonu aldi. Public read YOK.
 */
export const ReviewModerationEvents: CollectionConfig = {
  slug: "review-moderation-events",
  admin: {
    useAsTitle: "action",
    defaultColumns: ["action", "reviewItem", "actor", "createdAt"],
  },
  access: {
    read: isStaff,
    create: isStaff,
    // Audit log: guncelleme/silme yalniz admin (degistirilemezlik tercih edilir).
    update: ({ req }: ReqUser) => req.user?.role === "admin",
    delete: ({ req }: ReqUser) => req.user?.role === "admin",
  },
  fields: [
    { name: "reviewItem", type: "relationship", relationTo: "review-items", required: true },
    {
      name: "action",
      type: "select",
      required: true,
      options: [
        { label: "Yayinla", value: "publish" },
        { label: "Gizle", value: "hide" },
        { label: "Isaretle", value: "flag" },
        { label: "Isaret kaldir", value: "unflag" },
        { label: "Kaynak uyusmazligi", value: "source-mismatch" },
      ],
    },
    { name: "reason", type: "text" },
    { name: "actor", type: "relationship", relationTo: "users" },
  ],
  timestamps: true,
};
