import type { MenuSection } from "@/data/menu";

type MenuBookProps = {
  sections: MenuSection[];
  title: string;
  subtitle: string;
  note: string;
  signature: string;
  ctaTitle: string;
  ctaText: string;
  ctaHref: string;
  ctaLabel: string;
  featuredLabel: string;
  bundleLabel: string;
  allergenNotes: string[];
};

const featuredSectionTitles = new Set([
  "Kahvaltı",
  "Mezeler",
  "Ara Sıcaklar & Başlangıçlar",
  "Napoliten Pizza & Sandviç",
  "Ana Yemekler",
  "Tatlılar",
  "Breakfast",
  "Mezes",
  "Warm Starters & Appetizers",
  "Neapolitan Pizza & Sandwich",
  "Main Courses",
  "Desserts",
]);

const bundleNames = new Set([
  "Beyaz Şarap Tadımı",
  "Kırmızı Şarap Tadımı",
  "Tatlı & Kahve Keyfi",
  "White Wine Tasting",
  "Red Wine Tasting",
  "Dessert & Coffee Ritual",
]);

const noteNames = new Set([
  "Tek Porsiyon Mezeler",
  "Pizza Ekstraları",
  "İthal Şarap Seçkisi",
  "Imported Wine Selection",
]);

const wineSectionTitles = new Set(["Şaraplar", "Wines"]);

function priceLabel(price?: string) {
  return price?.replaceAll(" TL", "");
}

export function MenuBook({
  sections,
  title,
  subtitle,
  note,
  signature,
  ctaTitle,
  ctaText,
  ctaHref,
  ctaLabel,
  featuredLabel,
  bundleLabel,
  allergenNotes,
}: MenuBookProps) {
  return (
    <main className="menu-book-shell">
      <div className="menu-book">
        <header className="menu-book-header">
          <span className="menu-book-logo" aria-hidden="true" />
          <h1>{title}</h1>
          <p className="menu-book-subtitle">{subtitle}</p>
          <div className="menu-book-note">
            <p>{note}</p>
            <p className="menu-book-signature">{signature}</p>
          </div>
        </header>

        <div className="menu-book-allergens">
          {allergenNotes.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        {sections.map((section) => {
          const [firstItem, ...restItems] = section.items;
          const hasFeatured = firstItem && featuredSectionTitles.has(section.title);
          const visibleItems = hasFeatured ? restItems : section.items;
          const isWineSection = wineSectionTitles.has(section.title);

          return (
            <section className="menu-book-category" key={section.title}>
              <div className="menu-book-category-header">
                <h2>{section.title}</h2>
                {section.note ? <p>{section.note}</p> : null}
                <span aria-hidden="true" />
              </div>

              {hasFeatured ? (
                <article className="menu-book-featured">
                  <div className="menu-book-featured-kicker">{featuredLabel}</div>
                  <div className="menu-book-featured-line">
                    <h3>{firstItem.name}</h3>
                    {firstItem.price ? <strong>{priceLabel(firstItem.price)}</strong> : null}
                  </div>
                  {firstItem.description ? <p>{firstItem.description}</p> : null}
                </article>
              ) : null}

              <div className="menu-book-items">
                {visibleItems.map((item) => {
                  if (bundleNames.has(item.name)) {
                    return (
                      <article className="menu-book-bundle" key={item.name}>
                        <span>{bundleLabel}</span>
                        <h3>{item.name}</h3>
                        {item.price ? <strong>{priceLabel(item.price)}</strong> : null}
                        {item.description ? <p>{item.description}</p> : null}
                      </article>
                    );
                  }

                  if (noteNames.has(item.name)) {
                    return (
                      <article className="menu-book-note-card" key={item.name}>
                        <h3>{item.name}</h3>
                        {item.price ? <strong>{priceLabel(item.price)}</strong> : null}
                        {item.description ? <p>{item.description}</p> : null}
                      </article>
                    );
                  }

                  if (isWineSection) {
                    return (
                      <article className="menu-book-wine" key={item.name}>
                        <h3>{item.name}</h3>
                        {item.description ? <p>{item.description}</p> : null}
                        {item.price ? <strong>{priceLabel(item.price)}</strong> : null}
                      </article>
                    );
                  }

                  return (
                    <article className="menu-book-item" key={item.name}>
                      <div>
                        <h3>{item.name}</h3>
                        {item.description ? <p>{item.description}</p> : null}
                      </div>
                      {item.price ? <strong>{priceLabel(item.price)}</strong> : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="menu-book-footer">
          <h2>{ctaTitle}</h2>
          <p>{ctaText}</p>
          <a href={ctaHref}>{ctaLabel}</a>
        </section>
      </div>
    </main>
  );
}
