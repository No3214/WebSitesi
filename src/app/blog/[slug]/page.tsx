import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title.tr,
    description: post.excerpt.tr,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title.tr,
      description: post.excerpt.tr,
      images: [{ url: absoluteUrl(post.image), width: 1200, height: 630, alt: post.title.tr }],
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function articleSchema(post: (typeof blogPosts)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.tr,
    description: post.excerpt.tr,
    image: absoluteUrl(post.image),
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: "Kozbeyli Konağı",
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    wordCount: post.content.tr.split(/\s+/).length,
    inLanguage: "tr",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  // Simple markdown-like rendering: ## headers and paragraphs
  const renderContent = (text: string) => {
    return text.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2 key={i} className="serif" style={{ fontSize: "1.6rem", color: "var(--olive)", margin: "40px 0 16px" }}>
            {block.replace("## ", "")}
          </h2>
        );
      }
      if (block.startsWith("- ")) {
        const items = block.split("\n").filter((l) => l.startsWith("- "));
        return (
          <ul key={i} style={{ paddingLeft: "20px", margin: "16px 0", lineHeight: 1.8, color: "#444" }}>
            {items.map((item, j) => (
              <li key={j}>{item.replace("- ", "")}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} style={{ color: "#444", lineHeight: 1.8, margin: "16px 0", fontSize: "1.05rem" }}>
          {block}
        </p>
      );
    });
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana Sayfa", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title.tr },
          ]),
          articleSchema(post),
        ]}
      />
      <main style={{ paddingTop: "120px" }}>
        {/* Hero */}
        <div style={{ position: "relative", height: "50vh", minHeight: "360px", overflow: "hidden" }}>
          <Image src={post.image} alt={post.title.tr} fill className="object-cover" priority sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 100%)" }} />
          <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "40px" }}>
            <span style={{ background: "var(--gold)", color: "white", padding: "4px 14px", fontSize: "0.7rem", fontWeight: 700, borderRadius: "20px", display: "inline-block", marginBottom: "16px", width: "fit-content" }}>
              {post.category.tr}
            </span>
            <h1 className="serif" style={{ color: "white", fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.15, maxWidth: "800px" }}>
              {post.title.tr}
            </h1>
            <div style={{ display: "flex", gap: "16px", marginTop: "16px", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
              <span>{new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span>·</span>
              <span>{post.readingTime} dk okuma</span>
              <span>·</span>
              <span>{post.author}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container" style={{ maxWidth: "760px", padding: "60px 24px 80px" }}>
          {renderContent(post.content.tr)}
        </div>

        {/* Related Posts */}
        {otherPosts.length > 0 && (
          <div className="section-alt" style={{ padding: "80px 0" }}>
            <div className="container">
              <h2 className="serif" style={{ fontSize: "1.8rem", color: "var(--olive)", marginBottom: "32px" }}>
                Diğer Yazılar
              </h2>
              <div className="card-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {otherPosts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="card">
                    <div style={{ position: "relative", height: "200px" }}>
                      <Image src={p.image} alt={p.title.tr} fill className="object-cover" sizes="50vw" />
                    </div>
                    <div className="card-body" style={{ padding: "24px" }}>
                      <span className="meta">{p.category.tr}</span>
                      <h3 style={{ fontSize: "1.1rem" }}>{p.title.tr}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
