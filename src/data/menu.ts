/**
 * Kozbeyli Konağı — Restoran Menüsü (tek doğruluk kaynağı)
 *
 * İçerik, işletmenin güncel menü kaynağından (kozbeyli-konagi-website /menu)
 * birebir senkronlanmıştır: 12 bölüm, 79 ürün. Fiyatlar kaynakta TL olarak
 * mevcuttur ve görüntülenen biçimiyle (tr-TR binlik ayraç + "TL") taşınmıştır.
 * Ürün ekleme/çıkarma veya fiyat değişikliği yalnızca bu dosyada yapılmalıdır.
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
        name: "Gurme Serpme Kahvaltı",
        description:
          "Sahanda tereyağlı sucuklu yumurta, avokado, kapya biber, Hatay kırma zeytin, çeşitli peynirler, ceviz, mevsim meyveleri, jalapenolu labne, acılı ezme, domates-salatalık söğüş, roka, zeytinyağı-zahter, taze pişi, lepena, köy ekmeği, bal, kaymak ve ev yapımı reçeller.",
        price: "750 TL",
      },
      {
        name: "Pişi Kahvaltı Tabağı",
        description:
          "2 adet sıcak pişi, beyaz ve tulum peynir, zeytinler, acılı ezme, reçel, domates ve salatalık.",
        price: "700 TL",
      },
      {
        name: "Fransız Kahvaltı",
        description:
          "2 adet kruvasan, beyaz ve tulum peynir, zeytinler, acılı ezme, reçel, domates, salatalık ve pesto.",
        price: "750 TL",
      },
      { name: "Pastırmalı Sahanda Yumurta", price: "650 TL" },
      { name: "Kavurmalı Sahanda Yumurta", price: "650 TL" },
      { name: "Mıhlama", price: "450 TL" },
      { name: "Sahanda Sucuklu Yumurta", price: "400 TL" },
      { name: "Sahanda Menemen", price: "350 TL" },
      { name: "Sigara Böreği (4 adet)", price: "300 TL" },
      { name: "Bal-Kaymak", price: "150 TL" },
    ],
  },
  {
    title: "Mezeler",
    note: "Antakya'dan Ege'ye",
    items: [
      {
        name: "Konağın Meze Tabağı",
        description:
          "2 kişilik, 5 çeşit: Atom, kuru cacık, deniz börülcesi, vişneli yaprak sarma, havuç tarator. Rustik ekmek eşliğinde. 2 kadeh Paşaeli seçkiniz ile.",
        price: "2.400 TL",
      },
      {
        name: "Tereyağlı Pastırmalı Antakya Humus",
        description: "Nohut-tahin humusu, üzerine tereyağında kızdırılmış pastırma.",
        price: "450 TL",
      },
      {
        name: "Avokadolu Kapya Biber",
        description: "Taze kapya biber ve avokado — hafif, renkli ve taze.",
        price: "350 TL",
      },
      {
        name: "Zeytinyağlı Vişneli Yaprak Sarma",
        description: "Asma yaprağında pirinç dolma, vişnenin ekşi-tatlı dengesiyle.",
        price: "350 TL",
      },
      { name: "Acılı Atom", price: "300 TL" },
      { name: "Deniz Börülcesi", price: "300 TL" },
      { name: "Haydari", price: "300 TL" },
    ],
  },
  {
    title: "Ara Sıcaklar & Başlangıçlar",
    note: "Gurme Deneyim",
    items: [
      {
        name: "Somon Havyarı",
        description:
          "Parlak turuncu somon havyarı taneleri buz üzerinde. Yoğun deniz aroması, pürüzsüz doku.",
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
          "Bakır tavada kızdırılmış Hatay künefelik peyniri, tereyağı ile sıcak servis.",
        price: "800 TL",
      },
      {
        name: "Antakya Usulü İçli Köfte (adet)",
        description: "İnce bulgur kabuğu, kıyma ve baharat dolgulu. Kızartılarak servis edilir.",
        price: "200 TL",
      },
      {
        name: "Roka Salatası",
        description: "Beyaz peynir, kuru incir, ceviz, balsamik glaze.",
        price: "400 TL",
      },
      { name: "Kasap Sosis & Baharatlı Patates", price: "600 TL" },
    ],
  },
  {
    title: "Napoliten Pizza & Sandviç",
    note: "Napoliten Pizza Geleneği",
    items: [
      {
        name: "Köy Usulü Konak Pizza",
        description:
          "Kasap sucuk, dana salam, dana cotto, dana bacon ve manda peyniri ile zenginleştirilmiş Napoliten hamur.",
        price: "900 TL",
      },
      {
        name: "Konak Tandır Pizza",
        description:
          "Uzun süre pişirilerek lif lif ayrılmış dana eti, Fior di Latte mozzarella, taze roka ve rende parmesan.",
        price: "1.000 TL",
      },
      {
        name: "Margherita Napoletana",
        description:
          "Roma tipi soyulmuş domates, Fior di Latte mozzarella, Grana Padano D.O.P., taze fesleğen, sızma zeytinyağı.",
        price: "750 TL",
      },
      {
        name: "Dana Kaburga Füme Etli Sandviç",
        description:
          "Rustik baget, dana kaburga füme et, beyaz peynir, domates, zeytinyağı ve yeşillik.",
        price: "750 TL",
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
          "Sulu ve orta pişmiş antrikot, ızgara izleriyle mühürlenir. Patates püresi, kavrulmuş file badem, baby havuç ve ızgara mısır.",
        price: "3.500 TL",
      },
      {
        name: "Lokum Bonfile",
        description:
          "Yumuşacık biftek, patates püresi tabanında, kavrulmuş file badem, baby havuç ve ızgara mısır.",
        price: "1.500 TL",
      },
      {
        name: "Sac Kavurma — Köy Usulü",
        description:
          "Dana kuşbaşı, sarımsak, soğan, domates ve biberle sacta kavrulmuş. Biberiyeli patates püresi.",
        price: "1.250 TL",
      },
      {
        name: "Izgara Pirzola",
        description:
          "Kemikli pirzola, ızgarada közlenmiş. Patates püresi, kavrulmuş file badem, baby havuç ve ızgara mısır.",
        price: "1.200 TL",
      },
      {
        name: "Konak Köfte",
        description: "Geleneksel tarifle hazırlanan köfteler, patates püresi ve kavrulmuş file badem.",
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
        description: "Kızartılmış hamur çubukları, çikolata sosu ve pudra şekeri.",
        price: "400 TL",
      },
      { name: "Vanilyalı Maraş Dondurma (2 top)", price: "300 TL" },
      {
        name: "Tatlı & Kahve Keyfi",
        description: "Herhangi bir tatlı + Türk Kahvesi — akşamın en güzel kapanışı.",
        price: "500 TL",
      },
    ],
  },
  {
    title: "Şaraplar",
    note: "Paşaeli Seçkisi",
    items: [
      {
        name: "Paşaeli SYS (Kadeh)",
        description: "Sıdalan 2024 — Sultaniye, Yapıncak, Sıdalan.",
        price: "600 TL",
      },
      { name: "Paşaeli SYS (Şişe)", price: "2.400 TL" },
      {
        name: "Bir Varmış Chardonnay (Kadeh)",
        description: "Chardonnay 2024. Somon havyarı, mantar eşleşmesi.",
        price: "800 TL",
      },
      { name: "Bir Varmış Chardonnay (Şişe)", price: "3.200 TL" },
      {
        name: "Paşaeli CSKS (Kadeh)",
        description: "Karasakız 2023 — Cab. Sauvignon, Karasakız.",
        price: "600 TL",
      },
      { name: "Paşaeli CSKS (Şişe)", price: "2.400 TL" },
      {
        name: "Paşaeli 6N (Kadeh)",
        description: "Kaz Dağları 2024 — Karasakız.",
        price: "800 TL",
      },
      { name: "Paşaeli 6N (Şişe)", price: "3.200 TL" },
      {
        name: "Morso di Sole (Kadeh)",
        description: "Buldan 2021 (50cl) — Sultaniye. Tatlı şarap.",
        price: "800 TL",
      },
      { name: "Morso di Sole (Şişe)", price: "3.500 TL" },
    ],
  },
  {
    title: "Rakı",
    note: "Meze Sofraları İçin",
    items: [
      { name: "Beylerbeyi Göbek Tek", price: "500 TL" },
      { name: "Beylerbeyi Göbek Duble", price: "700 TL" },
      { name: "Beylerbeyi Göbek 35cl", price: "2.350 TL" },
      { name: "Beylerbeyi Göbek 70cl", price: "3.600 TL" },
      { name: "Efe Gold Tek", price: "500 TL" },
      { name: "Efe Gold Duble", price: "700 TL" },
      { name: "Efe Gold 70cl", price: "3.600 TL" },
    ],
  },
  {
    title: "Kokteyl & Bira",
    note: "İmza Kokteyller",
    items: [
      {
        name: "Kuzu Kulağı",
        description: "Bitkisel, ekşimsi imza kokteyl.",
        price: "750 TL",
      },
      {
        name: "Wild Berry",
        description: "Meyveli, tatlı-ekşi.",
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
      { name: "Jack Daniel's 70cl", price: "4.300 TL" },
      { name: "Chivas Regal Tek", price: "600 TL" },
      { name: "Chivas Regal Duble", price: "1.000 TL" },
      { name: "Chivas Regal 70cl", price: "5.000 TL" },
    ],
  },
  {
    title: "İçecekler",
    note: "Sıcak & Soğuk",
    items: [
      { name: "Türk Kahvesi", price: "150 TL" },
      { name: "Karamelli Türk Kahvesi", price: "200 TL" },
      { name: "Filtre Kahve", price: "150 TL" },
      { name: "Espresso", price: "150 TL" },
      { name: "Ice Latte", price: "200 TL" },
      { name: "Sıcak Çikolata", price: "200 TL" },
      { name: "Salep", price: "250 TL" },
      { name: "Taze Sıkım Portakal Suyu", price: "250 TL" },
      { name: "Çay", price: "50 TL" },
      { name: "Ayran", price: "100 TL" },
      { name: "Kola / Fanta / Ice Tea", price: "150 TL" },
      { name: "Su (büyük)", price: "100 TL" },
    ],
  },
];
