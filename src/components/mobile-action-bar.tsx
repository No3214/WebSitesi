"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, Calendar } from "lucide-react";

export const MobileActionBar = () => {
  return (
    <div className="mobile-bar-wrap">
      <div className="mobile-bar">
        <a href="tel:+902328261112" className="mobile-bar-item" aria-label="Telefon ile ara">
          <Phone size={18} />
          <span>Ara</span>
        </a>

        <a
          href="https://maps.app.goo.gl/DXMWQg8aJHt3KNcTA"
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-bar-item"
          aria-label="Konumu haritada aç"
        >
          <MapPin size={18} />
          <span>Konum</span>
        </a>

        <Link href="/#rezervasyon" className="mobile-bar-book">
          <Calendar size={16} />
          <span>Rezervasyon</span>
        </Link>
      </div>

      <style jsx>{`
        .mobile-bar-wrap {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 90;
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-bar-wrap { display: block; }
        }

        .mobile-bar {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding: 8px 20px;
          padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
        }

        .mobile-bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          color: #666;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 6px 12px;
        }

        .mobile-bar-book {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--gold);
          color: white;
          padding: 10px 24px;
          border-radius: 50px;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 16px rgba(179, 146, 92, 0.3);
        }
      `}</style>
    </div>
  );
};
