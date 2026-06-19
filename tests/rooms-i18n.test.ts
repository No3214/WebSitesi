import { describe, expect, it } from "vitest";

import { rooms } from "../src/data/rooms";
import { localizeRoom, localizeRooms } from "../src/data/rooms-i18n";

describe("room localization", () => {
  it("keeps the Turkish source unchanged", () => {
    const source = rooms[0];

    expect(localizeRoom(source, "tr")).toBe(source);
  });

  it("localizes every public room while preserving operational fields", () => {
    const localized = localizeRooms(rooms, "en");

    expect(localized).toHaveLength(rooms.length);

    localized.forEach((room, index) => {
      expect(room.slug).toBe(rooms[index].slug);
      expect(room.size).toBe(rooms[index].size);
      expect(room.images).toEqual(rooms[index].images);
      expect(room.title).not.toBe(rooms[index].title);
      expect(room.short.length).toBeGreaterThan(20);
      expect(room.description.length).toBeGreaterThan(40);
    });
  });

  it("uses corrected Superior naming and clean single-language descriptions", () => {
    const superiorTwo = rooms.find((room) => room.slug === "superior-2-kisilik-oda");
    const superiorThree = rooms.find((room) => room.slug === "superior-3-kisilik-oda");

    expect(superiorTwo?.title).toBe("Superior 2 Kişilik Oda");
    expect(superiorThree?.title).toBe("Superior 3 Kişilik Oda");
    expect(superiorThree?.description).not.toContain(" / ");

    expect(superiorTwo ? localizeRoom(superiorTwo, "en").title : "").toBe("Superior Room for Two");
    expect(superiorThree ? localizeRoom(superiorThree, "en").title : "").toBe("Superior Room for Three");
  });
});
