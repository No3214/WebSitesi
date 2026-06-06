import { afterEach, describe, expect, it, vi } from "vitest";

import { describeWeather, getNextHoliday } from "../src/lib/free-apis";

/* ------------------------------ describeWeather -------------------------- */

describe("describeWeather", () => {
  it("WMO kodlarini dogru Turkce etiketlere cevirir", () => {
    expect(describeWeather(0).label).toBe("Açık");
    expect(describeWeather(2).label).toBe("Az bulutlu");
    expect(describeWeather(3).label).toBe("Parçalı bulutlu");
    expect(describeWeather(45).label).toBe("Sisli");
    expect(describeWeather(61).label).toBe("Yağmurlu");
    expect(describeWeather(75).label).toBe("Karlı");
    expect(describeWeather(81).label).toBe("Sağanak");
    expect(describeWeather(95).label).toBe("Gök gürültülü");
  });
});

/* ------------------------------ getNextHoliday --------------------------- */

/** Bugunden `days` gun sonrasinin tarihini YYYY-MM-DD olarak dondurur. */
function isoDateDaysFromNow(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Nager.Date API'sini verilen tatil listesiyle yanitlayan fetch stub'i kurar. */
function stubFetchWithHolidays(holidays: Array<{ date: string; localName: string }>) {
  const fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => holidays,
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("getNextHoliday", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("10 gun sonraki tatili daysAway=10 ve localName ile dondurur", async () => {
    const date = isoDateDaysFromNow(10);
    stubFetchWithHolidays([{ date, localName: "Test Bayramı" }]);

    const holiday = await getNextHoliday();

    expect(holiday).not.toBeNull();
    expect(holiday?.daysAway).toBe(10);
    expect(holiday?.localName).toBe("Test Bayramı");
    expect(holiday?.date).toBe(date);
  });

  it("60 gunden uzaktaki tatil icin null dondurur", async () => {
    stubFetchWithHolidays([{ date: isoDateDaysFromNow(70), localName: "Uzak Bayram" }]);

    const holiday = await getNextHoliday();

    expect(holiday).toBeNull();
  });
});
