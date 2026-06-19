"use client";

import { SlidersHorizontal } from "lucide-react";

import { openConsentPreferences } from "@/lib/consent";

type CookiePreferencesButtonProps = {
  label: string;
  className?: string;
};

export function CookiePreferencesButton({ label, className = "footer-link-button" }: CookiePreferencesButtonProps) {
  return (
    <button type="button" className={className} onClick={openConsentPreferences}>
      <SlidersHorizontal size={14} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
