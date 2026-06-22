import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { describeWeather } from "@/lib/free-apis";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

describe("local pulse localization", () => {
  it("localizes weather code labels for Turkish and English surfaces", () => {
    expect(describeWeather(0, "tr")).toMatchObject({ label: "Açık", icon: "☀️" });
    expect(describeWeather(0, "en")).toMatchObject({ label: "Clear", icon: "☀️" });
    expect(describeWeather(63, "en").label).toBe("Rainy");
    expect(describeWeather(95, "en").label).toBe("Thunderstorms");
  });

  it("keeps WeatherRibbon locale wired into public English booking and room surfaces", () => {
    const weatherRibbon = read("src/components/weather-ribbon.tsx");
    const roomDetail = read("src/components/room-detail-client.tsx");
    const bookingSection = read("src/components/home/booking-section.tsx");
    const reservationClient = read("src/components/reservation-client.tsx");

    expect(weatherRibbon).toContain('locale?: "tr" | "en"');
    expect(weatherRibbon).toContain("Current weather in Kozbeyli");
    expect(weatherRibbon).toContain("Weekend forecast");
    expect(weatherRibbon).toContain("Public holiday in");
    expect(roomDetail).toContain("<WeatherRibbon locale={locale} />");
    expect(bookingSection).toContain("<WeatherRibbon locale={locale} />");
    expect(reservationClient).toContain("<WeatherRibbon locale={locale} />");
  });
});
