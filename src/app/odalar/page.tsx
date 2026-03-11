import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SectionTitle } from "@/components/section-title";
import { rooms as fallbackRooms } from "@/data/rooms";
import { getPayloadClient } from "@/lib/payload";

export const metadata = {
  title: "Odalar | Lüks Konaklama Deneyimi"
};

export default async function RoomsPage() {
  let items = fallbackRooms;

  try {
    const payload = await getPayloadClient();
    const docs = await payload.find({
      collection: "rooms",
      limit: 50,
      sort: "order"
    });

    if (docs.docs.length) {
      items = docs.docs.map((doc: any) => ({
        slug: doc.slug,
        title: doc.title,
        short: doc.short,
        capacity: doc.capacity,
        size: doc.size,
        view: doc.view,
        images:
          doc.images?.map((row: any) => row.image?.url).filter(Boolean) || ["/logo.svg"]
      }));
    }
  } catch (error) {
    console.warn("Payload fetch failed, using fallbacks:", error);
  }

  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container">
          <SectionTitle
            eyebrow="Konaklama"
            title="Rafine Oda ve Süitler"
            text="Kozbeyli Konağı'nın taş mimarisi ile huzur verici Ege manzarasını birleştiren konaklama birimlerimizi keşfedin."
          />

          <div className="card-grid">
            {items.map((room) => (
              <Link key={room.slug} href={`/odalar/${room.slug}`} className="card">
                <img src={room.images[0]} alt={room.title} />
                <div className="card-body">
                  <span className="meta">{room.capacity} · {room.view}</span>
                  <h3>{room.title}</h3>
                  <p>{room.short}</p>
                  <span className="button secondary" style={{ width: '100%', padding: '10px' }}>Detayları Gör</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
