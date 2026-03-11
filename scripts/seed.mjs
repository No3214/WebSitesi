import { getPayload } from "payload";
import config from "../payload.config.js";

const payload = await getPayload({ config });

const existingRooms = await payload.find({
  collection: "rooms",
  limit: 1
});

if (!existingRooms.docs.length) {
  await payload.create({
    collection: "rooms",
    data: {
      title: "Premium Deniz Manzaralı Süit",
      slug: "premium-deniz-manzarali-suit",
      short: "Kozbeyli'nin eşsiz taş dokusunu modern lüks ile birleştiren, Ege Denizi panoramasına sahip en özel süitimiz.",
      capacity: "2 Yetişkin",
      size: "45 m²",
      view: "Panoramik Deniz",
      order: 1,
      images: []
    },
    overrideAccess: true
  });
  console.log("Oda seed edildi.");
}

const existingMenu = await payload.find({
  collection: "menu-sections",
  limit: 1
});

if (!existingMenu.docs.length) {
  await payload.create({
    collection: "menu-sections",
    data: {
      title: "Taş Fırın & Ege Lezzetleri",
      slug: "tas-firin-ege-lezzetleri",
      description: "Tarihi taş fırınımızda, bahçemizden gelen taze ürünlerle hazırlanan yerel spesiyaller.",
      order: 1,
      items: [
        {
          name: "Kozbeyli Kuzu Tandır",
          description: "Ağır ateşte taş fırında pişmiş yerel kuzu eti, köz sebzeler ile",
          priceLabel: "Şefin Seçimi"
        }
      ]
    },
    overrideAccess: true
  });
  console.log("Menü seed edildi.");
}

const existingOrg = await payload.find({
  collection: "organization-packages",
  limit: 1
});

if (!existingOrg.docs.length) {
  await payload.create({
    collection: "organization-packages",
    data: {
      title: "Masalsı Butik Düğün",
      category: "dugun",
      short: "Tarihi konağımızın bahçesinde, zeytin ağaçları altında hayalinizdeki butik düğünü gerçekleştiriyoruz.",
      order: 1
    },
    overrideAccess: true
  });
  console.log("Organizasyon seed edildi.");
}

console.log("Seed işlemi tamamlandı.");
process.exit(0);
