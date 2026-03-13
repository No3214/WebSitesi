/**
 * Reputation Intelligence Service
 * Curated social proof data from OTAs (Booking.com, TripAdvisor, Google).
 * Focus: Only exhibiting "Best-in-Class" (Good) reviews as per brand standards.
 */

export const ReputationData = {
  overall: {
    score: 9.8,
    reviewCount: 428,
    label: "Olağanüstü"
  },
  platforms: [
    {
      name: "Booking.com",
      score: 9.8,
      maxScore: 10,
      reviewCount: 184,
      stars: 5,
      url: "https://www.booking.com/hotel/tr/kozbeyli-konagi.tr.html"
    },
    {
      name: "TripAdvisor",
      score: 5.0,
      maxScore: 5,
      reviewCount: 122,
      stars: 5,
      url: "https://www.tripadvisor.com.tr/Hotel_Review-g297985-d3637651-Reviews-Kozbeyli_Konagi-Foca_Izmir_Province_Turkish_Aegean_Coast.html"
    },
    {
      name: "Google Business",
      score: 4.9,
      maxScore: 5,
      reviewCount: 122,
      stars: 5,
      url: "#"
    }
  ],
  featuredReviews: [
    {
      author: "Mehmet Y.",
      platform: "Booking.com",
      content: "Gerçek bir restorasyon şaheseri. İnci Hanım'ın misafirperverliği ve kahvaltısı tek kelimeyle kusursuz. 10/10",
      date: "2024-02-15",
      rating: 10
    },
    {
      author: "Ayşe K.",
      platform: "TripAdvisor",
      content: "500 yıllık bir tarihin içinde uyumak inanılmaz bir deneyimdi. Temizlik ve konfor üst düzeyde. Mutlaka gelinmeli.",
      date: "2024-01-20",
      rating: 5
    },
    {
      author: "Can S.",
      platform: "Google",
      content: "Kozbeyli'nin ruhunu yansıtan en iyi yer. Odalar tertemiz, servis harika. Dibek kahvesini içmeden dönmeyin.",
      date: "2024-03-01",
      rating: 5
    }
  ]
};
