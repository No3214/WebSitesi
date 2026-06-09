"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Compass, Coffee, Clock, Send, RotateCcw, ChevronRight, Check } from "lucide-react";
import { getWhatsAppHref } from "@/lib/contact";
import { FadeIn, StaggerContainer } from "@/components/animations";

// Step 1: Duration Options
const durations = [
  { 
    id: 1, 
    label: "1 Günlük Yoğun Kaçış", 
    desc: "Kozbeyli'de kısa ama derinlemesine bir yavaş yaşam soluklanması.", 
    days: 1,
    image: "https://images.unsplash.com/photo-1544013587-4142a27dad16?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: 2, 
    label: "2 Günlük Sükunet Rotası", 
    desc: "Zamanı yavaşlatıp konağın ruhunu ve avluyu tam olarak hissedeceğiniz ideal süre.", 
    days: 2,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: 3, 
    label: "3 Günlük Derin Dinlenme", 
    desc: "Köy yollarından deniz turlarına, gastronomi ritüellerinden şömine başına tam arınma.", 
    days: 3,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80"
  }
];

// Step 2: Interest Options
const interests = [
  { 
    id: "gastronomi", 
    title: "Gastronomi & Gurme Lezzetler", 
    desc: "İnci Hanım'ın Antakya-Ege reçeteleri, el yapımı zeytinyağları ve taş fırın tatları.", 
    icon: Coffee,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "romantizm", 
    title: "Romantizm & Sükunet", 
    desc: "Ege Denizi üzerinden batan güneş eşliğinde baş başa, özel ve sakin anlar.", 
    icon: Compass,
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "kultur", 
    title: "Miras & Tarih Keşfi", 
    desc: "500 yıllık tescilli taş mimari, restorasyon sırları ve Foça'nın antik liman izleri.", 
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&w=600&q=80"
  }
];

