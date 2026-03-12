import type { CollectionConfig } from "payload";

export const OrganizationLeads: CollectionConfig = {
  slug: "organization-leads",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "type", "leadPriority", "createdAt"],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "phone", type: "text", required: true },
    { name: "normalizedPhone", type: "text", index: true, admin: { readOnly: true } },
    { name: "email", type: "email" },
    { name: "normalizedEmail", type: "email", index: true, admin: { readOnly: true } },
    { name: "eventDate", type: "text" },
    { name: "guestCount", type: "number" },
    {
      name: "estimatedBudget",
      type: "select",
      options: [
        { label: "100.000 TL altı", value: "under-100k" },
        { label: "100.000 - 250.000 TL", value: "100k-250k" },
        { label: "250.000 - 500.000 TL", value: "250k-500k" },
        { label: "500.000 TL üzeri", value: "over-500k" },
      ],
    },
    { name: "type", type: "text", required: true },
    {
      name: "leadPriority",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Normal", value: "normal" },
        { label: "High", value: "high" },
      ],
      defaultValue: "normal",
      index: true,
      admin: { readOnly: true },
    },
    { name: "leadScore", type: "number", min: 0, max: 100, admin: { readOnly: true } },
    { name: "dedupeHash", type: "text", index: true, admin: { readOnly: true } },
    { name: "message", type: "textarea", required: true },
    { name: "consent", type: "checkbox", required: true },
    { name: "source", type: "text", defaultValue: "website", index: true },
    { name: "utmSource", type: "text" },
    { name: "utmMedium", type: "text" },
    { name: "utmCampaign", type: "text" },
    { name: "referrer", type: "text" },
    { name: "ipAddress", type: "text", admin: { readOnly: true } },
    { name: "userAgent", type: "textarea", admin: { readOnly: true } },
  ],
  timestamps: true,
};
