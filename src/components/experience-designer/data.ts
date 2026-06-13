"use client";

import { Calendar, Compass, Coffee } from "lucide-react";

// Adım 1: Süre seçenekleri
export interface DurationOption {
  id: number;
  label: string;
  desc: string;
  days: number;
  image: string;
}

export const durations: DurationOption[] = [
  {
    id: 1,
    label: "1 Günlük Yoğun Kaçış",
    desc: "Kozbeyli'de kısa ama derinlemesine bir yavaş yaşam soluklanması.",
    days: 1,
    image: "/images/galeri/tas-cephe.jpg"
  },
  {
    id: 2,
    label: "2 Günlük Sükunet Rotası",
    desc: "Zamanı yavaşlatıp konağın ruhunu ve avluyu tam olarak hissedeceğiniz ideal süre.",
    days: 2,
    image: "/images/hero-video-poster.jpg"
  },
  {
    id: 3,
    label: "3 Günlük Derin Dinlenme",
    desc: "Köy yollarından deniz turlarına, gastronomi ritüellerinden şömine başına tam arınma.",
    days: 3,
    image: "/images/odalar/superrior-3-kisilik-oda-deniz-manzarali/5.jpg"
  }
];

// Adım 2: İlgi alanı seçenekleri
export interface InterestOption {
  id: string;
  title: string;
  desc: string;
  icon: typeof Coffee;
  image: string;
}

export const interests: InterestOption[] = [
  {
    id: "gastronomi",
    title: "Gastronomi & Gurme Lezzetler",
    desc: "İnci Hanım'ın Antakya-Ege reçeteleri, el yapımı zeytinyağları ve taş fırın tatları.",
    icon: Coffee,
    image: "/images/galeri/aksam-sofrasi.jpg"
  },
  {
    id: "romantizm",
    title: "Romantizm & Sükunet",
    desc: "Ege Denizi üzerinden batan güneş eşliğinde baş başa, özel ve sakin anlar.",
    icon: Compass,
    image: "/images/odalar/superrior-oda-deniz-manzarali/1.jpg"
  },
  {
    id: "kultur",
    title: "Miras & Tarih Keşfi",
    desc: "500 yıllık tescilli taş mimari, restorasyon sırları ve Foça'nın antik liman izleri.",
    icon: Calendar,
    image: "/images/galeri/konagin-yuzu.jpg"
  }
];

// Adım 3: Tempo seçenekleri
export interface PaceOption {
  id: string;
  label: string;
  desc: string;
  image: string;
}

export const paces: PaceOption[] = [
  {
    id: "yavas",
    label: "Çok Yavaş (Aşırı Dinlendirici)",
    desc: "Bolca avlu vakti, kitap okuma köşeleri, şömine başı dinlenme ve minimum hareket.",
    image: "/images/odalar/detay/oda-detay-1.jpg"
  },
  {
    id: "dengeli",
    label: "Dengeli (Keşif ve Dinlenme)",
    desc: "Köy sokaklarında yavaş turlar, taş dibek ritüeli ve Foça tekne gezileri ile harmanlanmış tempo.",
    image: "/images/organizasyonlar/teras-davet.jpg"
  }
];

// Dinamik rota veritabanı
export interface ItineraryItem {
  time: string;
  activity: string;
  details: string;
}

