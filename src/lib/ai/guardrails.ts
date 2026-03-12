const MAX_RESPONSE_CHARS = 1200;

function stripDangerousOverclaims(text: string): string {
  return text
    .replace(/kesin olarak müsait/gi, 'müsaitlik için teyit gerekir')
    .replace(/hemen rezervasyonunuzu oluşturuyorum/gi, 'rezervasyon için size yönlendirme yapabilirim')
    .replace(/ödemeniz alındı/gi, 'ödeme adımlarında size yönlendirme yapabilirim');
}

function stripPromptLeakage(text: string): string {
  return text
    .replace(/system prompt/gi, '')
    .replace(/brand context/gi, '')
    .replace(/voice & tone/gi, '');
}

export function applyOutputGuardrails(text: string): string {
  const normalized = stripPromptLeakage(stripDangerousOverclaims(text || '')).trim();

  if (!normalized) {
    return 'Memnuniyetle yardımcı olurum. Oda, restoran, etkinlik veya rezervasyon konularından hangisiyle ilgileniyorsunuz?';
  }

  return normalized.slice(0, MAX_RESPONSE_CHARS);
}
