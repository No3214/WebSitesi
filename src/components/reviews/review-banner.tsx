"use client";

import { useEffect, useState } from "react";

// Rezervasyon akisi guven bandi (kompakt). Kendi ic API'mizden beslenir; ucuncu-taraf
// metni source HTML'ine girmez. Hic yorum yoksa nazikçe hicbir sey gostermez.

type Summary = { overall: { average: number; count: number } };

export function ReviewBanner() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/review-summary")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: Summary) => active && setData(j))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!data || data.overall.count === 0) return null;

  return (
    <div className="review-banner" role="note" aria-label="Misafir memnuniyeti">
      <span className="review-banner-star" aria-hidden>
        ★
      </span>
      <span className="review-banner-score">{data.overall.average.toFixed(1)} / 5</span>
      <span className="review-banner-text">{data.overall.count} misafir değerlendirdi</span>
    </div>
  );
}

export default ReviewBanner;
