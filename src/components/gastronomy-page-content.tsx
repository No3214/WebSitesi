"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { StoryHero, StorySegment } from "@/components/storytelling";
import { englishMenuSections } from "@/data/menu-en";
import { menuSections, type MenuSection } from "@/data/menu";
import { absoluteUrl } from "@/lib/utils";

type Locale = "tr" | "en";

const gastronomyCopy = {
  tr: {
    url: "/gastronomi",
    heroTitle: "Gastronomi Mirası",
    heroSubtitle: "ANTAKYA'DAN EGE'YE BİR LEZZET KÖPRÜSÜ",
    cuisine: ["Ege Mutfağı", "Antakya Mutfağı", "Türk Kahvaltısı"],
    segments: [
      {
        title: "İnci Hanım'ın Mutfağı",
        content:
          "Kozbeyli Konağı'nın mutfağı, sadece bir yemek alanı değil; İnci Hanım'ın Antakya kökenli aile mirası ile Ege'nin kadim topraklarını birleştiren bir 'Gastronomi Laboratuvarı'dır.",
        image: "/images/galeri/aksam-sofrasi.jpg",
        side: "left" as const,
      },
      {
        title: "Orijinal Taş Dibek",
        content:
          "180 yıllık orijinal taş dibekte her gün taze olarak elde dövülen Dibek Kahvesi, Kozbeyli'nin en karakteristik sabah ritüellerinden biridir.",
        image: "/videos/mihlama-poster.jpg",
        side: "right" as const,
      },
      {
        title: "Farm-to-Table Kahvaltı",
        content:
          "Serpme köy kahvaltımız, Kozbeyli'nin asırlık zeytin ağaçlarından ve İnci Hanım'ın geleneksel reçel tariflerinden süzülen tam organik bir döngüdür.",
        image: "/videos/kahvalti-poster.jpg",
        side: "left" as const,
      },
    ],
    liveTitle: "Mutfaktan Canlı Kareler",
    liveText:
      "Serpme köy kahvaltısı, taş ateşinde mıhlama ve şefin akşam tabağı — Kozbeyli mutfağının gerçek hali.",
    menuEyebrow: "RESTORAN MENÜSÜ",
    menuTitle: "Konağın Seçili Lezzetleri",
    menuText:
      "Kahvaltıdan Antakya mezelerine, taş fırın pizzadan ana yemeklere kadar güncel restoran menüsünden öne çıkan başlıklar.",
    menuHref: "/menu",
    menuCta: "MENÜNÜN TAMAMINI GÖR",
    itemCountLabel: "ürün",
    videos: ["Serpme Köy Kahvaltısı", "Taş Ateşinde Mıhlama", "Şefin İmzası"],
    playLabels: ["Kahvaltı videosunu oynat", "Mıhlama videosunu oynat", "Şef videosunu oynat"],
  },
  en: {
    url: "/en/dining",
    heroTitle: "Culinary Heritage",
    heroSubtitle: "A BRIDGE OF FLAVOUR FROM ANTAKYA TO THE AEGEAN",
    cuisine: ["Aegean Cuisine", "Antakya Cuisine", "Turkish Breakfast"],
    segments: [
      {
        title: "Inci Hanim's Kitchen",
        content:
          "The kitchen at Kozbeyli Konağı is more than a dining room. It brings Inci Hanim's Antakya family heritage together with the Aegean's ancient produce in a curated culinary experience.",
        image: "/images/galeri/aksam-sofrasi.jpg",
        side: "left" as const,
      },
      {
        title: "Original Stone Dibek",
        content:
          "Fresh dibek coffee is still ground by hand in the original stone mortar, keeping one of Kozbeyli's oldest morning rituals alive for guests.",
        image: "/videos/mihlama-poster.jpg",
        side: "right" as const,
      },
      {
        title: "Farm-to-Table Breakfast",
        content:
          "Our village breakfast follows a complete local cycle, from century-old olive trees to house-made preserves and warm stone-oven flavours.",
        image: "/videos/kahvalti-poster.jpg",
        side: "left" as const,
      },
    ],
    liveTitle: "Live Frames from the Kitchen",
    liveText:
      "Village breakfast, mıhlama over stone fire and the chef's evening plate — real moments from the Kozbeyli kitchen.",
    menuEyebrow: "RESTAURANT MENU",
    menuTitle: "Selected Tastes of the Mansion",
    menuText:
      "A visible preview from the current restaurant menu, from village breakfast and Antakya mezes to stone-oven pizza and main courses.",
    menuHref: "/en/menu",
    menuCta: "VIEW FULL MENU",
    itemCountLabel: "items",
    videos: ["Village Breakfast Table", "Stone-Fire Mıhlama", "Chef's Signature"],
    playLabels: ["Play breakfast video", "Play mıhlama video", "Play chef video"],
  },
};

const menuPreviewTitles = {
  tr: ["Kahvaltı", "Mezeler", "Napoliten Pizza & Sandviç", "Ana Yemekler"],
  en: ["Breakfast", "Mezes", "Neapolitan Pizza & Sandwich", "Main Courses"],
} as const;

