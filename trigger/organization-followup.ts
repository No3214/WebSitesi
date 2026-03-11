import { task } from "@trigger.dev/sdk";

export const organizationFollowup = task({
  id: "organization-followup",
  run: async (payload: {
    name: string;
    phone: string;
    type: string;
    message: string;
  }) => {
    console.log("Yeni organizasyon talebi:", payload);

    return {
      ok: true,
      note: "Canlı kullanımda CRM, WhatsApp veya e-posta akışına bağlanır."
    };
  }
});
