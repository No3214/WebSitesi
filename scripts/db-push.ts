/**
 * Vercel build adımı: Payload şemasını bağlı Supabase'e push eder.
 * - NODE_ENV=development → adapter push'u aktif (prod'da kapalıdır).
 * - Build sırasında Sensitive DATABASE_URI mevcut olur.
 * - Hata olsa bile build'i BLOKE ETMEZ (exit 0); loglar Vercel build log'unda görünür.
 * Tablolar bir kez oluştuktan sonra push idempotenttir (sonraki deploylarda no-op).
 */
Reflect.set(process.env, "NODE_ENV", "development");
delete process.env.PAYLOAD_MIGRATING;

const run = async () => {
  try {
    const { getPayload } = await import("payload");
    const config = (await import("../payload.config")).default;
    await getPayload({ config });
    console.log("DB_PUSH_OK: Payload şeması Supabase'e push edildi.");
  } catch (e) {
    console.error("DB_PUSH_FAILED (build devam ediyor):", e instanceof Error ? e.message : String(e));
  }
  process.exit(0);
};

run();
