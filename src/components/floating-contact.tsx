"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Instagram, X, MessageCircle } from "lucide-react";

function isBusinessHours() {
  const h = parseInt(
    new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Europe/Istanbul" }),
    10
  );
  return h >= 8 && h < 23; // 08:00 - 23:00 Turkey time
}

export const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const available = isBusinessHours();

  const contactOptions = [
    {
      icon: <MessageCircle size={20} />,
      label: "WhatsApp",
      href: "https://wa.me/905322342686",
      bg: "#25d366",
    },
    {
      icon: <Phone size={20} />,
      label: "Ara",
      href: "tel:+905322342686",
      bg: "var(--olive)",
    },
    {
      icon: <Instagram size={20} />,
      label: "Instagram",
      href: "https://www.instagram.com/kozbeylikonagi/",
      bg: "#e1306c",
    },
  ];

  return (
    <div className="floating-contact-wrap">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            className="floating-options"
          >
            {contactOptions.map((opt, i) => (
              <motion.a
                key={opt.label}
                href={opt.href}
                target={opt.href.startsWith("http") ? "_blank" : undefined}
                rel={opt.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="floating-opt-btn"
                style={{ background: opt.bg }}
                aria-label={opt.label}
              >
                <span className="floating-opt-label">{opt.label}</span>
                {opt.icon}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`floating-trigger ${isOpen ? "floating-trigger-open" : ""}`}
        aria-label={isOpen ? "İletişim menüsünü kapat" : "İletişim"}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && available && <span className="availability-dot" />}
      </button>

      <style jsx>{`
        .floating-contact-wrap {
          position: fixed;
          bottom: 100px;
          right: 24px;
          z-index: 90;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .floating-contact-wrap {
            bottom: 80px;
            right: 16px;
          }
        }

        .floating-trigger {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          background: var(--gold);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(179, 146, 92, 0.35);
          transition: all 0.3s ease;
        }

        .floating-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(179, 146, 92, 0.45);
        }

        .floating-trigger-open {
          background: #333;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .availability-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid white;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>

      <style jsx global>{`
        .floating-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 8px;
        }

        .floating-opt-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 50px;
          color: white;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease;
        }

        .floating-opt-btn:hover {
          transform: scale(1.04);
          opacity: 1;
        }

        .floating-opt-label {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};
