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
  // ── 2026-07-02 canlı menü senkronu (kozbeylikonagi.com.tr/menu) ──
  // kcal değerleri ve şarap/rakı eşleşmeleri canlı kaynaktan aktarıldı.
  // Map davranışı gereği aynı isim tekrarında AŞAĞIDAKİ değer geçerlidir;
  // yukarıdaki eski girdiler tarihsel bağlam için bırakıldı. EN kcal seti
  // ayrı turda eklenecek (EN sayfa mevcut signals'ı korur).
  ["Gurme Serpme Kahvaltı (kişi başı)", { tr: { tags: ["İmza", "Paylaşım", "~1.200 kcal"] } }],
  ["Pişi Kahvaltı Tabağı", { tr: { tags: ["Daha Hafif Seçim", "~650 kcal"] } }],
  ["Fransız Kahvaltı", { tr: { tags: ["~700 kcal"] } }],
  ["Pastırmalı Sahanda Yumurta", { tr: { tags: ["~550 kcal"] } }],
  ["Kavurmalı Sahanda Yumurta", { tr: { tags: ["~600 kcal"] } }],
  ["Mıhlama", { tr: { tags: ["~450 kcal"] } }],
  ["Sahanda Sucuklu Yumurta", { tr: { tags: ["~350 kcal"] } }],
  ["Fransız Tereyağlı Kruvasan (2 Adet)", { tr: { tags: ["~440 kcal"] } }],
  ["Sahanda Menemen", { tr: { tags: ["~280 kcal"] } }],
  ["Patates Kızartması", { tr: { tags: ["~380 kcal"] } }],
  ["Omlet (sade / peynirli)", { tr: { tags: ["~250 kcal"] } }],
  ["Sahanda Peynirli Yumurta", { tr: { tags: ["~300 kcal"] } }],
  ["Fesleğenli Domatesli Ciabatta (4 adet)", { tr: { tags: ["~320 kcal"] } }],
  ["Kare Rustik Ekmek", { tr: { tags: ["~280 kcal"] } }],
  ["Sigara Böreği (4 adet)", { tr: { tags: ["~360 kcal"] } }],
  ["Bal-Kaymak", { tr: { tags: ["~200 kcal"] } }],
  [
    "Konağın Meze Tabağı (2 kişilik - 5 çeşit)",
    {
      tr: {
        tags: ["Şefin Tercihi", "Paylaşım", "~1.100 kcal"],
        pairing: "Öneri: Paşaeli SYS kadeh ile",
      },
    },
  ],
  ["Tereyağlı Pastırmalı Antakya Humus", { tr: { tags: ["~320 kcal"] } }],
  ["Avokadolu Kapya Biber", { tr: { tags: ["~180 kcal"] } }],
  ["Zeytinyağlı Vişneli Yaprak Sarma", { tr: { tags: ["~250 kcal"] } }],
  [
    "Somon Havyarı",
    {
      tr: {
        tags: ["~220 kcal"],
        pairing: "Öneri: Bir Varmış Bir Yokmuş Chardonnay",
      },
    },
  ],
  [
    "Tereyağlı Jumbo Karides",
    {
      tr: {
        tags: ["Şefin Tercihi", "~350 kcal"],
        pairing: "Öneri: Bir Varmış Bir Yokmuş Chardonnay",
      },
    },
  ],
  ["Hatay Usulü Kızarmış Peynir", { tr: { tags: ["Antakya Klasiği", "~420 kcal"] } }],
  ["Antakya Usulü İçli Köfte (adet)", { tr: { tags: ["En Çok Tercih Edilen", "~180 kcal"] } }],
  ["Paçanga Böreği (adet)", { tr: { tags: ["~170 kcal"] } }],
  ["Kaşarlı Mantar", { tr: { tags: ["~280 kcal"] } }],
  ["Kasap Sosis & Baharatlı Çıtır Patates (2 adet sosis)", { tr: { tags: ["~520 kcal"] } }],
  ["Kızarmış Tavuk & Baharatlı Patates", { tr: { tags: ["~580 kcal"] } }],
  [
    "Rustik Ekmek Üstü Füme Somon",
    {
      tr: {
        tags: ["~320 kcal"],
        pairing: "Öneri: Bir Varmış Bir Yokmuş Chardonnay",
      },
    },
  ],
  ["Roka Salatası", { tr: { tags: ["~280 kcal"] } }],
  ["Başlangıç Tabağı (2 kişi)", { tr: { tags: ["~250 kcal"] } }],
  ["Baharatlı Çıtır Patates", { tr: { tags: ["~380 kcal"] } }],
  ["Parmesanlı Patates Kızartması", { tr: { tags: ["~450 kcal"] } }],
  [
    "Köy Usulü Konak Pizza",
    {
      tr: {
        tags: ["En Çok Tercih Edilen", "~850 kcal"],
        pairing: "Öneri: Paşaeli CSKS veya Paşaeli 6N",
      },
    },
  ],
  [
    "Konak Tandır Pizza",
    { tr: { tags: ["Şefin Tercihi", "~780 kcal"], pairing: "Öneri: Paşaeli CSKS" } },
  ],
  [
    "Kavurmalı Konak Pizza",
    { tr: { tags: ["~800 kcal"], pairing: "Öneri: Paşaeli CSKS veya Paşaeli 6N" } },
  ],
  [
    "Margherita Napoletana",
    { tr: { tags: ["~700 kcal"], pairing: "Öneri: Paşaeli CSKS veya Paşaeli SYS" } },
  ],
  [
    "Dana Kaburga Füme Etli Sandviç",
    { tr: { tags: ["~650 kcal"], pairing: "Öneri: Paşaeli 6N" } },
  ],
  [
    "Hindi Füme Etli Sandviç",
    { tr: { tags: ["~580 kcal"], pairing: "Öneri: Paşaeli 6N" } },
  ],
  [
    "Gurme Rustik Pesto Sandviç",
    { tr: { tags: ["~520 kcal"], pairing: "Öneri: Paşaeli SYS" } },
  ],
  [
    "Gurme Rustik Avokado Sandviç",
    { tr: { tags: ["~540 kcal"], pairing: "Öneri: Paşaeli CSKS" } },
  ],
  [
    "Rakı Eşlikçisi Peynir Tabağı",
    { tr: { tags: ["~450 kcal"], pairing: "Öneri: Beylerbeyi Göbek 70cl" } },
  ],
  [
    "Türk Yerli Peynir & Şarap Tabağı",
    { tr: { tags: ["~500 kcal"], pairing: "Öneri: Paşaeli SYS veya CSKS" } },
  ],
  [
    "Dallas Steak",
    { tr: { tags: ["Konağın İmzası", "~950 kcal"], pairing: "Öneri: Paşaeli 6N" } },
  ],
  [
    "Lokum Bonfile",
    {
      tr: {
        tags: ["Şefin Tercihi", "En Çok Tercih Edilen", "~680 kcal"],
        pairing: "Öneri: Paşaeli CSKS",
      },
    },
  ],
  [
    "Sac Kavurma - Köy Usulü",
    { tr: { tags: ["~720 kcal"], pairing: "Öneri: Paşaeli CSKS veya 6N" } },
  ],
  [
    "Izgara Pirzola",
    { tr: { tags: ["~750 kcal"], pairing: "Öneri: Paşaeli CSKS veya 6N" } },
  ],
  [
    "Konağın Sac Kavurması",
    { tr: { tags: ["~650 kcal"], pairing: "Öneri: Paşaeli CSKS veya 6N" } },
  ],
  ["Konak Köfte", { tr: { tags: ["~620 kcal"], pairing: "Öneri: Paşaeli 6N" } }],
  [
    "Antep Fıstıklı Katmer",
    {
      tr: { tags: ["Şefin Tercihi", "~550 kcal"], pairing: "Öneri: Morso di Sole" },
    },
  ],
  [
    "Antakya Künefe",
    {
      tr: { tags: ["Klasik Favori", "~480 kcal"], pairing: "Öneri: Morso di Sole" },
      en: { tags: ["Antakya Classic"], pairing: "Pairing: Morso di Sole" },
    },
  ],
  ["Churros", { tr: { tags: ["~420 kcal"], pairing: "Öneri: Morso di Sole" } }],
  ["Çikolatalı Mini Berliner (2 adet)", { tr: { tags: ["~350 kcal"] } }],
  ["Vanilyalı Maraş Dondurma (2 top)", { tr: { tags: ["~280 kcal"] } }],
  ["Tatlı & Kahve Keyfi", { tr: { tags: ["En Çok Tercih Edilen"] } }],
  [
    "Beyaz Şarap Tadımı",
    { tr: { tags: ["Şefin Önerisi"], pairing: "1 kadeh + mini peynir tabağı eşliğinde" } },
  ],
  [
    "Kırmızı Şarap Tadımı",
    { tr: { tags: ["Şefin Önerisi"], pairing: "1 kadeh + mini peynir tabağı eşliğinde" } },
  ],
  // ── EN sayfası kcal + eşleşme seti (2026-07-02 canlı senkron, 2. tur) ──
  ["Gourmet Village Breakfast (per person)", { en: { tags: ["Signature", "Sharing", "~1,200 kcal"] } }],
  ["Pişi Breakfast Plate", { en: { tags: ["Lighter Choice", "~650 kcal"] } }],
  ["French Breakfast", { en: { tags: ["~700 kcal"] } }],
  ["Pan-Fried Eggs with Pastirma", { en: { tags: ["~550 kcal"] } }],
  ["Pan-Fried Eggs with Kavurma", { en: { tags: ["~600 kcal"] } }],
  ["Pan-Fried Eggs with Sucuk", { en: { tags: ["~350 kcal"] } }],
  ["French Butter Croissants (2 pieces)", { en: { tags: ["~440 kcal"] } }],
  ["Pan-Fried Menemen", { en: { tags: ["~280 kcal"] } }],
  ["French Fries", { en: { tags: ["~380 kcal"] } }],
  ["Omelette (plain / cheese)", { en: { tags: ["~250 kcal"] } }],
  ["Pan-Fried Eggs with Cheese", { en: { tags: ["~300 kcal"] } }],
  ["Basil & Tomato Ciabatta (4 pieces)", { en: { tags: ["~320 kcal"] } }],
  ["Square Rustic Bread", { en: { tags: ["~280 kcal"] } }],
  ["Cheese Pastry Rolls (4 pieces)", { en: { tags: ["~360 kcal"] } }],
  ["Honey & Clotted Cream", { en: { tags: ["~200 kcal"] } }],
  [
    "Mansion Meze Plate (for 2 - 5 varieties)",
    {
      en: {
        tags: ["Chef's Pick", "Sharing", "~1,100 kcal"],
        pairing: "Pairing: Paşaeli SYS by the glass",
      },
    },
  ],
  ["Antakya Hummus with Butter & Pastirma", { en: { tags: ["~320 kcal"] } }],
  ["Capia Pepper with Avocado", { en: { tags: ["~180 kcal"] } }],
  ["Cherry-Stuffed Vine Leaves in Olive Oil", { en: { tags: ["~250 kcal"] } }],
  [
    "Salmon Caviar",
    { en: { tags: ["~220 kcal"], pairing: "Pairing: Bir Varmış Bir Yokmuş Chardonnay" } },
  ],
  [
    "Jumbo Shrimp in Butter",
    {
      en: {
        tags: ["Chef's Pick", "~350 kcal"],
        pairing: "Pairing: Bir Varmış Bir Yokmuş Chardonnay",
      },
    },
  ],
  ["Hatay-Style Fried Cheese", { en: { tags: ["Antakya Classic", "~420 kcal"] } }],
  ["Antakya-Style Stuffed Köfte (per piece)", { en: { tags: ["Most Popular", "~180 kcal"] } }],
  ["Paçanga Pastry (per piece)", { en: { tags: ["~170 kcal"] } }],
  ["Baked Mushrooms with Kaşar Cheese", { en: { tags: ["~280 kcal"] } }],
  ["Butcher's Sausage & Spiced Crispy Potatoes (2 sausages)", { en: { tags: ["~520 kcal"] } }],
  ["Fried Chicken & Spiced Potatoes", { en: { tags: ["~580 kcal"] } }],
  [
    "Smoked Salmon on Rustic Bread",
    { en: { tags: ["~320 kcal"], pairing: "Pairing: Bir Varmış Bir Yokmuş Chardonnay" } },
  ],
  ["Arugula Salad", { en: { tags: ["~280 kcal"] } }],
  ["Starter Plate (for 2)", { en: { tags: ["~250 kcal"] } }],
  ["Spiced Crispy Fries", { en: { tags: ["~380 kcal"] } }],
  ["Parmesan Fries", { en: { tags: ["~450 kcal"] } }],
  [
    "Village-Style Mansion Pizza",
    {
      en: {
        tags: ["Most Popular", "~850 kcal"],
        pairing: "Pairing: Paşaeli CSKS or Paşaeli 6N",
      },
    },
  ],
  [
    "Mansion Tandoor Pizza",
    { en: { tags: ["Chef's Pick", "~780 kcal"], pairing: "Pairing: Paşaeli CSKS" } },
  ],
  [
    "Mansion Kavurma Pizza",
    { en: { tags: ["~800 kcal"], pairing: "Pairing: Paşaeli CSKS or Paşaeli 6N" } },
  ],
  [
    "Margherita Napoletana",
    { en: { tags: ["~700 kcal"], pairing: "Pairing: Paşaeli CSKS or Paşaeli SYS" } },
  ],
  [
    "Smoked Beef Rib Sandwich",
    { en: { tags: ["~650 kcal"], pairing: "Pairing: Paşaeli 6N" } },
  ],
  [
    "Smoked Turkey Sandwich",
    { en: { tags: ["~580 kcal"], pairing: "Pairing: Paşaeli 6N" } },
  ],
  [
    "Gourmet Rustic Pesto Sandwich",
    { en: { tags: ["~520 kcal"], pairing: "Pairing: Paşaeli SYS" } },
  ],
  [
    "Gourmet Rustic Avocado Sandwich",
    { en: { tags: ["~540 kcal"], pairing: "Pairing: Paşaeli CSKS" } },
  ],
  [
    "Cheese Board for Raki",
    { en: { tags: ["~450 kcal"], pairing: "Pairing: Beylerbeyi Göbek 70cl" } },
  ],
  [
    "Turkish Local Cheese & Wine Board",
    { en: { tags: ["~500 kcal"], pairing: "Pairing: Paşaeli SYS or CSKS" } },
  ],
  [
    "Dallas Steak",
    {
      tr: { tags: ["Konağın İmzası", "~950 kcal"], pairing: "Öneri: Paşaeli 6N" },
      en: { tags: ["Mansion Signature", "~950 kcal"], pairing: "Pairing: Paşaeli 6N" },
    },
  ],
  [
    "Tenderloin Lokum",
    {
      en: {
        tags: ["Chef's Pick", "Most Popular", "~680 kcal"],
        pairing: "Pairing: Paşaeli CSKS",
      },
    },
  ],
  [
    "Sac Kavurma - Village Style",
    { en: { tags: ["~720 kcal"], pairing: "Pairing: Paşaeli CSKS or 6N" } },
  ],
  [
    "Grilled Lamb Chops",
    { en: { tags: ["~750 kcal"], pairing: "Pairing: Paşaeli CSKS or 6N" } },
  ],
  [
    "Mansion Sac Kavurma",
    { en: { tags: ["~650 kcal"], pairing: "Pairing: Paşaeli CSKS or 6N" } },
  ],
  ["Mansion Köfte", { en: { tags: ["~620 kcal"], pairing: "Pairing: Paşaeli 6N" } }],
  [
    "Pistachio Katmer",
    {
      en: { tags: ["Chef's Pick", "Sweet Closing", "~550 kcal"], pairing: "Pairing: Morso di Sole" },
    },
  ],
  [
    "Antakya Künefe",
    {
      tr: { tags: ["Klasik Favori", "~480 kcal"], pairing: "Öneri: Morso di Sole" },
      en: { tags: ["Classic Favorite", "~480 kcal"], pairing: "Pairing: Morso di Sole" },
    },
  ],
  [
    "Churros",
    {
      tr: { tags: ["~420 kcal"], pairing: "Öneri: Morso di Sole" },
      en: { tags: ["~420 kcal"], pairing: "Pairing: Morso di Sole" },
    },
  ],
  ["Chocolate Mini Berliners (2 pieces)", { en: { tags: ["~350 kcal"] } }],
  ["Vanilla Maraş Ice Cream (2 scoops)", { en: { tags: ["~280 kcal"] } }],
  ["Dessert & Coffee Ritual", { en: { tags: ["Most Popular"] } }],
  [
    "White Wine Tasting",
    {
      en: {
        tags: ["Chef's Pick", "Curated Pairing"],
        pairing: "1 glass + mini cheese board",
      },
    },
  ],
  [
    "Red Wine Tasting",
    {
      en: {
        tags: ["Chef's Pick", "Curated Pairing"],
        pairing: "1 glass + mini cheese board",
      },
    },
  ],
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
