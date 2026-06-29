"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, Instagram, X, MessageSquare } from "lucide-react";

import { getPhoneHref, WHATSAPP_BASE } from "@/lib/contact";

function isEnglishPath(pathname: string | null): boolean {
  return pathname === "/en" || Boolean(pathname?.startsWith("/en/"));
}

export const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const englishPath = isEnglishPath(pathname);
  const callLabel = englishPath ? "Call Us" : "Bize Ulaşın";
  const toggleLabel = isOpen
    ? englishPath
      ? "Close contact options"
      : "İletişim seçeneklerini kapat"
    : englishPath
      ? "Open contact options"
      : "İletişim seçeneklerini aç";

  const toggleRef = useRef<HTMLButtonElement>(null);

  // Açık panelde Escape ile kapat ve odağı toggle butonuna geri taşı (a11y).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const contactOptions = [
    {
      icon: <Instagram className="w-5 h-5" />,
      label: "Instagram",
      href: "https://www.instagram.com/kozbeylikonagi/",
      color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: callLabel,
      href: getPhoneHref(),
      color: "bg-[#2f5d68]",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "WhatsApp",
      href: WHATSAPP_BASE,
      color: "bg-green-500",
    },
  ];

  return (
    <div
      className="fixed bottom-24 right-5 z-[100] flex flex-col items-end gap-3 md:bottom-8 md:right-8"
      data-testid="floating-contact"
    >
      {isOpen ? (
        <div id="contact-fab-panel" className="contact-fab-options flex flex-col gap-3 mb-2">
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
        ref={toggleRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={toggleLabel}
        aria-expanded={isOpen}
        aria-controls="contact-fab-panel"
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-[var(--olive)] rotate-90" : "bg-gold"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      <style jsx global>{`
        .bg-gold {
          background-color: var(--gold);
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
