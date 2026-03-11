import type { CollectionConfig } from "payload";

export const MenuSections: CollectionConfig = {
  slug: "menu-sections",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "order"]
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true
    },
    {
      name: "description",
      type: "textarea"
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0
    },
    {
      name: "items",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true
        },
        {
          name: "description",
          type: "textarea"
        },
        {
          name: "priceLabel",
          type: "text"
        }
      ]
    }
  ]
};
