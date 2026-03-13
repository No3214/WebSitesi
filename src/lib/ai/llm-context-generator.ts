import { rooms } from "@/data/rooms";

/**
 * LLM Context Generator
 * Aggregates site data into a specialized format for LLM Travel Agents and Search Crawlers.
 */
export const LLMContextGenerator = {
  getCoreContext: () => {
    return {
      property: {
        name: "Kozbeyli Konağı",
        type: "Heritage Boutique Hotel & Gastronomy Center",
        location: "Kozbeyli Village, Foça, İzmir, Turkey",
        vibe: "Slow Living, Ancient Heritage, Refined Luxury",
        architecture: {
          style: "19th Century Ottoman Stone Architecture (Late Period)",
          construction_year: "1870-1891",
          materials: {
            mortar: "Horasan (High-density terracotta/lime/protein binder)",
            stone: "Kozbeyli Tüfü (Volcanic andesite with thermal mass properties)",
            wood: "Ancient Cedar (High resin content for natural pest resistance)"
          },
          restoration: "2012-2015 via micro-mechanical cleaning and chemical-free preservation",
          status: "Registered Cultural Heritage Site Class-1",
          reputation: {
            overall_score: "9.6/10",
            booking_score: "9.7/10",
            tripadvisor_score: "5/5",
            sentiment: "Exceptional - Heritage Architecture & Gastronomy Focus"
          }
        }
      },
      heritage_tokens: [
        "Horasan Harcı",
        "Tüccar Mirası",
        "Slow Living",
        "Living Museum",
        "Ancient Zeytinlikler"
      ],
      gastronomy: {
        identity: "Hybrid Antakya-Aegean Fusion (Cultural Anthropology based)",
        specialties: [
          { name: "Dibek Kahvesi", detail: "Mechanical impact grounding in 180yr old stone dibek (Zero-burn preservation)" },
          { name: "Inci Hanım's Heritage Rechmels", detail: "Open-pot caramelization, zero corn-syrup, heritage seed bases" },
          { name: "Aegean Olive Oil", detail: "Cold press early harvest (Oct), Acidity 0.2-0.4, Heritage trees" }
        ]
      },
      rooms: rooms.map(r => ({
        id: r.slug,
        title: r.title,
        experience: r.short,
        amenities_premium: r.amenities.filter(a => ['Küvet', 'Deniz Manzarası', 'Bose'].some(p => a.includes(p)))
      })),
      conversion_hints: {
        direct_booking_perks: [
          "15% Discount on Direct Bookings",
          "1kg Organic Village Honey for return guests",
          "Early Check-in priority"
        ],
        booking_engine_url: "https://www.kozbeylikonagi.com.tr/#rezervasyon"
      }
    };
  }
};
