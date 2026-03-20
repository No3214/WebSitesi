import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog | Ege, Tarih ve Gastronomi Yazıları",
  description:
    "Kozbeyli Konağı blog: 500 yıllık taş mimari, Antakya & Ege mutfağı, Foça gezi rehberi ve butik otel deneyimleri hakkında yazılar.",
  alternates: { canonical: "/blog" },
  keywords: [
    "foça blog",
    "ege mutfağı yazıları",
    "butik otel deneyimi",
    "kozbeyli köyü",
    "izmir seyahat rehberi",
  ],
  openGraph: {
    images: [
      {
        url: absoluteUrl("/images/rooms/bahce-2.jpeg"),
        width: 1200,
        height: 630,
        alt: "Kozbeyli Konağı Blog - Ege, Tarih ve Gastronomi",
      },
    ],
  },
};

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", url: "/" },
          { name: "Blog" },
        ])}
      />
      <main className="section" style={{ paddingTop: "120px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span className="eyebrow">BLOG</span>
            <h1
              className="serif"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "var(--olive)", margin: "12px 0 20px" }}
            >
              Hikayeler, Lezzetler, Keşifler
            </h1>
            <p style={{ maxWidth: "600px", margin: "0 auto", color: "#666", lineHeight: 1.7 }}>
              Kozbeyli Köyü&apos;nden ilham alan yazılar: tarihi taş mimari, Ege &amp; Antakya gastronomisi ve Foça deneyimleri.
            </p>
          </div>

          <div className="card-grid">
            {blogPosts.map((post, i) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card">
                <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                  <Image
                    src={post.image}
                    alt={post.title.tr}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={i < 2}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      background: "var(--gold)",
                      color: "white",
                      padding: "4px 12px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      borderRadius: "20px",
                    }}
                  >
                    {post.category.tr}
                  </span>
                </div>
                <div className="card-body">
                  <div style={{ display: "flex", gap: "16px", marginBottom: "12px", fontSize: "0.78rem", color: "#999" }}>
                    <span>{new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span>·</span>
                    <span>{post.readingTime} dk okuma</span>
                  </div>
                  <h2 className="serif" style={{ fontSize: "1.3rem", marginBottom: "12px", lineHeight: 1.3 }}>
                    {post.title.tr}
                  </h2>
                  <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    {post.excerpt.tr}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
