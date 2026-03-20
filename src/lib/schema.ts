import { env } from "@/lib/env";
import { absoluteUrl } from "./utils";
import { CONTACT } from "@/lib/constants";
import { ReputationData } from "./ai/reputation-intelligence";
import type { Room } from "@/data/rooms";

/**
 * Hotel Schema (SEO & Reputation Integrated)
 */
export function hotelSchema() {
  const base = {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness", "Restaurant"],
    name: "Kozbeyli Konağı Taş Otel & Restaurant",
    description:
      "Foça'nın tarihi Kozbeyli köyünde, 500+ yıllık Osmanlı konağında butik otel ve Ege-Antakya mutfağı restoran deneyimi. 16 oda, panoramik Foça Körfezi manzarası.",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    image: [
      absoluteUrl("/images/rooms/bahce-1.jpeg"),
      absoluteUrl("/images/rooms/deniz-1.jpeg"),
      absoluteUrl("/images/rooms/aile-1.jpeg"),
    ],
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.district,
      addressRegion: CONTACT.address.city,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CONTACT.coordinates.latitude,
      longitude: CONTACT.coordinates.longitude,
    },
    numberOfRooms: 16,
    checkinTime: "14:00",
    checkoutTime: "12:00",
    priceRange: "₺₺₺",
    currenciesAccepted: "TRY",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    servesCuisine: ["Ege Mutfağı", "Antakya Mutfağı", "Türk Mutfağı"],
    starRating: {
      "@type": "Rating",
      ratingValue: "5",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ReputationData.overall.score,
      reviewCount: ReputationData.overall.reviewCount,
      bestRating: "10",
    },
    review: ReputationData.featuredReviews.map((rev) => ({
      "@type": "Review",
      author: { "@type": "Person", name: rev.author },
      datePublished: rev.date,
      reviewBody: rev.content,
      reviewRating: {
        "@type": "Rating",
        ratingValue: rev.rating,
        bestRating: rev.platform === "Booking.com" ? "10" : "5",
      },
    })),
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "500+ Yıllık Osmanlı Taş Konağı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ege & Antakya Mutfağı Restoranı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Foça Körfezi Panoramik Manzara", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Otopark", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ücretsiz Bebek Yatağı", value: true },
      { "@type": "LocationFeatureSpecification", name: "Evcil Hayvan Dostu", value: true },
      { "@type": "LocationFeatureSpecification", name: "Serpme Kahvaltı Dahil", value: true },
    ],
    petsAllowed: true,
    hasMap: "https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA",
    hasMenu: absoluteUrl("/menu"),
    ...(env.GOOGLE_MAPS_URL ? { hasMap: env.GOOGLE_MAPS_URL } : {}),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Odalar", item: absoluteUrl("/odalar") },
    ],
  };

  return [base, breadcrumbs];
}

/**
 * Individual Room Schema for room detail pages
 */
export function roomSchema(room: Room) {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.title,
    description: room.description,
    occupancy: {
      "@type": "QuantitativeValue",
      value: parseInt(room.capacity) || 2,
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: parseInt(room.size.replace(/\D/g, "")) || 25,
      unitCode: "MTK",
    },
    image: room.images.map((img) => absoluteUrl(img)),
    ...(room.price
      ? {
          offers: {
            "@type": "Offer",
            price: room.price,
            priceCurrency: "TRY",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(`/odalar/${room.slug}`),
          },
        }
      : {}),
    amenityFeature: room.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    containedInPlace: {
      "@type": "Hotel",
      name: "Kozbeyli Konağı",
      url: absoluteUrl("/"),
    },
  };
}

/**
 * FAQ Schema for the homepage and SSS page
 */
export function faqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}
