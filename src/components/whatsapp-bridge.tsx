"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppBridge() {
  const WHATSAPP_NUMBER = "905001234567"; // Hotel's official WhatsApp
  const DEFAULT_MESSAGE = encodeURIComponent(
    "Merhabalar, Kozbeyli Konağı'nın uzman organizasyon ekibiyle tescilli mimari ve gurme davetler hakkında görüşmek istiyorum."
  );

  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-bridge"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, translateY: -5 }}
      title="Organizasyon Uzmanına Bağlan"
    >
      <div className="whatsapp-icon-wrapper">
        <MessageCircle size={32} />
        <span className="expert-badge">EXPERT</span>
      </div>

      <style jsx>{`
        .whatsapp-bridge {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          background: #25d366;
          color: white;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4);
          cursor: pointer;
        }

        .whatsapp-icon-wrapper {
          position: relative;
        }

        .expert-badge {
          position: absolute;
          top: -12px;
          right: -20px;
          background: #000;
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 10px;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .whatsapp-bridge {
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </motion.a>
  );
}
