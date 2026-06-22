import { menuSections, type MenuItem, type MenuSection } from "@/data/menu";

const sectionCopy: Record<string, { title: string; note?: string }> = {
  Kahvaltı: { title: "Breakfast", note: "A Kozbeyli Morning" },
  Mezeler: { title: "Mezes", note: "From Antakya to the Aegean" },
  "Ara Sıcaklar & Başlangıçlar": {
    title: "Warm Starters & Appetizers",
    note: "A Gourmet Beginning",
  },
  "Napoliten Pizza & Sandviç": {
    title: "Neapolitan Pizza & Sandwich",
    note: "Neapolitan Pizza Tradition",
  },
  "Peynir Tabakları": { title: "Cheese Boards", note: "Designed for Sharing" },
  "Ana Yemekler": { title: "Main Courses", note: "From the Mansion Fire" },
  Tatlılar: { title: "Desserts", note: "Sweet Closings" },
  Şaraplar: { title: "Wines", note: "Paşaeli Selection" },
  Rakı: { title: "Raki", note: "For Meze Tables" },
  "Kokteyl & Bira": { title: "Cocktails & Beer", note: "Signature Cocktails" },
  Viskiler: { title: "Whiskies", note: "After Dinner" },
  İçecekler: { title: "Beverages", note: "Hot & Cold" },
};