export const itineraryDb: Record<string, Record<string, ItineraryItem[]>> = {
  gastronomi: {
    yavas: [
      { time: "09:30", activity: "İnci Hanım'ın Gurme Kahvaltısı", details: "Konak avlusunda taş fırından yeni çıkmış sıcak pideler, Antakya halhalı zeytini ve el yapımı zeytinyağlı Ege ezmeleri." },
      { time: "11:30", activity: "Asırlık Zeytin Ağacı Altında Dinlenme", details: "Zeytin ağaçlarının gölgesinde organik soğuk sıkım zeytinyağı tadımı ve özel zeytinyağı hikayeleri söyleşisi." },
      { time: "14:30", activity: "Taş Dibek Ritüeli & Kahve Saati", details: "180 yıllık tarihi taş dibekte taze kahve çekirdeklerinin dövülme ritüelini izleme ve taze pişmiş köpüklü dibek kahvesi tadımı." },
      { time: "17:00", activity: "Şömine veya Avluda Çay Saati", details: "İnci Hanım'ın elleriyle hazırladığı mevsimlik zeytin reçeli ve lavanta aromalı konak kurabiyeleri eşliğinde çay." },
      { time: "19:30", activity: "Konak Avlusunda Meze & Akşam Yemeği", details: "Ağır ateşte pişmiş Antakya sac kavurması, fırınlanmış Ege otları ve yerel soğuk mezeler eşliğinde loş ışıkta gurme deneyimi." }
    ],
    dengeli: [
      { time: "09:00", activity: "Konak Serpme Kahvaltısı", details: "Antakya tereyağı, taze sağım köy peynirleri ve odun ateşinde pişmiş yöresel sıcaklar eşliğinde geniş Ege kahvaltısı." },
      { time: "11:00", activity: "Kozbeyli Köyü Gurme Yürüyüşü", details: "Köy içindeki eski zeytinyağı fabrikalarını ve asırlık taş yapıları ziyaret; yerel üreticilerden organik ürün alışverişi." },
      { time: "14:00", activity: "Taş Dibek Ritüeli & Kahve Deneyimi", details: "Dibekte kahve dövme ritüeline bizzat katılım ve dibek kahvesinin yapılış sırları üzerine kısa atölye çalışması." },
      { time: "16:00", activity: "Foça Zeytinlikleri Gezisi", details: "Aracımızla 10 dakika mesafedeki asırlık zeytin bahçelerine gidiş ve hasat gelenekleri üzerine rehberli tur." },
      { time: "19:30", activity: "Tadımlık Akşam Yemeği", details: "Özel Antakya tepsisi, Ege otlu mücver ve nar ekşili özel salatalardan oluşan mevsimsel şef menüsü." }
    ]
  },
  romantizm: {
    yavas: [
      { time: "10:00", activity: "Odaya Özel Geç Kahvaltı", details: "Odada veya oda önündeki özel taş balkonda, çiftlere özel hazırlanmış sıcak gurme kahvaltı servisi." },
      { time: "13:00", activity: "Gaz Lambası Altında Kitap & Müzik", details: "Konağın kütüphanesinden seçilen şiir kitapları eşliğinde pikapta nostaljik Ege ezgileri dinleme." },
      { time: "15:30", activity: "Zeytinyağlı Aromaterapi & Sıcak Küvet", details: "Superior odanızdaki özel küvette zeytinyağı ve dağ adaçayı esanslarıyla hazırlanmış rahatlatıcı banyo ritüeli." },
      { time: "18:00", activity: "Gün Batımı Teras Keyfi", details: "Terasımızda Ege Denizi üzerinden batan güneşe karşı zeytin ve peynir tabağı eşliğinde gün batımı izleme." },
      { time: "20:00", activity: "Mum Işığında Avlu Yemeği", details: "Konak avlusunun en kuytu köşesinde, mum ışığında ve hafif müzik eşliğinde baş başa akşam yemeği." }
    ],
    dengeli: [
      { time: "09:00", activity: "Konak Avlusunda Kahvaltı", details: "Kuş sesleri ve taze çiçek kokuları eşliğinde avlunun en güzel masasında zengin serpme kahvaltı." },
      { time: "11:30", activity: "Foça Sahili & Sakin Koylar Turu", details: "Konağa 12 km mesafedeki Eski Foça'nın sakin koylarında yürüyüş ve deniz havası alma." },
      { time: "15:00", activity: "Kozbeyli Köyü Fotoğraf Rotası", details: "Köyün dar ve otantik taş sokaklarında profesyonel rehber eşliğinde en güzel anları ölümsüzleştirme yürüyüşü." },
      { time: "17:30", activity: "Kişiselleştirilmiş Gün Batımı Seyri", details: "Kozbeyli'nin en yüksek seyir tepesine gidiş ve gün batımının eşsiz kızıllığını izleme ritüeli." },
      { time: "20:00", activity: "Avlu Şöminesi Başında Akşam Yemeği", details: "Açık hava şöminesi başında, ateş çıtırtıları eşliğinde özenle hazırlanmış gurme lezzetler." }
    ]
  },
  kultur: {
    yavas: [
      { time: "09:30", activity: "Miras Kahvaltısı", details: "Konağın tarihi geçmişini yansıtan geleneksel lezzetler ve ev yapımı reçellerle kahvaltı." },
      { time: "11:00", activity: "Konak Mimarisi & Restorasyon Turu", details: "500 yıllık Horasan harcının hikayesi, tescilli taş kemerler ve binanın restorasyon serüveni üzerine özel sunum." },
      { time: "14:00", activity: "Miras Arşivi İncelemesi", details: "Konağın zemin katındaki taş mahzenleri ziyaret, eski ithal küpleri ve tarihi araç gereçleri inceleme seansı." },
      { time: "16:30", activity: "Tarihi Dibek Söyleşileri", details: "Köyün yaşlıları ve tarihçileriyle konak avlusunda kahve eşliğinde Kozbeyli'nin kuruluşu üzerine sohbet." },
      { time: "19:30", activity: "Tarih Kokan Akşam Yemeği", details: "Osmanlı saray mutfağından esinlenilmiş, taş fırında yavaş pişmiş kuzu incik ve geleneksel şerbet tadımı." }
    ],
    dengeli: [
      { time: "09:00", activity: "Ege Serpme Kahvaltısı", details: "Tarihi taş duvarların gölgesinde, taze toplanmış köy ürünleri ve sıcak ekmeklerle güne başlangıç." },
      { time: "10:30", activity: "Antik Phokaia & Foça Harabeleri Turu", details: "Foça merkezdeki antik tiyatro, Athena tapınağı kalıntıları ve tarihi değirmenlere rehberli kültürel gezi." },
      { time: "14:00", activity: "Kozbeyli Köyü Tarihi Yapıları Gezisi", details: "Köyün simgesi olan tarihi cami, gözetleme kuleleri ve eski Rum evleri arasında mimari keşif yürüyüşü." },
      { time: "16:30", activity: "Taş Dibekte Kahve Yapımı Atölyesi", details: "Dibek taşı başında uygulamalı kahve hazırlama eğitimi ve köyün kahve ticareti tarihi." },
      { time: "19:30", activity: "Şefin İmza Menüsü Yemek", details: "Ege ve Antakya'nın tarihi ortak lezzetlerinden oluşan, geçmişin izlerini taşıyan akşam yemeği." }
    ]
  }
};

