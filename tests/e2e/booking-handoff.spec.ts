import { expect, test } from "@playwright/test";

const HMS_BOOKING_URL =
  "https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine";
const HMS_HOST = "kozbeyli-konagi.hmshotel.net";

type LinkSnapshot = {
  text: string;
  href: string;
  target: string;
  rel: string;
};

const publicHandoffRoutes = [
  "/",
  "/en",
  "/odalar",
  "/en/rooms",
  "/rezervasyon",
  "/en/booking",
  "/odalar/standart-bahce-manzarali-oda",
  "/en/rooms/uc-kisilik-oda",
];

function expectApprovedHmsLink(link: LinkSnapshot, context: string) {
  const url = new URL(link.href);

  expect(url.protocol, `${context} should use HTTPS`).toBe("https:");
  expect(url.hostname, `${context} should use the approved Kozbeyli HMS host`).toBe(HMS_HOST);
  expect(url.searchParams.get("utm_source"), `${context} should preserve website attribution`).toBe(
    "website",
  );
  expect(url.searchParams.get("utm_medium"), `${context} should preserve booking attribution`).toBe(
    "booking_engine",
  );
  expect(link.href, `${context} must not point to the old HotelRunner/Soleil host`).not.toContain(
    "soleil-mansion.hotelrunner.com",
  );
  expect(link.target, `${context} should open outside the site shell`).toBe("_blank");
  expect(link.rel, `${context} should isolate the new tab`).toContain("noopener");
  expect(link.rel, `${context} should avoid leaking referrer control to the opened tab`).toContain(
    "noreferrer",
  );
}

test.describe("Booking handoff contract", () => {
  test.describe.configure({ timeout: 120000 });

  for (const route of publicHandoffRoutes) {
    test(`${route} booking CTAs use the approved HMS new-tab target`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "load" });

      expect(response?.status(), `${route} should return usable HTML`).toBeLessThan(400);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });

      const links = await page.locator('a[data-event="booking_engine_open"]').evaluateAll((anchors) =>
        anchors.map((anchor) => {
          const link = anchor as HTMLAnchorElement;
          return {
            text: link.innerText.trim(),
            href: link.href,
            target: link.target,
            rel: link.rel,
          };
        }),
      );

      expect(links.length, `${route} should expose at least one booking-engine CTA`).toBeGreaterThan(
        0,
      );

      for (const link of links) {
        expectApprovedHmsLink(link, `${route} ${link.text || link.href}`);
      }
    });
  }

  test("mobile bottom booking action is visible and opens the official HMS engine", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto("/", { waitUntil: "load" });

    expect(response?.status(), "/ should return usable HTML").toBeLessThan(400);

    const mobileBooking = page
      .getByTestId("mobile-action-bar")
      .getByRole("link", { name: /Rezervasyon/i });

    await expect(mobileBooking).toBeVisible();
    await expect(mobileBooking).toHaveAttribute("href", HMS_BOOKING_URL);
    await expect(mobileBooking).toHaveAttribute("target", "_blank");
    await expect(mobileBooking).toHaveAttribute("rel", /noopener/);
    await expect(mobileBooking).toHaveAttribute("rel", /noreferrer/);
  });

  test("room-context handoff forwards the selected room slug without changing host", async ({ page }) => {
    const roomSlug = "standart-bahce-manzarali-oda";
    const response = await page.goto(`/odalar/${roomSlug}`, { waitUntil: "load" });

    expect(response?.status(), "room detail should return usable HTML").toBeLessThan(400);

    const roomBookingHref = await page
      .locator(`a[data-event="booking_engine_open"][href*="room=${roomSlug}"]`)
      .first()
      .getAttribute("href");

    expect(roomBookingHref, "room CTA should include the selected room slug").toBeTruthy();

    const url = new URL(roomBookingHref!);
    expect(url.hostname).toBe(HMS_HOST);
    expect(url.searchParams.get("room")).toBe(roomSlug);
    expect(url.searchParams.get("utm_source")).toBe("website");
    expect(url.searchParams.get("utm_medium")).toBe("booking_engine");
  });

  test("reservation pages stay as handoff surfaces, not cramped embedded booking forms", async ({ page }) => {
    for (const route of ["/rezervasyon", "/en/booking"]) {
      const response = await page.goto(route, { waitUntil: "load" });
      const main = page.locator("main");

      expect(response?.status(), `${route} should return usable HTML`).toBeLessThan(400);
      await expect(main.getByRole("link", { name: /Rezervasyon|Booking/ })).toHaveAttribute(
        "href",
        HMS_BOOKING_URL,
      );
      await expect(main.locator("iframe")).toHaveCount(0);
      await expect(main.getByLabel(/Check-in|Giriş/i)).toHaveCount(0);
      await expect(main.getByRole("button", { name: /List Rooms|Odaları Listele/i })).toHaveCount(0);
    }
  });
});
