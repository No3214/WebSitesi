"use client";

import { useEffect, useState } from "react";

// Ana sayfa yorum ozet widget'i (marka kimligi). Kendi ic API'mizden (/api/
// review-summary) beslenir → ucuncu-taraf metni source HTML'ine GIRMEZ (legal-safe;
// Google self-serving / Tripadvisor metin-gizleme kurallariyla uyumlu). Graceful
// bos durum. Dis linkler nofollow+noopener.

type SourceSummary = {
  name: string;
  sourceUrl?: string | null;
  average: number;
  count: number;
  displayPolicy: string;
};
type Summary = {
  overall: { average: number; count: number };
  bySource: Record<string, SourceSummary>;
};

export function ReviewSummary({ heading = "Misafir Değerlendirmeleri" }: { heading?: string }) {
  const [data, setData] = useState<Summary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/review-summary")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: Summary) => active && setData(j))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  if (failed) return null;
  if (!data || data.overall.count === 0) {
    return (
      <div className="review-summary review-summary-empty">
        <p className="muted">Misafir değerlendirmeleri yakında burada.</p>
      </div>
    );
  }

  const sources = Object.entries(data.bySource);
  return (
    <section className="review-summary" aria-label={heading}>
      <div className="review-summary-head">
        <span className="eyebrow">DEĞERLENDİRMELER</span>
        <h3 className="serif review-summary-title">{heading}</h3>
        <p className="review-summary-overall">
          <strong>{data.overall.average.toFixed(1)}</strong>
          <span aria-hidden> / 5</span>
          <span className="review-summary-count"> · {data.overall.count} değerlendirme</span>
        </p>
      </div>
      <ul className="review-summary-sources">
        {sources.map(([key, s]) => (
          <li key={key} className="review-summary-source">
            <span className="review-summary-source-name">{s.name}</span>
            <span className="review-summary-source-score">{s.average.toFixed(1)}</span>
            <span className="review-summary-source-count">({s.count})</span>
            {s.sourceUrl ? (
              <a
                className="review-summary-source-link"
                href={s.sourceUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Kaynağa git
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ReviewSummary;
