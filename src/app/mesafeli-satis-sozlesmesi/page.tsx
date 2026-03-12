import { SiteHeader } from "@/components/site-header";

export default function SozlesmePage() {
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h1 className="serif">Mesafeli Satış Sözleşmesi</h1>
          <div className="serif-text" style={{ lineHeight: 1.8, marginTop: '40px', textAlign: 'justify' }}>
            <h3>1. TARAFLAR</h3>
            <p><strong>SATICI:</strong> Kozbeyli Konağı Taş Otel (Bundan sonra "Kozbeyli Konağı" olarak anılacaktır.)<br />
            <strong>ADRES:</strong> Kozbeyli Köyü, Foça, İzmir<br />
            <strong>ALICI:</strong> www.kozbeylikonagi.com adresi üzerinden rezervasyon yapan kullanıcı.</p>

            <h3>2. KONU</h3>
            <p>İşbu Sözleşme, Alıcı&apos;nın Satıcı&apos;ya ait web sitesi üzerinden elektronik ortamda siparişini (rezervasyonunu) yaptığı, aşağıda nitelikleri ve satış fiyatı belirtilen hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini kapsar.</p>

            <h3>3. HİZMETİN NİTELİĞİ VE BEDELİ</h3>
            <p>Sözleşme konusu hizmet; Alıcı tarafından seçilen tarihlerde, seçilen oda tipinde konaklama ve (varsa) seçilen ek hizmetleri kapsar. Rezervasyon bedeline KDV dahildir. Kahvaltı hizmetinin kapsamı oda tipine göre değişkenlik gösterebilir.</p>

            <h3>4. REZERVASYON VE ÖDEME</h3>
            <p>Rezervasyonun kesinleşmesi için belirlenen toplam bedelin tamamı veya ön ödeme tutarı (kapora) Alıcı tarafından kredi kartı, banka kartı veya havale yoluyla ödenmelidir. Ödemeler güvenli SSL sertifikalı altyapı üzerinden 3D Secure yöntemiyle gerçekleştirilir.</p>

            <h3>5. İPTAL, İADE VE DEĞİŞİKLİK KOŞULLARI</h3>
            <ul>
              <li><strong>Standart Rezervasyonlar:</strong> Konaklama tarihine 7 gün kala yapılan iptallerde ödemenin tamamı iade edilir. İade süreci bankalara bağlı olarak 7-14 iş günü sürebilir.</li>
              <li><strong>Son Dakika / İade Edilemez Rezervasyonlar:</strong> "İade Edilemez" ibaresiyle satılan kampanyalı odalarda iptal durumunda ücret iadesi yapılmaz.</li>
              <li><strong>Mücbir Sebepler:</strong> Doğal afet, savaş veya resmi makamlarca alınan kısıtlama kararlarında tesis politikası çerçevesinde tarih değişikliği veya iade yapılabilir.</li>
              <li>Rezervasyon değişikliği talepleri tesisin müsaitlik durumuna bağlıdır ve fiyat farkı oluşması durumunda fark tahsil edilir.</li>
            </ul>

            <h3>6. KONAKLAMA KURALLARI</h3>
            <p>Giriş (Check-in) saati 14:00, çıkış (Check-out) saati 12:00&apos;dir. Odalarda sigara içilmesi yasaktır. Evcil hayvan kabulü, oda tipine ve önceden teyit alınmasına bağlıdır.</p>

            <h3>7. YETKİLİ MAHKEME</h3>
            <p>İşbu sözleşmeden doğan uyuşmazlıklarda İzmir Mahkemeleri ve İcra Daireleri yetkilidir. Alıcı, şikayet ve itirazları için Tüketici Hakem Heyetlerine başvurabilir.</p>

            <p style={{ marginTop: '40px', fontStyle: 'italic' }}>Alıcı, web sitesi üzerinden rezervasyonunu tamamladığında işbu sözleşmenin tüm maddelerini kabul etmiş sayılır.</p>
          </div>
        </div>
      </main>
    </>
  );
}
