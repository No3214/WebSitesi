/**
 * Kozbeyli Konagi - Restoran Menusu (tek dogruluk kaynagi)
 *
 * 2026-07-02: isletmenin guncel canli menu sayfasindan senkronlandi
 * (owner talebi: "menudeki fiyatlar orada guncel"). Degisiklik ozeti:
 * serpme 750->850, yeni kalemler (Fransiz Kahvalti, pastirmali/kavurmali
 * yumurta, Hatay kizarmis peynir, parmesanli patates, Napoliten pizzalar,
 * hindi fume sandvic, koy usulu sac kavurma, termos cay, mango ananas cayi,
 * Caprisun), kaldirilanlar (Kalamar, eski tas firin pizzalar, pizza+sarap
 * kombolari, Woodford Reserve), raki 35-100cl ve sise sarap zamlari.
 * Kaynaktaki kcal/alerjen/eslesme rozetleri tasinmadi; urun+fiyat esastir.
 */

export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
};

export type MenuSection = {
  title: string;
  note?: string;
  items: MenuItem[];
};

export const menuSections: MenuSection[] = [
  {
    title: "Kahvaltı",
    note: "Kozbeyli'de Güne Başlamak",
    items: [
      {
        name: "Gurme Serpme Kahvaltı (kişi başı)",
        description:
          "Sahanda tereyağlı sucuklu yumurta, avokado, Hatay kırma zeytin, çeşitli peynirler, ceviz, mevsim meyveleri, jalapenolu labne, acılı ezme, taze pişi, köy ekmeği, bal, kaymak ve ev yapımı reçeller.",
        price: "850 TL",
      },
      {
        name: "Pişi Kahvaltı Tabağı",
        description:
          "2 adet sıcak pişi, beyaz ve tulum peynir, zeytinler, acılı ezme, reçel, domates ve salatalık.",
        price: "700 TL",
      },
      { name: "Fransız Kahvaltı", price: "750 TL" },
      { name: "Pastırmalı Sahanda Yumurta", price: "650 TL" },
      { name: "Kavurmalı Sahanda Yumurta", price: "650 TL" },
      { name: "Mıhlama", price: "450 TL" },
      { name: "Sahanda Sucuklu Yumurta", price: "400 TL" },
      { name: "Fransız Tereyağlı Kruvasan (2 Adet)", price: "400 TL" },
      { name: "Sahanda Menemen", price: "350 TL" },
      { name: "Patates Kızartması", price: "350 TL" },
      { name: "Omlet (sade / peynirli)", price: "350 TL" },
      { name: "Sahanda Peynirli Yumurta", price: "350 TL" },
      { name: "Fesleğenli Domatesli Ciabatta (4 adet)", price: "300 TL" },
      { name: "Kare Rustik Ekmek", price: "300 TL" },
      { name: "Sigara Böreği (4 adet)", price: "300 TL" },
      { name: "Bal-Kaymak", price: "150 TL" },
      { name: "Reçel (çeşit)", price: "150 TL" },
      { name: "Pişi (adet)", price: "100 TL" },
      { name: "Dulce De Leche", price: "100 TL" },
      { name: "Çikolata Kreması", price: "100 TL" },
      { name: "Tereyağı", price: "50 TL" },
      { name: "Çay", price: "50 TL" },
      { name: "Türk Kahvesi", price: "150 TL" },
      { name: "Karamelli Türk Kahvesi", price: "200 TL" },
    ],
  },
  {
    title: "Mezeler",
    note: "Antakya'dan Ege'ye",
    items: [
      {
        name: "Konağın Meze Tabağı (2 kişilik - 5 çeşit)",
        description:
          "Atom, kuru cacık, deniz börülcesi, vişneli yaprak sarma, havuç tarator. Rustik ekmek eşliğinde.",
        price: "3.200 TL",
      },
      {
        name: "Tereyağlı Pastırmalı Antakya Humus",
        description: "Nohut-tahin humusu, üzerine tereyağında kızdırılmış pastırma.",
        price: "450 TL",
      },
      {
        name: "Avokadolu Kapya Biber",
        description: "Taze kapya biber ve avokado - hafif, renkli ve taze.",
        price: "350 TL",
      },
      {
        name: "Zeytinyağlı Vişneli Yaprak Sarma",
        description: "Asma yaprağında pirinç dolma, vişnenin ekşi-tatlı dengesiyle.",
        price: "350 TL",
      },
      {
        name: "Tek Porsiyon Mezeler",
        description:
          "Acılı Atom, Deniz Börülcesi, Haydari, Kuru Cacık, La Pena (Acılı), Yoğurtlu Havuç Tarator, Yoğurtlu Patlıcan veya Zeytinyağlı Domatesli Humus.",
        price: "300 TL",
      },
    ],
  },
  {
    title: "Ara Sıcaklar & Başlangıçlar",
    note: "Gurme Deneyim",
    items: [
      {
        name: "Somon Havyarı",
        description:
          "Parlak turuncu somon havyarı taneleri buz üzerinde tazeliğini korur. Yoğun deniz aroması, pürüzsüz doku.",
        price: "3.000 TL",
      },
      {
        name: "Tereyağlı Jumbo Karides",
        description: "Tereyağında sotelenen jumbo karides, sarımsak ve taze otlar ile.",
        price: "850 TL",
      },
      {
        name: "Hatay Usulü Kızarmış Peynir",
        description:
          "Bakır tavada kızdırılmış Hatay künefelik peyniri, tereyağı ile sıcak servis edilir.",
        price: "800 TL",
      },
      {
        name: "Kızarmış Tavuk & Baharatlı Patates",
        description: "Çıtır tavuk parçaları, baharatlı patates eşliğinde.",
        price: "650 TL",
      },
      {
        name: "Kasap Sosis & Baharatlı Çıtır Patates (2 adet sosis)",
        description: "Kalın kasap sosisi, baharatlı patates kızartması ile.",
        price: "600 TL",
      },
      {
        name: "Rustik Ekmek Üstü Füme Somon",
        description: "Rustik ekmek, füme somon, krem peynir, kapari.",
        price: "500 TL",
      },
      {
        name: "Kaşarlı Mantar",
        description: "Taze mantarlar, kaşar peyniri ile fırınlanmış.",
        price: "450 TL",
      },
      {
        name: "Tereyağlı Pastırmalı Antakya Humus",
        description: "Nohut-tahin humusu, üzerine tereyağında kızdırılmış pastırma.",
        price: "450 TL",
      },
      {
        name: "Parmesanlı Patates Kızartması",
        description: "Çıtır patates, rende parmesan ile.",
        price: "450 TL",
      },
      {
        name: "Roka Salatası",
        description: "Roka, beyaz peynir, kuru incir, ceviz, balsamik glaze.",
        price: "400 TL",
      },
      {
        name: "Başlangıç Tabağı (2 kişi)",
        description: "Zeytin, zahter, zeytinyağı, rustik köy ekmeği.",
        price: "350 TL",
      },
      {
        name: "Baharatlı Çıtır Patates",
        description: "Baharatlı veya sade, kızartılmış.",
        price: "350 TL",
      },
      {
        name: "Antakya Usulü İçli Köfte (adet)",
        description: "İnce bulgur kabuğu, kıyma ve baharat dolgulu. Kızartılarak servis edilir.",
        price: "200 TL",
      },
      {
        name: "Paçanga Böreği (adet)",
        description: "Pastırma ve peynir dolgulu, ince yufkada kızartılmış.",
        price: "200 TL",
      },
    ],
  },
  {
    title: "Napoliten Pizza & Sandviç",
    note: "Napoliten Pizza Geleneği",
    items: [
      { name: "Konak Tandır Pizza", price: "1.000 TL" },
      { name: "Kavurmalı Konak Pizza", price: "950 TL" },
      { name: "Köy Usulü Konak Pizza", price: "900 TL" },
      { name: "Margherita Napoletana", price: "750 TL" },
      {
        name: "Pizza Ekstraları",
        description:
          "Pesto Sos +100, Acılı Sarımsaklı Zeytinyağı +100, Trüflü Mayonez +100, Trüflü Bal +150, Trüflü Zeytinyağı +200, Roka & Parmesan Yağmuru +200.",
      },
      {
        name: "Dana Kaburga Füme Etli Sandviç",
        description:
          "Rustik baget, dana kaburga füme et, beyaz peynir, domates, zeytinyağı ve yeşillik.",
        price: "750 TL",
      },
      {
        name: "Hindi Füme Etli Sandviç",
        description:
          "Rustik baget, hindi füme et, beyaz peynir, domates, zeytinyağı ve yeşillik.",
        price: "750 TL",
      },
      {
        name: "Gurme Rustik Pesto Sandviç",
        description:
          "Rustik baget, beyaz peynir, roka, pesto sosu. Patates kızartması eşliğinde.",
        price: "700 TL",
      },
      {
        name: "Gurme Rustik Avokado Sandviç",
        description:
          "Rustik baget, beyaz peynir, roka, kapya biberli avokado. Patates kızartması eşliğinde.",
        price: "700 TL",
      },
    ],
  },
  {
    title: "Peynir Tabakları",
    note: "Paylaşmak İçin",
    items: [
      {
        name: "Rakı Eşlikçisi Peynir Tabağı",
        description: "Rakı ile uyum sağlayan özenle seçilmiş yerli peynirler.",
        price: "800 TL",
      },
      {
        name: "Türk Yerli Peynir & Şarap Tabağı",
        description: "Çeşitli yerli peynirlerin şarapla buluştuğu keyifli bir paylaşım tabağı.",
        price: "1.000 TL",
      },
    ],
  },
  {
    title: "Ana Yemekler",
    note: "Konağın Ateşinden",
    items: [
      {
        name: "Dallas Steak",
        description:
          "Sulu ve orta pişmiş antrikot, ızgara izleriyle mühürlenir. Altın rengi patates püresi, ızgara mısır ve havuç eşliğinde.",
        price: "3.500 TL",
      },
      {
        name: "Lokum Bonfile",
        description:
          "Yumuşacık biftek, patates püresi tabanında, ızgara mısır ve havuç, kavrulmuş file badem.",
        price: "1.500 TL",
      },
      {
        name: "Sac Kavurma - Köy Usulü",
        price: "1.250 TL",
      },
      {
        name: "Izgara Pirzola",
        description:
          "Kemikli pirzola, ızgarada közlenmiş. Patates püresi, kavrulmuş file badem.",
        price: "1.200 TL",
      },
      {
        name: "Konağın Sac Kavurması",
        description:
          "Bakır saçta pişirilen lezzetli et parçaları, patates püresi tabanı ve kavrulmuş file badem.",
        price: "1.000 TL",
      },
      {
        name: "Konak Köfte",
        description:
          "Geleneksel tarifle hazırlanan köfteler, patates püresi ve kavrulmuş file badem ile.",
        price: "800 TL",
      },
    ],
  },
  {
    title: "Tatlılar",
    note: "Tatlı Kapanışlar",
    items: [
      {
        name: "Antep Fıstıklı Katmer",
        description:
          "İnce yufka katmanları, bol Antep fıstığı, tereyağı ve kaymağın kremamsı dokusu. Vanilyalı Maraş dondurma eşliğinde.",
        price: "400 TL",
      },
      {
        name: "Antakya Künefe",
        description: "İncecik tel kadayıf arasında eriyen peynir ve şerbet. Fıstık ve kaymak.",
        price: "400 TL",
      },
      {
        name: "Churros",
        description: "Kızartılmış hamur çubukları, çikolata sosu ve pudra şekeri ile servis edilir.",
        price: "400 TL",
      },
      {
        name: "Fransız Tereyağlı Kruvasan (2 Adet)",
        description: "Çıtır kruvasan, file bademlerle. Reçel veya Çikolata Kreması.",
        price: "400 TL",
      },
      {
        name: "Çikolatalı Mini Berliner (2 adet)",
        description: "Çikolata soslu mini hamur topları.",
        price: "300 TL",
      },
      {
        name: "Vanilyalı Maraş Dondurma (2 top)",
        description: "Klasik vanilya, serinletici bir kapanış.",
        price: "300 TL",
      },
      {
        name: "Tatlı & Kahve Keyfi",
        description: "Herhangi bir tatlı + Türk Kahvesi - akşamı en güzel kapatan ikili.",
        price: "500 TL",
      },
    ],
  },
  {
    title: "Şaraplar",
    note: "Paşaeli Seçkisi",
    items: [
      {
        name: "Beyaz Şarap Tadımı",
        description:
          "Paşaeli SYS + Bir Varmış Bir Yokmuş Chardonnay (1 kadeh) + Mini peynir tabağı",
        price: "1.600 TL",
      },
      {
        name: "Kırmızı Şarap Tadımı",
        description: "Paşaeli CSKS (1 kadeh) + Mini peynir tabağı",
        price: "1.600 TL",
      },
      {
        name: "Paşaeli SYS",
        description: "Sıdalan 2024. Sultaniye, Yapıncak, Sıdalan. Meze, başlangıç, peynir, pizza",
        price: "Kadeh 600 TL / Şişe 2.400 TL",
      },
      {
        name: "Bir Varmış Bir Yokmuş Chardonnay",
        description: "Chardonnay 2024. Somon havyarı, mantar",
        price: "Kadeh 800 TL / Şişe 3.200 TL",
      },
      {
        name: "Paşaeli CSKS",
        description: "Karasakız 2023. Cab. Sauvignon, Karasakız. Pizza, sandviç, kırmızı et, köfte",
        price: "Kadeh 600 TL / Şişe 2.400 TL",
      },
      {
        name: "Paşaeli 6N",
        description: "Kaz Dağları 2024. Karasakız. Çok yönlü eşleşme: pizza, köfte, beyaz et, peynir",
        price: "Kadeh 800 TL / Şişe 3.200 TL",
      },
      {
        name: "Morso di Sole",
        description: "Buldan 2021 (50cl). Sultaniye. Künefe, katmer, peynir tabağı",
        price: "Kadeh 800 TL / Şişe 3.500 TL",
      },
      {
        name: "İthal Şarap Seçkisi",
        description:
          "Konağımızda sınırlı sayıda özenle seçilmiş ithal şaraplar bulunmaktadır. Güncel seçki ve fiyat bilgisi için servis ekibimize danışınız.",
      },
    ],
  },
  {
    title: "Rakı",
    note: "Meze Sofraları İçin",
    items: [
      { name: "Beylerbeyi Göbek Tek", price: "500 TL" },
      { name: "Beylerbeyi Göbek Duble", price: "700 TL" },
      { name: "Beylerbeyi Göbek 35cl", price: "2.350 TL" },
      { name: "Beylerbeyi Göbek 50cl", price: "2.850 TL" },
      { name: "Beylerbeyi Göbek 70cl", price: "3.600 TL" },
      { name: "Beylerbeyi Göbek 100cl", price: "4.600 TL" },
      { name: "Efe Gold Tek", price: "500 TL" },
      { name: "Efe Gold Duble", price: "700 TL" },
      { name: "Efe Gold 35cl", price: "2.350 TL" },
      { name: "Efe Gold 50cl", price: "2.850 TL" },
      { name: "Efe Gold 70cl", price: "3.600 TL" },
      { name: "Efe Gold 100cl", price: "4.600 TL" },
    ],
  },
  {
    title: "Kokteyl & Bira",
    note: "İmza Kokteyller",
    items: [
      {
        name: "Kuzu Kulağı",
        description: "Bitkisel, ekşimsi",
        price: "750 TL",
      },
      {
        name: "Wild Berry",
        description: "Meyveli, tatlı-ekşi",
        price: "750 TL",
      },
      { name: "Blanc (buğday birası)", price: "275 TL" },
      { name: "Carlsberg", price: "250 TL" },
      { name: "Tuborg Gold", price: "250 TL" },
    ],
  },
  {
    title: "Viskiler",
    note: "Akşam Yemeği Sonrası",
    items: [
      { name: "Jack Daniel's Tek", price: "500 TL" },
      { name: "Jack Daniel's Duble", price: "800 TL" },
      { name: "Jack Daniel's 35cl", price: "2.500 TL" },
      { name: "Jack Daniel's 70cl", price: "4.300 TL" },
      { name: "Chivas Regal Tek", price: "600 TL" },
      { name: "Chivas Regal Duble", price: "1.000 TL" },
      { name: "Chivas Regal 35cl", price: "3.000 TL" },
      { name: "Chivas Regal 70cl", price: "5.000 TL" },
    ],
  },
  {
    title: "İçecekler",
    note: "Sıcak & Soğuk",
    items: [
      { name: "Çay", price: "50 TL" },
      { name: "Termos Çay", price: "400 TL" },
      { name: "Türk Kahvesi", price: "150 TL" },
      { name: "Espresso", price: "150 TL" },
      { name: "Americano", price: "150 TL" },
      { name: "Filtre Kahve", price: "150 TL" },
      { name: "Bitki Çayları", price: "150 TL" },
      { name: "Mango Ananas Bitki Çayı", price: "200 TL" },
      { name: "Ice Latte", price: "200 TL" },
      { name: "Ice Americano", price: "200 TL" },
      { name: "Taze Sıkım Portakal Suyu", price: "250 TL" },
      { name: "Kola", price: "150 TL" },
      { name: "Fanta", price: "150 TL" },
      { name: "Ice Tea", price: "150 TL" },
      { name: "Caprisun Safari Fruit", price: "150 TL" },
      { name: "Niğde Gazozu", price: "150 TL" },
      { name: "Soda", price: "100 TL" },
      { name: "Ayran", price: "100 TL" },
      { name: "Su (küçük)", price: "50 TL" },
      { name: "Su (büyük)", price: "100 TL" },
      { name: "Sıcak Çikolata", price: "200 TL" },
      { name: "Salep", price: "250 TL" },
    ],
  },
];