const itemCopy: Record<string, Partial<MenuItem>> = {
  "Gurme Serpme Kahvaltı (kişi başı)": {
    name: "Gourmet Village Breakfast (per person)",
    description:
      "Butter-fried eggs with sucuk, avocado, capia pepper, Hatay cracked olives, assorted cheeses, walnuts, seasonal fruit, jalapeno labneh, spicy ezme, tomato-cucumber, arugula, olive oil with zahter, fresh pişi, lepena, village bread, honey, clotted cream and house-made jams.",
  },
  "Pişi Kahvaltı Tabağı": {
    name: "Pişi Breakfast Plate",
    description:
      "Two warm pişi pastries with white and tulum cheeses, olives, spicy ezme, jam, tomato and cucumber.",
  },
  "Fransız Kahvaltı": {
    name: "French Breakfast",
    description:
      "Two croissants with white and tulum cheeses, olives, spicy ezme, jam, tomato, cucumber and pesto.",
  },
  "Pastırmalı Sahanda Yumurta": { name: "Pan-Fried Eggs with Pastirma" },
  "Kavurmalı Sahanda Yumurta": { name: "Pan-Fried Eggs with Roasted Beef" },
  "Mıhlama": { name: "Mıhlama" },
  "Sahanda Sucuklu Yumurta": { name: "Pan-Fried Eggs with Sucuk" },
  "Fransız Tereyağlı Kruvasan (2 Adet)": {
    name: "French Butter Croissants (2 pieces)",
    description: "Crisp croissants with sliced almonds. Served with jam or chocolate cream.",
  },
  "Sahanda Menemen": { name: "Pan-Fried Menemen" },
  "Patates Kızartması": { name: "French Fries" },
  "Omlet (sade / peynirli)": { name: "Omelette (plain / cheese)" },
  "Sahanda Peynirli Yumurta": { name: "Pan-Fried Eggs with Cheese" },
  "Fesleğenli Domatesli Ciabatta (4 adet)": { name: "Basil & Tomato Ciabatta (4 pieces)" },
  "Kare Rustik Ekmek": { name: "Square Rustic Bread" },
  "Sigara Böreği (4 adet)": { name: "Cheese Pastry Rolls (4 pieces)" },
  "Bal-Kaymak": { name: "Honey & Clotted Cream" },
  "Reçel (çeşit)": { name: "Jam Selection" },
  "Pişi (adet)": { name: "Pişi Pastry (per piece)" },
  "Çikolata Kreması": { name: "Chocolate Cream" },
  "Tereyağı": { name: "Butter" },
  "Çay": { name: "Tea" },
  "Türk Kahvesi": { name: "Turkish Coffee" },
  "Karamelli Türk Kahvesi": { name: "Caramel Turkish Coffee" },
  "Konağın Meze Tabağı (2 kişilik - 5 çeşit)": {
    name: "Mansion Meze Plate (for 2 - 5 varieties)",
    description:
      "Atom yoghurt dip, dried cucumber yoghurt, sea beans, cherry-stuffed vine leaves and carrot tarator, served with rustic bread. Finished with your choice of two Paşaeli glasses: SYS white or CSKS red.",
  },
  "Tereyağlı Pastırmalı Antakya Humus": {
    name: "Antakya Hummus with Butter & Pastirma",
    description: "Chickpea and tahini hummus finished with hot butter and pastirma.",
  },
  "Avokadolu Kapya Biber": {
    name: "Capia Pepper with Avocado",
    description: "Fresh capia pepper and avocado - light, colourful and fresh.",
  },
  "Zeytinyağlı Vişneli Yaprak Sarma": {
    name: "Cherry-Stuffed Vine Leaves in Olive Oil",
    description: "Rice-filled vine leaves balanced with the sweet-sour note of cherries.",
  },
  "Tek Porsiyon Mezeler": {
    name: "Single-Portion Mezes",
    description:
      "Choose from spicy atom, sea beans, haydari, dried cucumber yoghurt, spicy la pena, carrot tarator with yoghurt, aubergine with yoghurt or tomato hummus with olive oil.",
  },
  "Somon Havyarı": {
    name: "Salmon Caviar",
    description: "Bright orange salmon roe served chilled over ice, with a clean sea aroma and smooth texture.",
  },
  "Tereyağlı Jumbo Karides": {
    name: "Jumbo Shrimp in Butter",
    description: "Jumbo shrimp sauteed in butter with garlic and fresh herbs.",
  },
  "Hatay Usulü Kızarmış Peynir": {
    name: "Hatay-Style Fried Cheese",
    description: "Hot Hatay künefe cheese warmed in butter in a copper pan.",
  },
  "Antakya Usulü İçli Köfte (adet)": {
    name: "Antakya-Style Stuffed Köfte (per piece)",
    description: "Fine bulgur shell filled with minced beef and spices, served fried.",
  },
  "Paçanga Böreği (adet)": {
    name: "Paçanga Pastry (per piece)",
    description: "Thin pastry filled with pastirma and cheese, served fried.",
  },
  "Kaşarlı Mantar": {
    name: "Baked Mushrooms with Kaşar Cheese",
    description: "Fresh mushrooms baked with kaşar cheese.",
  },
  "Kasap Sosis & Baharatlı Çıtır Patates (2 adet sosis)": {
    name: "Butcher's Sausage & Spiced Crispy Potatoes (2 sausages)",
    description: "Thick butcher's sausages served with spiced fries.",
  },
  "Kızarmış Tavuk & Baharatlı Patates": {
    name: "Fried Chicken & Spiced Potatoes",
    description: "Crispy chicken pieces served with spiced potatoes.",
  },
  "Rustik Ekmek Üstü Füme Somon": {
    name: "Smoked Salmon on Rustic Bread",
    description: "Rustic bread topped with smoked salmon, cream cheese and capers.",
  },
  "Roka Salatası": {
    name: "Arugula Salad",
    description: "White cheese, dried figs, walnuts and balsamic glaze.",
  },
  "Başlangıç Tabağı (2 kişi)": {
    name: "Starter Plate (for 2)",
    description: "Olives, zahter, olive oil and rustic village bread.",
  },
  "Baharatlı Çıtır Patates": {
    name: "Spiced Crispy Potatoes",
    description: "Fried plain or spiced potatoes.",
  },
  "Parmesanlı Patates Kızartması": {
    name: "Parmesan Fries",
    description: "Crispy fries finished with grated parmesan.",
  },
  "Köy Usulü Konak Pizza": {
    name: "Village-Style Mansion Pizza",
    description:
      "Neapolitan dough enriched with butcher's sucuk, beef salami, beef cotto, beef bacon and buffalo cheese, finished with arugula, chilli olive oil and grated parmesan.",
  },
  "Konak Tandır Pizza": {
    name: "Mansion Tandoor Pizza",
    description:
      "Slow-cooked pulled beef with Fior di Latte mozzarella, fresh arugula and grated parmesan, served from the stone oven.",
  },
  "Kavurmalı Konak Pizza": {
    name: "Mansion Pizza with Roasted Beef",
    description:
      "Pan-roasted beef pieces, caramelized onion, roasted pepper and Fior di Latte mozzarella, finished with arugula, chilli olive oil and grated parmesan from the stone oven.",
  },
  "Margherita Napoletana": {
    name: "Margherita Napoletana",
    description:
      "Roman-style peeled tomato, Fior di Latte mozzarella, Grana Padano D.O.P., fresh basil and extra-virgin olive oil, served from the stone oven with arugula and grated parmesan.",
  },
  "Pizza Ekstraları": {
    name: "Pizza Extras",
    description:
      "Pesto sauce +100 TL, chilli garlic olive oil +100 TL, truffle mayonnaise +100 TL, truffle honey +150 TL, truffle olive oil +200 TL, arugula and parmesan finish +200 TL.",
  },
  "Dana Kaburga Füme Etli Sandviç": {
    name: "Smoked Beef Rib Sandwich",
    description:
      "Rustic baguette with smoked beef rib, white cheese, tomato, olive oil and greens.",
  },
  "Hindi Füme Etli Sandviç": {
    name: "Smoked Turkey Sandwich",
    description: "Rustic baguette with smoked turkey, white cheese, tomato, olive oil and greens.",
  },
  "Gurme Rustik Pesto Sandviç": {
    name: "Gourmet Rustic Pesto Sandwich",
    description: "Rustic baguette with white cheese, tomato, olive oil, arugula and pesto sauce, served with fries.",
  },
  "Gurme Rustik Avokado Sandviç": {
    name: "Gourmet Rustic Avocado Sandwich",
    description:
      "Rustic baguette with white cheese, tomato, olive oil, arugula and capia-pepper avocado, served with fries.",
  },
  "Rakı Eşlikçisi Peynir Tabağı": {
    name: "Cheese Board for Raki",
    description: "A carefully selected local cheese board designed for raki and meze conversations.",
  },
  "Türk Yerli Peynir & Şarap Tabağı": {
    name: "Turkish Local Cheese & Wine Board",
    description: "A sharing board of local cheeses paired with wine.",
  },
  "Dallas Steak": {
    name: "Dallas Steak",
    description:
      "Juicy medium-cooked rib steak with grill marks, served with mashed potato, toasted sliced almonds, baby carrots and grilled corn.",
  },
  "Lokum Bonfile": {
    name: "Tenderloin Lokum",
    description:
      "Soft beef tenderloin over mashed potato with toasted sliced almonds, baby carrots and grilled corn.",
  },
  "Sac Kavurma - Köy Usulü": {
    name: "Village-Style Sac Kavurma",
    description:
      "Cubed beef roasted on a traditional metal griddle with garlic, onion, tomato and peppers, served with rosemary mashed potato.",
  },
  "Izgara Pirzola": {
    name: "Grilled Lamb Chops",
    description:
      "Bone-in chops grilled over heat with mashed potato, toasted sliced almonds, baby carrots and grilled corn.",
  },
  "Konağın Sac Kavurması": {
    name: "Mansion Sac Kavurma",
    description: "Tender beef pieces cooked on a copper griddle, served over mashed potato with toasted sliced almonds.",
  },
  "Konak Köfte": {
    name: "Mansion Köfte",
    description: "Traditional köfte served with mashed potato and toasted sliced almonds.",
  },
  "Antep Fıstıklı Katmer": {
    name: "Pistachio Katmer",
    description:
      "Thin pastry layers with generous Antep pistachio, butter and clotted cream, served with vanilla Maraş ice cream.",
  },
  "Antakya Künefe": {
    name: "Antakya Künefe",
    description:
      "Fine kadayıf pastry with melting cheese and syrup, finished with pistachio and clotted cream.",
  },
  "Churros": {
    name: "Churros",
    description: "Fried pastry sticks served with chocolate sauce and powdered sugar.",
  },
  "Çikolatalı Mini Berliner (2 adet)": {
    name: "Chocolate Mini Berliners (2 pieces)",
    description: "Mini dough balls served with chocolate sauce.",
  },
  "Vanilyalı Maraş Dondurma (2 top)": {
    name: "Vanilla Maraş Ice Cream (2 scoops)",
    description: "Classic vanilla ice cream for a refreshing finish.",
  },
  "Tatlı & Kahve Keyfi": {
    name: "Dessert & Coffee Ritual",
    description: "Any dessert with Turkish coffee - a refined evening close.",
  },
  "Beyaz Şarap Tadımı": {
    name: "White Wine Tasting",
    description:
      "Paşaeli SYS + Bir Varmış Bir Yokmuş Chardonnay (one glass) with a mini cheese board.",
  },
  "Kırmızı Şarap Tadımı": {
    name: "Red Wine Tasting",
    description: "Paşaeli CSKS (one glass) with a mini cheese board.",
  },
  "Paşaeli SYS": {
    name: "Paşaeli SYS",
    description: "Sıdalan 2024 - Sultaniye, Yapıncak and Sıdalan. Paired with mezes, starters, cheese and pizza.",
    price: "Glass 600 TL / Bottle 2,400 TL",
  },
  "Bir Varmış Bir Yokmuş Chardonnay": {
    name: "Bir Varmış Bir Yokmuş Chardonnay",
    description: "Chardonnay 2024. Paired with salmon caviar and mushrooms.",
    price: "Glass 800 TL / Bottle 3,200 TL",
  },
  "Paşaeli CSKS": {
    name: "Paşaeli CSKS",
    description: "Karasakız 2023 - Cabernet Sauvignon and Karasakız. Paired with pizza, sandwiches, red meat and köfte.",
    price: "Glass 600 TL / Bottle 2,400 TL",
  },
  "Paşaeli 6N": {
    name: "Paşaeli 6N",
    description: "Kaz Mountains 2024 - Karasakız. A versatile pairing for pizza, köfte, white meat and cheese.",
    price: "Glass 800 TL / Bottle 3,200 TL",
  },
  "Morso di Sole": {
    name: "Morso di Sole",
    description: "Buldan 2021 (50cl) - Sultaniye. Paired with künefe, katmer and cheese boards.",
    price: "Glass 800 TL / Bottle 3,500 TL",
  },
  "İthal Şarap Seçkisi": {
    name: "Imported Wine Selection",
    description:
      "A limited number of carefully selected imported wines are available. Please ask our service team for the current selection and prices.",
  },
  "Beylerbeyi Göbek Tek": { name: "Beylerbeyi Göbek Single" },
  "Beylerbeyi Göbek Duble": { name: "Beylerbeyi Göbek Double" },
  "Efe Gold Tek": { name: "Efe Gold Single" },
  "Efe Gold Duble": { name: "Efe Gold Double" },
  "Kuzu Kulağı": {
    name: "Kuzu Kulağı",
    description: "A herbal, lightly sour signature cocktail.",
  },
  "Wild Berry": {
    name: "Wild Berry",
    description: "A fruity signature cocktail with a sweet-sour finish.",
  },
  "Blanc (buğday birası)": { name: "Blanc Wheat Beer" },
  "Jack Daniel's Tek": { name: "Jack Daniel's Single" },
  "Jack Daniel's Duble": { name: "Jack Daniel's Double" },
  "Chivas Regal Tek": { name: "Chivas Regal Single" },
  "Chivas Regal Duble": { name: "Chivas Regal Double" },
  "Filtre Kahve": { name: "Filter Coffee" },
  "Sıcak Çikolata": { name: "Hot Chocolate" },
  "Termos Çay": { name: "Tea Thermos" },
  "Bitki Çayları": { name: "Herbal Teas" },
  "Mango Ananas Bitki Çayı": { name: "Mango & Pineapple Herbal Tea" },
  "Taze Sıkım Portakal Suyu": { name: "Fresh Orange Juice" },
  "Niğde Gazozu": { name: "Niğde Soda" },
  "Su (küçük)": { name: "Water (small)" },
  "Su (büyük)": { name: "Water (large)" },
};

export const englishMenuSections: MenuSection[] = menuSections.map((section) => ({
  title: sectionCopy[section.title]?.title ?? section.title,
  note: sectionCopy[section.title]?.note ?? section.note,
  items: section.items.map((item) => ({
    ...item,
    ...(itemCopy[item.name] ?? {}),
  })),
}));
