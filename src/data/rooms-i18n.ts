import type { Room } from "@/data/rooms";

export type RoomLocale = "tr" | "en";

type LocalizedRoomCopy = Pick<
  Room,
  "title" | "short" | "description" | "capacity" | "view" | "amenities"
>;

const englishRoomCopy: Record<string, LocalizedRoomCopy> = {
  "standart-bahce-manzarali-oda": {
    title: "Standard Garden View Room",
    short: "A calm 24 m² room overlooking the inner garden.",
    description:
      "Set beside the inner courtyard, this room pairs the mansion's stone character with a quiet, compact layout for two. It is suited to guests who value direct courtyard access and an unhurried stay in Kozbeyli.",
    capacity: "2 Adults",
    view: "Inner Garden",
    amenities: ["Garden View", "Air Conditioning", "TV", "Wi-Fi", "Private Bathroom"],
  },
  "standart-deniz-manzarali-oda": {
    title: "Standard Sea View Room",
    short: "A 24 m² room with views across the Aegean Sea.",
    description:
      "This sea-facing room combines a private 24 m² layout with views across the Aegean. Stone surfaces, practical modern amenities and a calm atmosphere make it a considered choice for couples visiting Foça and Kozbeyli.",
    capacity: "2 Adults",
    view: "Aegean Sea",
    amenities: ["Sea View", "Air Conditioning", "TV", "Wi-Fi", "Private Bathroom"],
  },
  "uc-kisilik-oda": {
    title: "Triple Room",
    short: "A spacious 28 m² room arranged for up to three adults.",
    description:
      "Designed for small families or friends travelling together, the Triple Room offers a generous 28 m² layout, high ceilings and the natural character of the mansion's stone architecture.",
    capacity: "3 Adults",
    view: "Village and Nature",
    amenities: ["Double and Single Beds", "Air Conditioning", "TV", "Wi-Fi", "Minibar"],
  },
  "4-kisilik-aile-odasi": {
    title: "Family Room for Four",
    short: "A 45 m² stone suite designed for families and longer stays.",
    description:
      "With two distinct living zones across 45 m², this family room balances shared time with added privacy. Flexible bedding, a comfortable seating area and easy access to the courtyard and restaurant support relaxed family stays.",
    capacity: "4–5 Guests",
    view: "Garden and Courtyard",
    amenities: ["Generous Living Area", "Baby Cot on Request", "Private Bathroom", "Air Conditioning", "Smart TV"],
  },
  "4-kisilik-aile-odasi-balkonlu": {
    title: "Family Room with Balcony",
    short: "A generous 50 m² family room with a private balcony.",
    description:
      "The mansion's largest room category offers 50 m² of living space and a private balcony for quiet mornings and evenings in Kozbeyli. A spacious bathroom, seating corner and flexible family layout complete the stay.",
    capacity: "4–5 Guests",
    view: "Garden and Village",
    amenities: ["Private Balcony", "Generous Living Area", "Baby Cot on Request", "Air Conditioning", "Smart TV"],
  },
  "superior-2-kisilik-oda": {
    title: "Superior Room for Two",
    short: "A 40 m² room with a bathtub and panoramic sea views.",
    description:
      "Created for couples and special stays, this 40 m² room brings panoramic Aegean views together with a bathtub, a generous layout and a more elevated set of in-room amenities.",
    capacity: "2 Adults",
    view: "Panoramic Sea",
    amenities: ["Bathtub and Shower", "Sea View", "Premium Bathroom Amenities", "Bose Sound System", "Nespresso Machine"],
  },
  "superior-3-kisilik-oda": {
    title: "Superior Room for Three",
    short: "A 42 m² sea-view room with a bathtub for up to three adults.",
    description:
      "This 42 m² room is arranged for three adults and combines panoramic sea views with a bathtub, generous proportions and the tactile character of the historic stone mansion.",
    capacity: "3 Adults",
    view: "Panoramic Sea",
    amenities: ["Bathtub and Shower", "Three-Person Bedding", "Sea View", "Premium Bathroom Amenities", "Nespresso Machine"],
  },
};

export function localizeRoom(room: Room, locale: RoomLocale): Room {
  if (locale === "tr") return room;

  const translation = englishRoomCopy[room.slug];
  return translation ? { ...room, ...translation } : room;
}

export function localizeRooms(roomList: Room[], locale: RoomLocale): Room[] {
  return roomList.map((room) => localizeRoom(room, locale));
}
