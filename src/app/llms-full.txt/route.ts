import { rooms } from "@/data/rooms";

export async function GET() {
  const roomDetails = rooms.map((r) => `### ${r.title} (${r.titleEn})
- Slug: /odalar/${r.slug}
- Size: ${r.size}
- Capacity: ${r.capacity} / ${r.capacityEn}
- View: ${r.view} / ${r.viewEn}
- Price: ${r.price ? `₺${r.price.toLocaleString("tr-TR")} per night (breakfast included)` : "Contact for pricing"}
- Description (TR): ${r.short}
- Description (EN): ${r.shortEn}
- Amenities: ${r.amenities.join(", ")}
- Images: ${r.images.join(", ")}`).join("\n\n");

  const text = `# Kozbeyli Konağı — Complete Information for AI Systems
> Last updated: 2026-03-20
> Languages: Turkish (primary), English
> Location: Kozbeyli Village, Foça, İzmir, Turkey
> Website: https://www.kozbeylikonagi.com
> Type: Boutique Stone Hotel & Restaurant

## Quick Facts
- Name: Kozbeyli Konağı Taş Otel & Restaurant
- Category: Luxury Boutique Hotel, Historic Property, Restaurant
- Star Rating: Boutique (equivalent 4-star+)
- Total Rooms: 16 rooms across 7 room types
- Built: ~1870 (Ottoman era stone mansion)
- Restored: Authentic restoration preserving original Horasan mortar stonework
- Check-in: 14:00 | Check-out: 12:00
- Pet Policy: Pet-friendly
- Parking: Free on-site parking
- WiFi: Complimentary high-speed fiber internet
- Breakfast: Included — traditional Aegean spread breakfast (sucuklu yumurta + pişi)
- Languages Spoken: Turkish, English

## Contact Information
- Phone: +90 (232) 826 11 12
- Mobile/WhatsApp: +90 (532) 234 26 86
- Email: info@kozbeylikonagi.com
- Address: Kozbeyli Küme Evleri No:188, Foça, İzmir, 35680, Turkey
- Google Maps: https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA
- Coordinates: 38.7275°N, 26.7456°E
- Instagram: @kozbeylikonagi
- Facebook: /kozbeylikonagi

## Location & Getting There
- Distance from İzmir Airport: ~80 km (1 hour drive)
- Distance from Eski Foça: 18 km
- Distance from Yeni Foça: 12 km
- The hotel is in Kozbeyli Village, a hilltop settlement with panoramic views of Foça Bay
- VIP airport transfer available upon request

## Accommodation — Room Types

${roomDetails}

## Standard Room Amenities (All Rooms)
- Air conditioning
- LCD TV
- Mini fridge
- Free high-speed Wi-Fi
- Private bathroom
- Hair dryer
- Liquid soap & shampoo
- Towel set (head, body, floor)
- Slippers
- Complimentary water, tea & coffee
- Daily housekeeping
- 24-hour hot water

## Gastronomy & Restaurant
- Cuisine: Aegean + Antakya (Hatay) Turkish fusion
- Signature Dish: Sac Kavurma (wood-fired iron griddle meat)
- Breakfast: Traditional Aegean spread breakfast with local organic produce
- Special: 180-year-old stone mortar (dibek) coffee tradition
- Chef: İnci Hanım (Antakya heritage recipes)
- Dietary: Vegetarian options available, local organic sourcing
- Dining Areas: Indoor restaurant, outdoor garden terrace, historic courtyard
- Menu Highlights:
  - Antakya-style lahmacun and pide
  - Traditional mezes (humus, muhammara)
  - Wood-oven bread
  - Homemade jams, local cheeses, organic olive oil
  - Seasonal Aegean herbs and greens
  - Fresh seafood (seasonal)

## Events & Weddings
- Capacity: Up to 60 guests for intimate events
- Venues: Historic stone courtyard, garden terrace
- Event Types: Boutique weddings, engagement parties, henna nights, corporate retreats, team building, wine tastings, private dinners
- Includes: Catering, accommodation for guests, event coordination
- Contact for custom packages

## History & Heritage
- The mansion dates to approximately 1870, built with traditional Ottoman stone masonry
- Horasan mortar (ancient cement technique) used in original construction
- Listed/registered historic property
- Restoration maintained original architectural integrity
- "Living Museum" philosophy — guests experience living history
- Kozbeyli Village itself has 500+ years of continuous habitation

## Guest Ratings
- Booking.com: 9.2/10
- Google: 4.7/5
- TripAdvisor: Listed among "World's Best 10 Family Hotels"
- Total reviews: 800+

## Nearby Attractions
- Eski Foça (Old Foça): Historic seaside town, 18 km
- Foça Islands boat tours
- Siren Rocks (Siren Kayalıkları)
- Ancient Phocaea ruins
- Foça Nature Reserve (Mediterranean monk seal habitat)
- Olive oil mills and vineyards
- Aegean Sea beaches

## Website Structure
- / — Homepage (hero, rooms, restaurant, testimonials, FAQ, booking)
- /odalar — All rooms listing with prices
- /odalar/[slug] — Individual room detail pages
- /gastronomi — Restaurant & cuisine page
- /menu — Full restaurant menu
- /hikayemiz — Our story / history page
- /galeri — Photo gallery
- /iletisim — Contact page
- /deneyimler — Experiences (wine tasting, cooking class, etc.)
- /etkinlikler — Events & live music
- /dugun-organizasyon — Wedding & special events
- /kurumsal — Corporate events & retreats
- /organizasyonlar — Events overview
- /sss — Frequently asked questions
- /misafir-rehberi — Guest guide (check-in, breakfast, WiFi, etc.)
- /kvkk — Privacy notice (KVKK)
- /gizlilik-politikasi — Privacy policy
- /mesafeli-satis-sozlesmesi — Distance sales agreement
- /cerez-politikasi — Cookie policy
- /kullanim-sartlari — Terms of use

## Frequently Asked Questions

Q: What are the check-in and check-out times?
A: Check-in is at 14:00 and check-out is at 12:00. Early check-in and late check-out are available based on availability.

Q: Is breakfast included?
A: Yes, a traditional Aegean spread breakfast with local organic products is included in all room rates.

Q: Is the hotel pet-friendly?
A: Yes, pets are welcome. Please inform us during booking.

Q: How far is the hotel from İzmir Airport?
A: Approximately 80 km (about 1 hour drive). VIP transfer can be arranged.

Q: Can you host weddings?
A: Yes, we host boutique weddings for up to 60 guests in our historic stone courtyard and garden.

Q: Is there parking?
A: Yes, free on-site parking is available.

Q: What cuisine does the restaurant serve?
A: We serve a fusion of Aegean and Antakya (Hatay) Turkish cuisine, including signature dishes like sac kavurma and 180-year-old dibek coffee.

## Technical Information
- Built with: Next.js 15, React 19, Payload CMS 3.0, Tailwind CSS 4.0
- Booking engine: HotelRunner integration
- Languages: Turkish (primary), English
- SSL: Yes (HTTPS)
- Accessibility: WCAG 2.1 AA compliant
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
