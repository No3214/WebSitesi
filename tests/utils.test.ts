import { describe, expect, it } from "vitest";
import { absoluteUrl, siteUrl } from "@/lib/utils";

describe("utils", () => {
  describe("siteUrl", () => {
    it("should be defined", () => {
      expect(siteUrl).toBeDefined();
      expect(typeof siteUrl).toBe("string");
    });
  });

  describe("absoluteUrl", () => {
    it("should prepend siteUrl to path", () => {
      expect(absoluteUrl("/test")).toBe(`${siteUrl}/test`);
    });

    it("should default to / if no path is provided", () => {
      expect(absoluteUrl()).toBe(`${siteUrl}/`);
    });
  });
});