// Step 3: Pace Options
const paces = [
  { 
    id: "yavas", 
    label: "Çok Yavaş (Aşırı Dinlendirici)", 
    desc: "Bolca avlu vakti, kitap okuma köşeleri, şömine başı dinlenme ve minimum hareket.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: "dengeli", 
    label: "Dengeli (Keşif ve Dinlenme)", 
    desc: "Köy sokaklarında yavaş turlar, taş dibek ritüeli ve Foça tekne gezileri ile harmanlanmış tempo.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  }
];

// Dynamic Itinerary Database
interface ItineraryItem {
  time: string;
  activity: string;
  details: string;
}

const itineraryDb: Record<string, Record<string, ItineraryItem[]>> = {
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

export function ExperienceDesignerClient() {
  const [step, setStep] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(durations[1]); // Default 2 days
  const [selectedInterest, setSelectedInterest] = useState(interests[0]); // Default gastronomy
  const [selectedPace, setSelectedPace] = useState(paces[1]); // Default balanced

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleReset = () => {
    setStep(1);
    setSelectedDuration(durations[1]);
    setSelectedInterest(interests[0]);
    setSelectedPace(paces[1]);
  };

  // Generate Itinerary schedule dynamically based on days
  const generateItinerary = () => {
    const baseList = itineraryDb[selectedInterest.id]?.[selectedPace.id] || [];
    const days = selectedDuration.days;
    const finalItinerary: Record<number, ItineraryItem[]> = {};

    for (let d = 1; d <= days; d++) {
      // Adjust times/activities slightly for subsequent days to keep it interesting
      finalItinerary[d] = baseList.map((item, index) => {
        if (d === 1) return item;
        if (d === 2) {
          // Alternative activities for Day 2
          const day2Activities: Record<string, ItineraryItem[]> = {
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
          return day2Activities[selectedInterest.id]?.[index] || item;
        }
        // Alternative activities for Day 3
        const day3Activities: Record<string, ItineraryItem[]> = {
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
        return day3Activities[selectedInterest.id]?.[index] || item;
      });
    }

    return finalItinerary;
  };

  const itinerary = generateItinerary();

  // Format WhatsApp message to request reservation with this specific itinerary
  const handleWhatsAppSend = () => {
    let message = `Merhaba Kozbeyli Konağı! Web sitenizdeki *Yavaş Yaşam Rota Tasarımcısı* ile harika bir tatil planladım:\n\n`;
    message += `📅 *Süre:* ${selectedDuration.label}\n`;
    message += `🌿 *Konsept:* ${selectedInterest.title}\n`;
    message += `⚡ *Tempo:* ${selectedPace.label}\n\n`;
    message += `Bu rotaya uygun oda rezervasyonu yapmak ve *SLOWROTA15* kodlu %15 indirimden faydalanmak istiyorum. Bana yardımcı olabilir misiniz?`;
    
    const href = getWhatsAppHref(message);
    window.open(href, "_blank");
  };

  return (
    <div className="experience-designer">
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Progress Bar */}
        {step < 4 && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            <div className="steps-indicators">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`step-dot ${step >= s ? "active" : ""}`}>
                  {step > s ? <Check size={12} /> : s}
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Duration Selector */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="step-card"
            >
              <span className="eyebrow">AŞAMA 1 / 3</span>
              <h2 className="serif title-large">Kozbeyli&apos;de Kaç Gün Kalacaksınız?</h2>
              <p className="subtitle">Yavaş yaşamı deneyimlemek istediğiniz gün süresini seçin.</p>
              
              <div className="options-grid">
                {durations.map((d) => (
                  <button
                    key={d.id}
                    className={`option-btn ${selectedDuration.id === d.id ? "selected" : ""}`}
                    onClick={() => setSelectedDuration(d)}
                    style={{ position: "relative", overflow: "hidden", minHeight: "240px", justifyContent: "flex-end" }}
                  >
                    <div className="card-bg-zoom" style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%), url(${d.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease", zIndex: 1 }} />
                    <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
                      <div className="option-header" style={{ marginBottom: 12 }}>
                        <Calendar size={18} style={{ color: "var(--gold)" }} />
                        <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "var(--white)" }}>{d.days} Gün</span>
                      </div>
                      <h3 style={{ color: "var(--white)", textShadow: "0 2px 4px rgba(0,0,0,0.3)", margin: "0 0 6px" }}>{d.label}</h3>
                      <p style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="step-actions">
                <div />
                <button className="button primary flex-align" onClick={handleNext}>
                  İLERLE <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Interest Selector */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="step-card"
            >
              <span className="eyebrow">AŞAMA 2 / 3</span>
              <h2 className="serif title-large">İlgi Alanınızı Belirleyin</h2>
              <p className="subtitle">Konaklamanız süresince hangi deneyimlere ağırlık vermek istersiniz?</p>

              <div className="options-grid">
                {interests.map((i) => {
                  const Icon = i.icon;
                  return (
                    <button
                      key={i.id}
                      className={`option-btn ${selectedInterest.id === i.id ? "selected" : ""}`}
                      onClick={() => setSelectedInterest(i)}
                      style={{ position: "relative", overflow: "hidden", minHeight: "240px", justifyContent: "flex-end" }}
                    >
                      <div className="card-bg-zoom" style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%), url(${i.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease", zIndex: 1 }} />
                      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
                        <div className="option-header" style={{ marginBottom: 12 }}>
                          <Icon size={20} style={{ color: "var(--gold)" }} />
                        </div>
                        <h3 style={{ color: "var(--white)", textShadow: "0 2px 4px rgba(0,0,0,0.3)", margin: "0 0 6px" }}>{i.title}</h3>
                        <p style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{i.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="step-actions">
                <button className="button secondary" onClick={handleBack}>
                  GERİ
                </button>
                <button className="button primary flex-align" onClick={handleNext}>
                  İLERLE <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Pace Selector */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="step-card"
            >
              <span className="eyebrow">AŞAMA 3 / 3</span>
              <h2 className="serif title-large">Yavaşlık Temponuzu Seçin</h2>
              <p className="subtitle">Günlük aktivitelerinizin yoğunluğunu ve akış hızını ayarlayın.</p>

              <div className="options-grid cols-2">
                {paces.map((p) => (
                  <button
                    key={p.id}
                    className={`option-btn ${selectedPace.id === p.id ? "selected" : ""}`}
                    onClick={() => setSelectedPace(p)}
                    style={{ position: "relative", overflow: "hidden", minHeight: "240px", justifyContent: "flex-end" }}
                  >
                    <div className="card-bg-zoom" style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%), url(${p.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease", zIndex: 1 }} />
                    <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
                      <div className="option-header" style={{ marginBottom: 12 }}>
                        <Clock size={20} style={{ color: "var(--gold)" }} />
                      </div>
                      <h3 style={{ color: "var(--white)", textShadow: "0 2px 4px rgba(0,0,0,0.3)", margin: "0 0 6px" }}>{p.label}</h3>
                      <p style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="step-actions">
                <button className="button secondary" onClick={handleBack}>
                  GERİ
                </button>
                <button className="button primary flex-align" onClick={handleNext}>
                  ROTAYI OLUŞTUR <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Generated Itinerary Display */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="itinerary-display"
            >
              <div className="glass-header text-center">
                <span className="eyebrow">✨ KİŞİSELLEŞTİRİLMİŞ ROTANIZ HAZIR</span>
                <h1 className="serif main-title">Kozbeyli Slow Living Deneyimi</h1>
                <p className="muted max-width-p">
                  {selectedDuration.label} · {selectedInterest.title} · {selectedPace.label}
                </p>

                {/* Promo Badge */}
                <div className="promo-badge">
                  <span>Slow Living İndirimi Aktif:</span>
                  <strong>%15 İNDİRİM KODU: <code className="code-text">SLOWROTA15</code></strong>
                </div>
              </div>

              {/* Timeline per Day */}
              <StaggerContainer>
                {Object.keys(itinerary).map((dayStr) => {
                  const day = parseInt(dayStr);
                  return (
                    <FadeIn key={day} delay={day * 0.1}>
                      <div className="day-section">
                        <div className="day-header">
                          <span className="day-number">GÜN {day}</span>
                          <div className="day-line" />
                        </div>

                        <div className="timeline">
                          {itinerary[day].map((item, idx) => (
                            <div key={idx} className="timeline-item">
                              <div className="timeline-time">{item.time}</div>
                              <div className="timeline-marker" />
                              <div className="timeline-content">
                                <h4>{item.activity}</h4>
                                <p>{item.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </StaggerContainer>

              {/* Call to Actions */}
              <div className="itinerary-actions">
                <button className="button secondary flex-align gap-2" onClick={handleReset}>
                  <RotateCcw size={16} /> YENİ ROTA TASARLA
                </button>
                <button className="button secondary flex-align gap-2" onClick={handleWhatsAppSend}>
                  <Send size={16} /> ROTAYI WHATSAPP İLE GÖNDER
                </button>
                <a href="/rezervasyon" className="button primary flex-align">
                  REZERVASYON YAP
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .experience-designer {
          padding: 60px 0 100px;
          min-height: calc(100vh - 90px);
          background: var(--ivory);
          color: var(--text);
        }

        .progress-container {
          position: relative;
          height: 4px;
          background: rgba(61, 74, 59, 0.08);
          margin-bottom: 60px;
          border-radius: 2px;
        }

        .progress-bar {
          position: absolute;
          height: 100%;
          background: var(--gold);
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .steps-indicators {
          display: flex;
          justify-content: space-between;
          position: absolute;
          width: 100%;
          top: -10px;
        }

        .step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--white);
          border: 2px solid rgba(61, 74, 59, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #999;
          transition: all 0.3s;
        }

        .step-dot.active {
          border-color: var(--gold);
          color: var(--gold);
          box-shadow: 0 0 12px rgba(179, 146, 92, 0.2);
        }

        .step-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.02);
        }

        .title-large {
          font-size: 2.2rem;
          margin: 12px 0 8px;
          color: var(--olive);
        }

        .subtitle {
          color: #666;
          font-size: 1rem;
          margin-bottom: 40px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .options-grid.cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .option-btn {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          outline: none;
        }

        .card-bg-zoom {
          transform: scale(1);
        }
 
        .option-btn:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(179, 146, 92, 0.06);
        }

        .option-btn:hover .card-bg-zoom {
          transform: scale(1.05);
        }
 
        .option-btn.selected {
          border-color: var(--gold);
          box-shadow: 0 12px 24px rgba(179, 146, 92, 0.15);
          outline: 2px solid var(--gold);
        }

        .option-header {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 20px;
          align-items: center;
        }

        .icon-gold {
          color: var(--gold);
        }

        .badge {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(179, 146, 92, 0.1);
          color: var(--gold);
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 700;
        }

        .option-btn h3 {
          font-size: 1.15rem;
          margin: 0 0 10px;
          color: var(--text);
        }

        .option-btn p {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .flex-align {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Itinerary Display styling */
        .itinerary-display {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 50px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.03);
        }

        .main-title {
          font-size: 2.8rem;
          color: var(--olive);
          margin: 8px 0;
        }

        .max-width-p {
          max-width: 600px;
          margin: 0 auto;
          font-size: 1.1rem;
        }

        .promo-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #fdfaf5;
          border: 1px solid #f1ece1;
          padding: 12px 24px;
          border-radius: 50px;
          margin-top: 24px;
          font-size: 0.9rem;
        }

        .promo-badge span {
          color: #666;
        }

        .promo-badge strong {
          color: var(--gold);
        }

        .code-text {
          font-family: monospace;
          background: rgba(179, 146, 92, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .day-section {
          margin-top: 50px;
        }

        .day-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .day-number {
          font-family: var(--serif);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--olive);
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        .day-line {
          height: 1px;
          background: var(--border);
          width: 100%;
        }

        .timeline {
          position: relative;
          padding-left: 32px;
          margin-left: 8px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: rgba(61, 74, 59, 0.08);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 32px;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-time {
          position: absolute;
          left: -110px;
          width: 80px;
          text-align: right;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--gold);
        }

        .timeline-marker {
          position: absolute;
          left: -36px;
          top: 5px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--white);
          border: 2px solid var(--gold);
          box-shadow: 0 0 0 4px var(--white);
          transition: all 0.3s;
        }

        .timeline-item:hover .timeline-marker {
          background: var(--gold);
          transform: scale(1.2);
        }

        .timeline-content h4 {
          font-size: 1.15rem;
          margin: 0 0 6px;
          color: var(--olive);
        }

        .timeline-content p {
          font-size: 0.92rem;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }

        .itinerary-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 60px;
          border-top: 1px solid var(--border);
          padding-top: 40px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .options-grid {
            grid-template-columns: 1fr;
          }
          .options-grid.cols-2 {
            grid-template-columns: 1fr;
          }
          .timeline {
            padding-left: 20px;
            margin-left: 80px;
          }
          .timeline-time {
            left: -90px;
          }
          .timeline-marker {
            left: -24px;
          }
        }
        @media (max-width: 500px) {
          .step-card {
            padding: 24px;
          }
          .itinerary-display {
            padding: 24px;
          }
          .title-large {
            font-size: 1.6rem;
          }
          .main-title {
            font-size: 2rem;
          }
          .timeline {
            padding-left: 16px;
            margin-left: 0;
            margin-top: 24px;
          }
          .timeline-time {
            position: static;
            text-align: left;
            margin-bottom: 4px;
            display: inline-block;
          }
          .timeline-marker {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
