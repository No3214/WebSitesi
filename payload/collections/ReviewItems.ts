import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";

import { maskAuthor } from "@/lib/reviews/normalize";
import { sanitizeReviewBody } from "@/lib/reviews/sanitize";

type ReqUser = { req: { user?: { role?: string | null } | null } };
const isStaff = ({ req }: ReqUser) =>
  req.user?.role === "admin" || req.user?.role === "editor";

/**
 * review-items — normalize edilmis tekil yorumlar.
 * beforeChange: reviewBody sanitize + authorDisplay maskele (KVKK).
 * afterChange: revalidateTag("reviews") → public widget cache'i tazelenir.
 * Public read: yalniz status === "published".
 */
export const ReviewItems: CollectionConfig = {
  slug: "review-items",
  admin: {
    useAsTitle: "authorDisplay",
    defaultColumns: ["authorDisplay", "rating", "source", "status", "datePublished"],
  },
  access: {
    read: ({ req }: ReqUser) => {
      if (req.user?.role === "admin" || req.user?.role === "editor") return true;
      return { status: { equals: "published" } };
    },
    create: isStaff,
    update: isStaff,
    delete: ({ req }: ReqUser) => req.user?.role === "admin",
  },
  fields: [
    { name: "source", type: "relationship", relationTo: "review-sources", required: true },
    { name: "externalId", type: "text", index: true },
    { name: "rating", type: "number", required: true, min: 1, max: 5 },
    { name: "reviewBody", type: "textarea" },
    { name: "authorDisplay", type: "text" },
    { name: "datePublished", type: "date" },
    { name: "lang", type: "text", defaultValue: "tr" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: [
        { label: "Beklemede", value: "pending" },
        { label: "Yayinda", value: "published" },
        { label: "Gizli", value: "hidden" },
        { label: "Isaretli", value: "flagged" },
      ],
    },
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "pulledAt", type: "date", admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data;
        if (typeof data.reviewBody === "string") {
          data.reviewBody = sanitizeReviewBody(data.reviewBody);
        }
        if (typeof data.authorDisplay === "string") {
          data.authorDisplay = maskAuthor(data.authorDisplay);
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        // Yayin durumu degisince public review cache'ini tazele.
        if (!previousDoc || doc?.status !== previousDoc?.status) {
          revalidateTag("reviews");
        }
        return doc;
      },
    ],
  },
  timestamps: true,
};