function getMenuPreview(locale: Locale): MenuSection[] {
  const sections = locale === "en" ? englishMenuSections : menuSections;
  const titles = new Set<string>(menuPreviewTitles[locale]);
  return sections.filter((section) => titles.has(section.title)).slice(0, 4);
}

type KitchenVideoCardProps = {
  poster: string;
  src: string;
  event: string;
  caption: string;
  playLabel: string;
  locale: Locale;
};

function KitchenVideoCard({ poster, src, event, caption, playLabel, locale }: KitchenVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  async function playVideo() {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.playsInline = true;
      await video.play();
      setIsPlaying(!video.paused);
      setPlaybackBlocked(false);
    } catch {
      setIsPlaying(false);
      setPlaybackBlocked(true);
      video.controls = true;
    }
  }

  function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    void playVideo();
  }

  const controlText = locale === "en" ? (isPlaying ? "Pause" : "Play") : isPlaying ? "Duraklat" : "Oynat";

  return (
    <figure className="kitchen-video-card">
      <div className="kitchen-video-shell">
        <video
          ref={videoRef}
          controls
          preload="none"
          playsInline
          poster={poster}
          data-event={event}
          data-video-state={isPlaying ? "playing" : playbackBlocked ? "blocked" : "paused"}
          onClick={toggleVideo}
          onPlaying={() => {
            setIsPlaying(true);
            setPlaybackBlocked(false);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setIsPlaying(false);
            setPlaybackBlocked(true);
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
        <button
          type="button"
          className="kitchen-video-control"
          data-state={isPlaying ? "playing" : playbackBlocked ? "blocked" : "paused"}
          data-testid={`kitchen-video-play-${event.replace("video_play_", "")}`}
          aria-label={isPlaying ? `${controlText} ${caption}` : playLabel}
          onClick={() => {
            toggleVideo();
          }}
        >
          {isPlaying ? <Pause aria-hidden size={22} strokeWidth={2.2} /> : <Play aria-hidden size={22} strokeWidth={2.2} />}
          <span className="video-control-label">{controlText}</span>
        </button>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function GastronomyPageContent({ locale = "tr" }: { locale?: Locale }) {
  const copy = gastronomyCopy[locale];
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Kozbeyli Konağı Restaurant",
    url: absoluteUrl(copy.url),
    image: absoluteUrl("/images/galeri/aksam-sofrasi.jpg"),
    servesCuisine: copy.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kozbeyli Köyü",
      addressLocality: "Foça",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    parentOrganization: {
      "@type": "LodgingBusiness",
      name: "Kozbeyli Konağı",
      url: absoluteUrl("/"),
    },
    hasMenu: absoluteUrl(locale === "en" ? "/en/menu" : "/menu"),
  };

  return (
    <main className="min-h-screen gastronomy-story-page" style={{ background: "var(--ivory)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <SiteHeader variant="solid" />

      <StoryHero title={copy.heroTitle} subtitle={copy.heroSubtitle} />

      {copy.segments.map((segment) => (
        <StorySegment
          key={segment.title}
          title={segment.title}
          content={segment.content}
          image={segment.image}
          side={segment.side}
        />
      ))}

      <section className="gastronomy-menu-preview" aria-labelledby="gastronomy-menu-title">
        <div className="gastronomy-menu-preview-inner">
          <div className="gastronomy-menu-preview-head">
            <p className="eyebrow">{copy.menuEyebrow}</p>
            <h2 id="gastronomy-menu-title">{copy.menuTitle}</h2>
            <p>{copy.menuText}</p>
          </div>

          <div className="gastronomy-menu-grid">
            {getMenuPreview(locale).map((section) => (
              <article className="gastronomy-menu-card" key={section.title}>
                <div>
                  <h3>{section.title}</h3>
                  {section.note ? <p>{section.note}</p> : null}
                </div>
                <ul>
                  {section.items.slice(0, 3).map((item) => (
                    <li key={item.name}>
                      <span>{item.name}</span>
                      {item.price ? <strong>{item.price}</strong> : null}
                    </li>
                  ))}
                </ul>
                <small>
                  {section.items.length} {copy.itemCountLabel}
                </small>
              </article>
            ))}
          </div>

          <Link className="button gold gastronomy-menu-link" href={copy.menuHref}>
            {copy.menuCta}
          </Link>
        </div>
      </section>

      <section style={{ padding: "72px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <h2
          style={{
            color: "var(--olive)",
            fontSize: "1.8rem",
            textAlign: "center",
            marginBottom: 12,
            fontFamily: "var(--font-serif, serif)",
          }}
        >
          {copy.liveTitle}
        </h2>
        <p style={{ color: "var(--muted)", textAlign: "center", marginBottom: 40 }}>
          {copy.liveText}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          {[
            { poster: "/videos/kahvalti-poster.jpg", src: "/videos/kahvalti.mp4", event: "video_play_kahvalti" },
            { poster: "/videos/mihlama-poster.jpg", src: "/videos/mihlama.mp4", event: "video_play_mihlama" },
            { poster: "/videos/chef-poster.jpg", src: "/videos/chef.mp4", event: "video_play_chef" },
          ].map((video, index) => (
            <KitchenVideoCard
              key={video.src}
              poster={video.poster}
              src={video.src}
              event={video.event}
              caption={copy.videos[index]}
              playLabel={copy.playLabels[index]}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
