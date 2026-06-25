// Puan normalize + yazar maskeleme (saf fonksiyonlar, yan etki yok).

/**
 * Herhangi bir ölçekteki puanı 1-5'e normalize eder.
 * Booking 10'luk → 5'lik: normalizeRating(8.6, 10) = 4.3
 * Zaten 5'likse scaleMax=5 (varsayılan) verilir.
 * Sonuç 1..5 aralığına clamp'lenir, 1 ondalığa yuvarlanır.
 */
export function normalizeRating(value: number, scaleMax = 5): number {
  if (!Number.isFinite(value) || !Number.isFinite(scaleMax) || scaleMax <= 0) return 0;
  const onFive = (value / scaleMax) * 5;
  const clamped = Math.min(5, Math.max(1, onFive));
  return Math.round(clamped * 10) / 10;
}

/**
 * Tam adı KVKK-uyumlu kısaltır: "Ayşe Kaya" → "Ayşe K.".
 * Tek kelimeyse olduğu gibi; boşsa "Misafir".
 * Tam soyadı ASLA döndürülmez.
 */
export function maskAuthor(fullName: string | null | undefined): string {
  const name = (fullName || "").trim().replace(/\s+/g, " ");
  if (!name) return "Misafir";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toLocaleUpperCase("tr-TR");
  return `${first} ${lastInitial}.`;
}
