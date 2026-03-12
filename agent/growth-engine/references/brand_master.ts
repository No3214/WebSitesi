import { rooms, Room } from '../../../src/data/rooms';

/**
 * Master Brand Data for RAG-style lookup.
 * Consolidates all hotel intelligence in one JSON.
 */
export const BRAND_MASTER = {
  name: "Kozbeyli Konağı Taş Otel & Restaurant",
  history: "Built in the 19th century, restored with original stones. Features a 180-year-old stone coffee grinder (Dibek).",
  location: {
    village: "Kozbeyli",
    town: "Foça",
    city: "İzmir",
    coordinates: "38.7431, 26.9242"
  },
  gastronomy: {
    chef: "İnci Hanım (Antakya Origin)",
    specialties: ["Sac Kavurma", "Antakya Style Lahmacun", "Hummus", "Muhammara", "Dibek Coffee"],
    breakfast: "Meşhur Kozbeyli Serpme Köy Kahvaltısı (Organic and Local)"
  },
  accommodation: {
    total_rooms: 16,
    types: rooms.map((r: Room) => ({ title: r.title, slug: r.slug, size: r.size, view: r.view }))
  },
  usp: [
    "19th Century Historical Texture",
    "Awarded Multi-Platform Gastronomy (Antakya + Aegean)",
    "Panoramic Aegean Sea View",
    "Boutique Event Capacity (up to 200)"
  ]
};
