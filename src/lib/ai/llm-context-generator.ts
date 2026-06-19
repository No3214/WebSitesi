import { rooms } from "@/data/rooms";
import { MAPS_URL, PHONE_DISPLAY, WHATSAPP_BASE } from "@/lib/contact";
import { KOZBEYLI_COORDS } from "@/lib/free-apis";

/**
 * LLM Context Generator
 * Aggregates verified site data for LLM travel agents and search crawlers.
 * Keep this conservative: do not add awards, payment promises, fixed policies or
 * historical claims unless they are backed by published source evidence.
 */
export const LLMContextGenerator = {
  getCoreContext: () => {
    return {
      property: {
        name: "Kozbeyli Konağı",
        type: "Boutique stone hotel, restaurant and private event venue",
        address: "Kozbeyli Köyü Küme Evler No:188, Foça / İzmir, Türkiye",
        coordinates: KOZBEYLI_COORDS,
        maps_url: MAPS_URL,
        positioning: [
          "Authentic Aegean hospitality in Kozbeyli village",
          "Foça stone architecture with 16 boutique rooms",
          "Room plus village breakfast concept",
          "Antakya and Aegean influenced restaurant",
          "Garden setting for weddings, engagements and private events"
        ],
        not_a: [
          "pool resort",
          "bungalow concept",
          "jacuzzi concept",
          "budget motel"
        ],
        operating_notes: {
          check_in: "14:00",
          check_out: "12:00",
          quiet_hours: "23:00-08:00",
          breakfast: "Served after the stay night; not included on arrival day",
          pets: "Small breeds with prior reservation notice"
        }
      },
      heritage_tokens: [
        "Foça taşı",
        "Kozbeyli Köyü",
        "Ege misafirperverliği",
        "Slow Living",
        "tarihi doku",
        "zeytinlikler"
      ],
      gastronomy: {
        identity: "Antakya and Aegean inspired village restaurant",
        specialties: [
          { name: "Dibek kahvesi", detail: "Kozbeyli village coffee culture" },
          { name: "Serpme kahvaltı", detail: "Local products, house-made jams, pastries, cheeses and hot options" },
          { name: "A la carte restaurant", detail: "Aperitif menu, stone oven pizza, marinated fried chicken, cocktails and wine service" }
        ]
      },
      rooms: rooms.map(r => ({
        id: r.slug,
        title: r.title,
        experience: r.short,
        capacity: r.capacity,
        size: r.size,
        view: r.view,
        amenities: r.amenities
      })),
      reservation: {
        status: "availability_confirmation_required",
        support_url: "/rezervasyon",
        live_booking_engine: "Enabled only when NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL is configured in production.",
        channels: [
          "reservation page",
          `WhatsApp: ${WHATSAPP_BASE}`,
          `phone: ${PHONE_DISPLAY}`,
          "email: info@kozbeylikonagi.com"
        ],
        payment_note:
          "Credit card or online payment should only be represented as available when the secure payment and booking channel are active in production.",
        cancellation_note:
          "Cancellation and date-change conditions depend on booking channel, selected offer, payment type, period and stay date."
      },
      evidence_boundaries: [
        "Do not claim every room has sea view.",
        "Do not publish fixed cancellation or free-cancellation promises.",
        "Do not claim live online booking or card payment completion unless production HMS/POS evidence is ready.",
        "Do not add precise historical, restoration, material, award or review-score claims without a cited source."
      ]
    };
  }
};
