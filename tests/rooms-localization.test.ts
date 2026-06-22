import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getLocalizedRoom, getLocalizedRooms, rooms } from "@/data/rooms";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

const turkishRoomCopyPatterns = [
  /Yetişkin/i,
  /Kişi/i,
  /Kişilik/i,
  /Bahçe/i,
  /Köy/i,
  /Manzarası/i,
  /Özel Banyo/i,
  /Klima/i,
  /Bebek Yatağı/i,
  /Küvet/i,
  /Buklet/i,
];

describe("room localization", () => {
  it("keeps every public room backed by English display copy", () => {
    const englishRooms = getLocalizedRooms("en");

    expect(englishRooms).toHaveLength(rooms.length);

    for (const room of rooms) {
      expect(room.translations?.en, `${room.slug} should have English room copy`).toBeDefined();
    }
  });

  it("keeps English room cards and details free from Turkish display tokens", () => {
    for (const room of getLocalizedRooms("en")) {
      const displayCopy = [
        room.title,
        room.short,
        room.description,
        room.capacity,
        room.view,
        ...room.amenities,
      ].join("\n");

      for (const pattern of turkishRoomCopyPatterns) {
        expect(displayCopy, `${room.slug} should not match ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("does not mutate the canonical Turkish room catalog when localizing", () => {
    const turkishRoom = rooms.find((room) => room.slug === "uc-kisilik-oda");
    expect(turkishRoom?.title).toBe("Üç Kişilik Oda");

    const englishRoom = turkishRoom ? getLocalizedRoom(turkishRoom, "en") : undefined;
    expect(englishRoom?.title).toBe("Triple Room");
    expect(turkishRoom?.title).toBe("Üç Kişilik Oda");
  });

  it("renders reservation selection and fallback wizard rooms from localized room data", () => {
    const reservationPage = read("src/components/reservation-page-content.tsx");
    const roomsStep = read("src/components/payment-wizard/steps/rooms-step.tsx");

    expect(reservationPage).toContain("getLocalizedRoom(selectedBaseRoom, locale)");
    expect(reservationPage).not.toContain("roomTitle={rooms.find");
    expect(roomsStep).toContain("getLocalizedRooms(locale)");
    expect(roomsStep).not.toContain("rooms.map((room)");
  });
});
