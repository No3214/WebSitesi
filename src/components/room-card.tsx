import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/hooks/use-dictionary";

type RoomCardProps = {
  slug: string;
  title: string;
  short?: string;
  capacity: string;
  view: string;
  size: string;
  image: string;
  price?: number;
  locale: Locale;
  detailLabel?: string;
  priority?: boolean;
  compact?: boolean;
};

const priceLabels = {
  tr: "/ gece · kahvaltı dahil",
  en: "/ night · breakfast included",
} as const;

export function RoomCard({
  slug, title, short, capacity, view, size, image,
  price, locale, detailLabel, priority = false, compact = false,
}: RoomCardProps) {
  return (
    <Link href={`/odalar/${slug}`} className="card">
      <div style={{ position: "relative", height: compact ? "220px" : "350px", overflow: "hidden" }}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority={priority}
          sizes={compact ? "33vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        />
        <span style={{
          position: "absolute", top: compact ? "12px" : "16px", right: compact ? "12px" : "16px",
          background: "rgba(0,0,0,0.6)", color: "#fff",
          padding: compact ? "4px 10px" : "6px 12px",
          fontSize: compact ? "0.7rem" : "0.75rem", fontWeight: 600,
          letterSpacing: "0.05em", backdropFilter: "blur(4px)",
        }}>
          {size}
        </span>
      </div>
      <div className="card-body" style={compact ? { padding: "20px" } : undefined}>
        <span className="meta">{capacity} · {view}</span>
        <h3 style={compact ? { fontSize: "1.1rem" } : undefined}>{title}</h3>
        {!compact && short && <p>{short}</p>}
        {!compact && price && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "12px 0", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--olive)", fontFamily: "var(--serif)" }}>
              ₺{price.toLocaleString("tr-TR")}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase" }}>
              {priceLabels[locale]}
            </span>
          </div>
        )}
        {!compact && detailLabel && (
          <span className="button secondary" style={{ width: "100%", padding: "10px" }}>{detailLabel}</span>
        )}
      </div>
    </Link>
  );
}
