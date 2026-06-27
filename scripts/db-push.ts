/**
 * TEHLİKELİ — YALNIZ BİLİNÇLİ, TEK SEFERLİK BOOTSTRAP İÇİN.
 *
 * Payload şemasını bağlı veritabanına `push` (NODE_ENV=development) ile uygular.
 * Drizzle push, mevcut tabloları model ile eşleştirirken DROP/RECREATE edebilir →
 * bu, tablodaki TÜM VERİYİ (örn. admin kullanıcı hesabı) VE el ile uygulanmış RLS
 * ayarlarını SİLER. Bu yüzden ARTIK VERCEL BUILD ADIMINDA ÇALIŞMAZ — eskiden her
 * deploy'da çalışıp RLS'i sıfırlıyor ve veriyi wipe etme riski taşıyordu.
 *
 * Şema zaten oluşturuldu. İleride alan eklemek için GÜVENLİ yol Payload migration'dur
 * (`payload migrate:create` + `payload migrate`), push DEĞİL.
 *
 * Bu betik yalnız `ALLOW_DB_PUSH=1` ile, kasıtlı olarak (boş/yeni bir DB'yi bootstrap
 * ederken) çalıştırılır; aksi halde hiçbir şey yapmadan çıkar.
 */
if (process.env.ALLOW_DB_PUSH !== "1") {
  console.error(
    "DB_PUSH_SKIPPED: yıkıcı schema push devre dışı. Bilinçli bootstrap için ALLOW_DB_PUSH=1 ver. " +
      "Şema değişikliği için Payload migration kullan (push DEĞİL).",
  );
  process.exit(0);
}

Reflect.set(process.env, "NODE_ENV", "development");
delete process.env.PAYLOAD_MIGRATING;

const run = async () => {
  try {
    const { getPayload } = await import("payload");
    const config = (await import("../payload.config")).default;
    await getPayload({ config });
    console.log("DB_PUSH_OK: Payload şeması push edildi (ALLOW_DB_PUSH=1).");
  } catch (e) {
    console.error("DB_PUSH_FAILED:", e instanceof Error ? e.message : String(e));
  }
  process.exit(0);
};

run();
