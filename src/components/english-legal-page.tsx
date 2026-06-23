import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { getLegalTurkishHref, type LegalRouteKey } from "@/lib/legal-routes";

type LegalSection = {
  title: string;
  body: string[];
  bullets?: string[];
};

type EnglishLegalPageProps = {
  title: string;
  eyebrow: string;
  intro: string;
  officialDocumentKey: LegalRouteKey;
  sections: LegalSection[];
  showCookiePreferences?: boolean;
};

export function EnglishLegalPage({
  title,
  eyebrow,
  intro,
  officialDocumentKey,
  sections,
  showCookiePreferences = false,
}: EnglishLegalPageProps) {
  return (
    <>
      <SiteHeader variant="solid" />
      <PageHero eyebrow={eyebrow} title={title} text={intro} tone="light" />

      <main className="section bg-white" style={{ paddingTop: 48 }}>
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
              This English page is provided for guest convenience. The official Turkish text
              remains the controlling document for legal interpretation.{" "}
              <Link href={getLegalTurkishHref(officialDocumentKey)} className="font-bold underline">
                Open the official Turkish text.
              </Link>
            </div>

            <div className="prose prose-zinc prose-sm sm:prose-base max-w-none leading-relaxed text-zinc-600">
              {sections.map((section) => (
                <section key={section.title} className="mb-9">
                  <h2 className="mb-4 text-zinc-900">{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            {showCookiePreferences ? (
              <div className="mt-8">
                <CookiePreferencesButton label="Open Cookie Preferences" className="button secondary sm" />
              </div>
            ) : null}
          </FadeIn>
        </div>
      </main>
    </>
  );
}