// 2. gün için alternatif aktiviteler
export const day2Activities: Record<string, ItineraryItem[]> = {
  gastronomi: [
    { time: "09:30", activity: "Odun Ateşinde Menemen & Gözleme", details: "Bahçeden taze koparılmış biberler ve domateslerle sac üzerinde pişen Ege gözlemeleri." },
    { time: "12:00", activity: "Yerel Ot Toplama Atölyesi", details: "Konak şefimiz eşliğinde köyün etrafındaki yamaçlardan şifalı otlar (şevketibostan, radika) toplama." },
    { time: "15:00", activity: "Dibek Dibinde Şerbet Ritüeli", details: "El yapımı karadut ve reyhan şerbetlerinin sunumu, taş dibek gölgesinde dinlenme." },
    { time: "17:30", activity: "Zeytinyağı Sabun Yapımı Atölyesi", details: "Bahçemizin soğuk sıkım zeytinyağlarından geleneksel yöntemlerle sabun dökme deneyimi." },
    { time: "19:30", activity: "Fırında Ege Balığı & Ot Tabakları", details: "Foça balıkçılarından taze Ege levreği, zeytinyağlı radika ve sıcak helva tatlısı." }
  ],
  romantizm: [
    { time: "09:30", activity: "Yatakta Premium Serpme Kahvaltı", details: "Çiftlerimize özel çiçekler ve taze sıkılmış meyve suları eşliğinde odaya kahvaltı servisi." },
    { time: "12:30", activity: "Sakin Koyda Piknik Deneyimi", details: "Şefimizin hazırladığı özel piknik sepetiyle Foça'nın gizli bir koyunda baş başa öğle yemeği." },
    { time: "16:00", activity: "Konağın Gizli Avlusunda Kitap Okuma", details: "Sadece kuş cıvıltılarının duyulduğu saklı avluda yasemin çayı eşliğinde dinlenme." },
    { time: "18:30", activity: "Teras Jakuzisinde Gün Batımı", details: "Oda terasında Ege Denizi manzarasına karşı mumlar ve soft müzik eşliğinde küvet keyfi." },
    { time: "20:30", activity: "Yıldızlar Altında Açık Hava Sineması", details: "Avlu perdemizde nostaljik bir aşk filmi gösterimi, patlamış mısır ve sıcak şarap ikramı." }
  ],
  kultur: [
    { time: "09:00", activity: "Köy Kahvaltısı & Çınar Altı", details: "Kozbeyli'nin ünlü asırlık çınar ağacı altında köylülerle birlikte sabah kahvaltısı." },
    { time: "11:00", activity: "Tarihi Taş Evler Fotoğraf Safarisi", details: "Gözetleme kuleleri, tarihi kilise kalıntıları ve taş Rum evlerinin mimari hikayelerinin çekimi." },
    { time: "14:30", activity: "Foça Sirene Kayalıkları Efsanesi Turu", details: "Homeros Destanı'nda geçen Sirene Kayalıkları'nı denizden tekneyle izleme ve mitolojik tur." },
    { time: "17:00", activity: "Konağın Antik Eserler Koleksiyonu", details: "Konağın restorasyonu sırasında çıkarılan tarihi seramiklerin ve objelerin sunumu." },
    { time: "20:00", activity: "Taş Mahzende Tarihi Akşam Yemeği", details: "Eski zeytinyağı mahzeninde, mum ışıkları altında özel tarihi Ege menüsü." }
  ]
};

