"use client";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text?: string;
  tone?: "dark" | "light";
};

/**
 * İç sayfalar için ortak sinematik giriş bandı.
 * Varsayılan açık taş/ivory zemin oda kataloğuyla aynı okuma ritmini korur.
 * Gerçekten sinematik koyu giriş gereken özel durumlarda `dark` tonu verilir.
 */
export function PageHero({ eyebrow, title, text, tone = "light" }: PageHeroProps) {
  return (
    <section className={`page-hero ${tone === "light" ? "page-hero-light" : "section-dark"} grain`}>
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <span className="eyebrow">
          {eyebrow}
        </span>
        <h1>{title}</h1>
        {text ? (
          <p>{text}</p>
        ) : null}
      </div>
    </section>
  );
}
