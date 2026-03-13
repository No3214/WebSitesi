/**
 * Autonomous Content Agent
 * Generates brand-aligned updates based on environmental and seasonal factors.
 */
export const ContentAgent = {
  getDailyMood: (weather: string = "Sunny") => {
    const moods = [
      {
        condition: "Sunny",
        update: "Foça'da güneş taş duvarlarımızı ısıtırken, avlumuzda sakız ağaçlarının gölgesinde bir Slow Living günü sizi bekliyor.",
        gastronomy_tip: "Bugün terasımızda soğuk sıkım zeytinyağlılarımız ve buz gibi bir koruk şerbeti tam vaktinde."
      },
      {
        condition: "Rainy",
        update: "Taş şöminemizin başında, 500 yıllık tarihin huzurunu yağmurun sesiyle dinlemek için mükemmel bir gün.",
        gastronomy_tip: "Sıcak bir dibek kahvesi ve İnci Hanım'ın fırından yeni çıkmış anne kurabiyeleri ruhunuzu ısıtacak."
      }
    ];

    const currentMood = moods.find(m => m.condition === weather) || moods[0];
    return currentMood;
  },

  generateHeritageSnippet: () => {
    const snippets = [
      "Horasan harcıyla nefes alan odalarımızda, 19. yüzyılın tüccar mirasını bugünün konforuyla birleştiriyoruz.",
      "Kozbeyli Konağı, sadece bir durak değil; zamanın yavaş aktığı bir 'Living Museum' deneyimidir."
    ];
    return snippets[Math.floor(Math.random() * snippets.length)];
  }
};
