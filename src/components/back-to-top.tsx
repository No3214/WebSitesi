"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", toggle, { passive: true });
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;

  return (
    <>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="back-to-top"
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} />
      </button>
      <style jsx>{`
        .back-to-top {
          position: fixed;
          bottom: 100px;
          left: 24px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          color: var(--olive);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 80;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          animation: fadeInUp 0.3s ease;
        }

        .back-to-top:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          background: var(--olive);
          color: white;
          border-color: var(--olive);
        }

        @media (max-width: 768px) {
          .back-to-top {
            bottom: 80px;
            left: 16px;
            width: 38px;
            height: 38px;
          }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
