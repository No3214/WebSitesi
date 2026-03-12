import type { ChatMessage } from './types';

function getLastUserText(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  return (lastUser?.content || '').toLowerCase();
}

export function buildFallbackResponse(messages: ChatMessage[]): string {
  const text = getLastUserText(messages);

  if (!text) {
    return 'Efendim, Kozbeyli Konağı hakkında oda, restoran, etkinlik ve rezervasyon süreçlerinde size yardımcı olabilirim.';
  }

  if (text.includes('oda') || text.includes('konaklama') || text.includes('suit')) {
    return 'Konağımızda taş dokunun modern konforla buluştuğu farklı oda seçeneklerimiz bulunmaktadır. Size en uygun oda tipi için kişi sayınızı ve tarih aralığınızı paylaşırsanız doğru yönlendirme yapabilirim. Kesin fiyat ve müsaitlik için de rezervasyon hattımıza yönlendirebilirim.';
  }

  if (text.includes('kahvaltı') || text.includes('yemek') || text.includes('restoran') || text.includes('akşam')) {
    return 'Restoran tarafında Antakya dokunuşları, taş fırın lezzetleri ve karakterli bir atmosfer sunuyoruz. Kahvaltı, akşam yemeği veya özel masa planı düşünüyorsanız kişi sayınızı paylaşın, size uygun yönlendirmeyi yapayım.';
  }

  if (text.includes('fiyat') || text.includes('ücret') || text.includes('kaç tl') || text.includes('kaç para')) {
    return 'Güncel fiyat bilgisi tarih ve oda tipine göre değişebilir. Hızlı ve doğru bilgi için sizi rezervasyon sürecine veya WhatsApp hattımıza yönlendirebilirim.';
  }

  if (text.includes('düğün') || text.includes('organizasyon') || text.includes('etkinlik')) {
    return 'Kozbeyli Konağı butik etkinlikler, özel yemekler ve zarif organizasyonlar için güçlü bir atmosfere sahiptir. Etkinlik türünüzü ve yaklaşık kişi sayınızı paylaşırsanız daha doğru yönlendirebilirim.';
  }

  return 'Memnuniyetle yardımcı olurum. Oda, restoran, etkinlik veya rezervasyon konularından hangisiyle ilgileniyorsunuz?';
}