// 3. gün için alternatif aktiviteler
export const day3Activities: Record<string, ItineraryItem[]> = {
  gastronomi: [
    { time: "09:30", activity: "Ege Hamur İşleri Kahvaltısı", details: "Taze pişen pişi, boyoz ve Antakya usulü katıklı ekmekler eşliğinde veda kahvaltısı." },
    { time: "11:30", activity: "Kozbeyli Yerel Pazar Gezisi", details: "Yöresel üreticilerin tezgahlarından taze baharat, kuru domates ve zeytin alışverişi." },
    { time: "14:00", activity: "İnci Hanım ile Mutfak Sırları", details: "Antakya içli köftesi veya Ege mezelerinin yapılışını öğreneceğiniz birebir mini şef sınıfı." },
    { time: "16:30", activity: "Tarihi Çınar Altında Dibek Kahvesi", details: "Köy meydanındaki tarihi çınar altında köylülerle kahve ve slow living sohbeti." },
    { time: "19:30", activity: "Gala Avlu Yemeği", details: "Konakta geçirdiğiniz 3 günün anısına şefin hazırladığı en özel mezeler ve fırın tatlıları." }
  ],
  romantizm: [
    { time: "10:00", activity: "Geç Uyanış & Avluda Brunch", details: "Öğlene doğru avlunun en sakin köşesinde servis edilen geniş dinlendirici brunch." },
    { time: "13:00", activity: "Genişletilmiş Zeytinlik Yürüyüşü", details: "Köyün en sessiz patikalarında el ele, doğayla iç içe yavaş tempoda yürüyüş." },
    { time: "15:30", activity: "Hamam Ritüeli & Masaj Keyfi", details: "Geleneksel mermer banyomuzda zeytinyağlı sabun köpükleriyle arınma masajı." },
    { time: "18:00", activity: "Veda Gün Batımı Balonu", details: "Terasımızda Ege Denizi'ne karşı dilek feneri uçurma ve şampanya ikramı." },
    { time: "20:00", activity: "Özel Gazebo Altında Akşam Yemeği", details: "Sadece sizin için süslenmiş gazebo altında özel servis elemanıyla akşam yemeği." }
  ],
  kultur: [
    { time: "09:00", activity: "Arkeoloji Kahvaltısı", details: "Köyün yerel lezzetleriyle sade ve besleyici bir sabah kahvaltısı." },
    { time: "10:30", activity: "Foça Yel Değirmenleri & Şehir Surları", details: "19. yüzyıldan kalan tarihi yel değirmenlerinin zirvesinden manzara ve sur incelemesi." },
    { time: "13:30", activity: "Karadut Şerbeti & Taş Mektep", details: "Köyün eski okul binası olan Taş Mektep'in tarihini inceleme ve köy kahvesinde mola." },
    { time: "16:00", activity: "Kozbeyli Kitaplığı ve Arşiv Okumaları", details: "Konağın kütüphanesinde yer alan Foça ve İzmir tarihi kitaplarını inceleme seansı." },
    { time: "19:30", activity: "Ege Halk Ezgileri Eşliğinde Yemek", details: "Akşam yemeğinde konuk müzisyenimizin klasik gitar veya kanun ile sunduğu canlı dinleti." }
  ]
};
