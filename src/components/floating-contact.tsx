"use client";

import { useState } from "react";
import { MessageCircle, Phone, Instagram, X, MessageSquare } from "lucide-react";

import { getPhoneHref, WHATSAPP_BASE } from "@/lib/contact";

export const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      icon: <Instagram className="w-5 h-5" />,
      label: "Instagram",
      href: "https://www.instagram.com/kozbeylikonagi/",
      color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Bize Ulaşın",
      href: getPhoneHref(),
      color: "bg-blue-600",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "WhatsApp",
      href: WHATSAPP_BASE,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="contact-fab-options flex flex-col gap-3 mb-2">
          {contactOptions.map((option, index) => (
            <a
              key={option.label}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`contact-fab-option flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-xl hover:scale-105 transition-transform ${option.color}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="text-sm font-medium whitespace-nowrap">{option.label}</span>
              {option.icon}
            </a>
          ))}
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "İletişim seçeneklerini kapat" : "İletişim seçeneklerini aç"}
        aria-expanded={isOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-zinc-900 rotate-90" : "bg-gold"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      <style jsx global>{`
        .bg-gold {
          background-color: #c5a059;
        }
        .contact-fab-options {
          animation: contactFabPanelIn 220ms ease-out both;
        }
        .contact-fab-option {
          animation: contactFabItemIn 220ms ease-out both;
        }
        @keyframes contactFabPanelIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes contactFabItemIn {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
