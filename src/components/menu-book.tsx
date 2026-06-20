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
  indexLabel: string;
  itemCountLabel: string;
  signalLanguage: "tr" | "en";
};

type MenuItemSignal = {
  tags?: string[];
  pairing?: string;
};

type LocalizedMenuItemSignal = Partial<Record<MenuBookProps["signalLanguage"], MenuItemSignal>>;

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

function sectionId(title: string) {
  return title
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const itemSignals = new Map<string, LocalizedMenuItemSignal>([
  ["Gurme Serpme Kahvaltı (kişi başı)", { tr: { tags: ["İmza", "Paylaşım"] } }],
  [
    "Konağın Meze Tabağı (2 kişilik - 5 çeşit)",
    {
      tr: {
        tags: ["Şarap Eşleşmesi", "Paylaşım"],
        pairing: "Öneri: Paşaeli SYS veya CSKS",
      },
    },
  ],
  [
    "Somon Havyarı",
    {
      tr: {
        tags: ["Şef Önerisi"],
        pairing: "Öneri: Bir Varmış Bir Yokmuş Chardonnay",
      },
    },
  ],
  ["Hatay Usulü Kızarmış Peynir", { tr: { tags: ["Antakya Klasiği"] } }],
  ["Köy Usulü Konak Pizza", { tr: { tags: ["Taş Fırın"], pairing: "Öneri: Paşaeli CSKS" } }],
  ["Dallas Steak", { tr: { tags: ["Konağın Prestiji"], pairing: "Öneri: Paşaeli CSKS" } }],
  ["Antep Fıstıklı Katmer", { tr: { tags: ["Tatlı Kapanış"], pairing: "Öneri: Morso di Sole" } }],
  [
    "Antakya Künefe",
    {
      tr: { tags: ["Antakya Klasiği"], pairing: "Öneri: Morso di Sole" },
      en: { tags: ["Antakya Classic"], pairing: "Pairing: Morso di Sole" },
    },
  ],
  [
    "Paşaeli SYS",
    {
      tr: { tags: ["Beyaz Eşleşme"], pairing: "Meze, başlangıç, peynir ve pizza eşleşmesi" },
      en: { tags: ["White Pairing"], pairing: "Meze, starter, cheese and pizza pairing" },
    },
  ],
  [
    "Bir Varmış Bir Yokmuş Chardonnay",
    {
      tr: { tags: ["Beyaz Eşleşme"], pairing: "Somon havyarı ve mantar eşleşmesi" },
      en: { tags: ["White Pairing"], pairing: "Salmon roe and mushroom pairing" },
    },
  ],
  [
    "Paşaeli CSKS",
    {
      tr: { tags: ["Kırmızı Eşleşme"], pairing: "Pizza, sandviç, kırmızı et ve köfte eşleşmesi" },
      en: { tags: ["Red Pairing"], pairing: "Pizza, sandwich, red meat and köfte pairing" },
    },
  ],
  [
    "Morso di Sole",
    {
      tr: { tags: ["Tatlı Eşleşmesi"], pairing: "Künefe, katmer ve peynir tabağı eşleşmesi" },
      en: { tags: ["Dessert Pairing"], pairing: "Künefe, katmer and cheese board pairing" },
    },
  ],
  ["Gourmet Village Breakfast (per person)", { en: { tags: ["Signature", "Sharing"] } }],
  ["White Wine Tasting", { en: { tags: ["Curated Pairing", "Sharing"] } }],
  ["Red Wine Tasting", { en: { tags: ["Curated Pairing", "Sharing"] } }],
  ["Pistachio Katmer", { en: { tags: ["Sweet Closing"], pairing: "Pairing: Morso di Sole" } }],
]);

function MenuItemSignals({ signal }: { signal?: MenuItemSignal }) {
  if (!signal?.tags?.length && !signal?.pairing) {
    return null;
  }

  return (
    <div className="menu-book-item-signals">
      {signal.tags?.length ? (
        <div className="menu-book-item-tags">
          {signal.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      {signal.pairing ? <p>{signal.pairing}</p> : null}
    </div>
  );
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
  indexLabel,
  itemCountLabel,
  signalLanguage,
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

        <nav className="menu-book-index" aria-label={indexLabel}>
          {sections.map((section) => (
            <a href={`#${sectionId(section.title)}`} key={section.title}>
              <span>{section.title}</span>
              <small>
                {section.items.length} {itemCountLabel}
              </small>
            </a>
          ))}
        </nav>

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
            <section className="menu-book-category" id={sectionId(section.title)} key={section.title}>
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
                  <MenuItemSignals signal={itemSignals.get(firstItem.name)?.[signalLanguage]} />
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
                        <MenuItemSignals signal={itemSignals.get(item.name)?.[signalLanguage]} />
                      </article>
                    );
                  }

                  if (noteNames.has(item.name)) {
                    return (
                      <article className="menu-book-note-card" key={item.name}>
                        <h3>{item.name}</h3>
                        {item.price ? <strong>{priceLabel(item.price)}</strong> : null}
                        {item.description ? <p>{item.description}</p> : null}
                        <MenuItemSignals signal={itemSignals.get(item.name)?.[signalLanguage]} />
                      </article>
                    );
                  }

                  if (isWineSection) {
                    return (
                      <article className="menu-book-wine" key={item.name}>
                        <h3>{item.name}</h3>
                        {item.description ? <p>{item.description}</p> : null}
                        <MenuItemSignals signal={itemSignals.get(item.name)?.[signalLanguage]} />
                        {item.price ? <strong>{priceLabel(item.price)}</strong> : null}
                      </article>
                    );
                  }

                  return (
                    <article className="menu-book-item" key={item.name}>
                      <div>
                        <h3>{item.name}</h3>
                        {item.description ? <p>{item.description}</p> : null}
                        <MenuItemSignals signal={itemSignals.get(item.name)?.[signalLanguage]} />
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
