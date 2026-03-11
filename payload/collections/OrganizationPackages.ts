import type { CollectionConfig } from "payload";

export const OrganizationPackages: CollectionConfig = {
  slug: "organization-packages",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "order"]
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Düğün", value: "dugun" },
        { label: "Nişan / Söz", value: "nisan" },
        { label: "Kurumsal", value: "kurumsal" },
        { label: "Özel Kutlama", value: "ozel-kutlama" }
      ]
    },
    {
      name: "short",
      type: "textarea",
      required: true
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0
    }
  ]
};
