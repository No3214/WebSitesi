import { CollectionConfig } from "payload";

export const AgentPerformanceLogs: CollectionConfig = {
  slug: "agent-performance-logs",
  admin: {
    useAsTitle: "agentName",
    group: "Growth",
  },
  access: {
    read: () => true,
    create: () => true, // Allow agents to create logs
  },
  fields: [
    {
      name: "agentName",
      type: "text",
      required: true,
    },
    {
      name: "actionType",
      type: "select",
      options: [
        { label: "Lead Hunt", value: "lead_hunt" },
        { label: "SEO Audit", value: "seo_audit" },
        { label: "Content Generation", value: "content_gen" },
        { label: "Sales Bridge", value: "sales_bridge" },
      ],
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Success", value: "success" },
        { label: "Warning", value: "warning" },
        { label: "Error", value: "error" },
      ],
      required: true,
    },
    {
      name: "details",
      type: "textarea",
    },
    {
      name: "impactScore",
      type: "number",
      min: 0,
      max: 100,
    },
  ],
  timestamps: true,
};
