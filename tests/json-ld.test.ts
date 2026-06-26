import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "@/lib/json-ld";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

// Tum JSON-LD enjeksiyonlarinin gectigi dosyalar (application/ld+json __html).
const JSON_LD_FILES = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/components/contact-page-content.tsx",
  "src/app/odalar/[slug]/page.tsx",
  "src/components/experiences-page-content.tsx",
  "src/app/deneyimler/kozbeyli-koyu-rehberi/page.tsx",
  "src/app/deneyimler/foca-gezi-rehberi/page.tsx",
  "src/app/deneyimler/ege-gastronomi-rotasi/page.tsx",
  "src/app/en/odalar/[slug]/page.tsx",
  "src/app/en/rooms/[slug]/page.tsx",
  "src/components/faq-page-content.tsx",
  "src/components/gallery-page-content.tsx",
  "src/components/gastronomy-page-content.tsx",
  "src/components/location-page-content.tsx",
  "src/components/reservation-page-content.tsx",
] as const;

describe("serializeJsonLd JSON-LD guvenligi", () => {
  it("</script> enjeksiyonunu kacirir ve < icin \\u003c uretir", () => {
    const out = serializeJsonLd({ a: "</script><script>alert(1)</script>" });

    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c");
  });

  it("& karakterini \\u0026 olarak kacirir", () => {
    const out = serializeJsonLd({ s: "a & b" });

    expect(out).toContain("\\u0026");
  });

  it("saf modul olarak kalir: env/security/rate-limit import etmez", () => {
    const source = read("src/lib/json-ld.ts");

    expect(source).not.toContain('from "@/lib/env"');
    expect(source).not.toContain('from "@/lib/security"');
    expect(source).not.toContain('from "@/lib/rate-limit"');
  });

  it("tum JSON-LD enjeksiyonlari serializeJsonLd kullanir, ham JSON.stringify birakmaz", () => {
    for (const file of JSON_LD_FILES) {
      const source = read(file);

      expect(source, `${file} serializeJsonLd kullanmali`).toContain("serializeJsonLd(");
      expect(source, `${file} ham __html: JSON.stringify birakmamali`).not.toContain(
        "__html: JSON.stringify(",
      );
    }
  });
});
