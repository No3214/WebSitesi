import { ReviewSummary } from "@/components/reviews/review-summary";

// Ana sayfa "gerçek-agregat" yorum ozet bolumu (curated testimonials'tan ayri).
// Yorum yoksa widget nazikçe bos durum gosterir; sayfayi sismez.
export function ReviewsSection() {
  return (
    <section className="section section-reviews">
      <div className="container" style={{ maxWidth: 1080 }}>
        <ReviewSummary />
      </div>
    </section>
  );
}

export default ReviewsSection;
