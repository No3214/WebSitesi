import type { CollectionConfig } from "payload";

export const Rooms: CollectionConfig = {
  slug: "rooms",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "capacity", "view"]
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
      name: "short",
      type: "textarea",
      required: true
    },
    {
      name: "capacity",
      type: "text",
      required: true
    },
    {
      name: "size",
      type: "text",
      required: true
    },
    {
      name: "view",
      type: "text",
      required: true
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0
    },
    {
      name: "images",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true
        }
      ]
    }
  ]
};
