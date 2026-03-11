import type { CollectionConfig } from "payload";

export const OrganizationLeads: CollectionConfig = {
  slug: "organization-leads",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "type", "createdAt"]
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user)
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true
    },
    {
      name: "phone",
      type: "text",
      required: true
    },
    {
      name: "email",
      type: "email"
    },
    {
      name: "eventDate",
      type: "text"
    },
    {
      name: "type",
      type: "text",
      required: true
    },
    {
      name: "message",
      type: "textarea",
      required: true
    },
    {
      name: "source",
      type: "text",
      defaultValue: "website"
    }
  ]
};
