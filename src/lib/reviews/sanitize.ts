// Yorum gövdesi sanitizasyonu — HTML/script/link strip → güvenli düz metin.
// Üçüncü-taraf yorumlarını sayfaya basmadan önce XSS ve istenmeyen markup temizlenir.

const MAX_LEN = 1200;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/** Yazdırılamayan kontrol karakterlerini (0x00-0x1F, 0x7F) kod noktasıyla siler. */
function stripControlChars(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 32;
    if (code < 32 || code === 127) {
      out += " ";
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Ham (muhtemelen HTML içeren) yorum metnini güvenli düz metne çevirir:
 *  - <script>/<style> bloklarını içerikleriyle birlikte siler,
 *  - tüm HTML etiketlerini kaldırır,
 *  - temel HTML entity'lerini çözer,
 *  - URL'leri (http/https/www) kaldırır (link bırakmaz),
 *  - kontrol karakterlerini ve fazla boşlukları sadeleştirir, uzunluğu sınırlar.
 */
export function sanitizeReviewBody(input: string | null | undefined): string {
  let s = String(input ?? "");
  // script/style blokları (içerik dahil)
  s = s.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, " ");
  // kalan tüm etiketler
  s = s.replace(/<[^>]+>/g, " ");
  // entity çöz
  s = s.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? " ");
  // URL'leri kaldır (link bırakma)
  s = s.replace(/\b(?:https?:\/\/|www\.)\S+/gi, " ");
  // kontrol karakterleri
  s = stripControlChars(s);
  // boşluk sadeleştir
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN).trimEnd() + "…";
  return s;
}
