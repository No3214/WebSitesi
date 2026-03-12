import type { CollectionConfig } from "payload";

export const WebhookEvents: CollectionConfig = {
  slug: "webhook-events",
  admin: {
    useAsTitle: "messageUid",
    defaultColumns: ["provider", "messageUid", "status", "receivedAt"],
    group: "Integrations",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "provider", type: "text", required: true },
    { name: "messageUid", type: "text", required: true, index: true },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "Received", value: "received" },
        { label: "Rejected", value: "rejected" },
        { label: "Processed", value: "processed" },
        { label: "Duplicate", value: "duplicate" },
      ],
    },
    { name: "signatureValid", type: "checkbox", defaultValue: false },
    { name: "reservationId", type: "text" },
    { name: "errorMessage", type: "textarea" },
    { name: "payloadJson", type: "json" },
    { name: "receivedAt", type: "date", required: true },
  ],
  timestamps: true,
};
