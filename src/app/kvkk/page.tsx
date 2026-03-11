import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function KvkkPage() {
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h1 className="serif">Kişisel Verilerin Korunması ve İşlenmesi Aydınlatma Metni</h1>
          <div className="serif-text" style={{ lineHeight: 1.8, marginTop: '40px', textAlign: 'justify' }}>
            <p>
              <strong>Kozbeyli Konağı</strong> (“Şirket” veya “Konağımız”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla, işleme faaliyetlerimizin kapsamı ve haklarınız konusunda sizleri bilgilendirmek isteriz.
            </p>

            <h3>1. Kişisel Verilerin İşlenme Amacı</h3>
            <p>Toplanan kişisel verileriniz, aşağıdaki amaçlar doğrultusunda KVKK&apos;nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları dahilinde işlenmektedir:</p>
            <ul>
              <li>Konaklama hizmetlerinin sunulması ve rezervasyon süreçlerinin tamamlanması,</li>
              <li>Konaklama birimlerimize giriş-çıkış işlemlerinin ve kimlik bildirimlerinin (KBS) yasal mevzuata uygun yürütülmesi,</li>
              <li>Müşteri memnuniyetinin ölçülmesi, talep ve şikayetlerin takibi,</li>
              <li>Finans ve muhasebe işlerinin yürütülmesi, fatura kesimi ve ödeme tahsilatı,</li>
              <li>İş birliği yapılan kurumlarla (HotelRunner vb.) entegrasyon süreçlerinin yönetilmesi,</li>
              <li>Güvenlik operasyonlarının tesisi amacıyla kamera kayıtlarının alınması,</li>
              <li>Gerekli durumlarda pazarlama, kampanya ve tanıtım faaliyetlerinin yürütülmesi (açık rıza halinde).</li>
            </ul>

            <h3>2. İşlenen Kişisel Veriler</h3>
            <p>Hizmetlerimiz kapsamında; Ad-Soyad, T.C. Kimlik No, Pasaport No, Doğum Tarihi, İletişim Bilgileri (E-posta, Telefon, Adres), Araç Plakası, Kamera Kayıtları ve Ödeme Bilgileri işlenmektedir.</p>

            <h3>3. Kişisel Verilerin Aktarılması</h3>
            <p>Kişisel verileriniz, işbu aydınlatma metninde belirtilen amaçların gerçekleştirilmesi ile sınırlı olarak;</p>
            <ul>
              <li>Emniyet Genel Müdürlüğü (Kimlik Bildirim Sistemi),</li>
              <li>Vergi daireleri ve ilgili kamu kurum/kuruluşları,</li>
              <li>Bankalar ve ödeme aracı kuruluşları (Stripe, Iyzico vb.),</li>
              <li>Entegrasyon ve yazılım hizmeti aldığımız iş ortaklarımız (HotelRunner, Payload CMS altyapısı),</li>
              <li>Hukuki yükümlülüklerin yerine getirilmesi amacıyla adli makamlarla paylaşılabilecektir.</li>
            </ul>

            <h3>4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h3>
            <p>Kişisel verileriniz; web sitemiz, rezervasyon portalları, telefon, e-posta veya fiziki olarak Konağımıza girişiniz esnasında sözlü, yazılı veya elektronik ortamda toplanmaktadır. İşleme faaliyeti; sözleşmenin kurulması (rezervasyon), kanunlarda açıkça öngörülmesi (KBS) ve veri sorumlusunun meşru menfaati hukuki sebeplerine dayanmaktadır.</p>

            <h3>5. Kişisel Veri Sahibinin Hakları</h3>
            <p>KVKK&apos;nın 11. maddesi kapsamındaki haklarınız şunlardır:</p>
            <ul>
              <li>Veri işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse bilgi talep etme,</li>
              <li>İşlenme amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
              <li>KVKK 7. madde çerçevesinde silinmesini veya yok edilmesini isteme,</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
              <li>Zarara uğramanız halinde zararın giderilmesini talep etme.</li>
            </ul>
            <p>Başvurularınızı, <strong>info@kozbeylikonagi.com</strong> adresine güvenli elektronik imza ile veya bizzat kimliğinizi tevsik edici belgeler ile yazılı olarak yapabilirsiniz.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
