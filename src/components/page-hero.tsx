"use client";

import { motion } from "framer-motion";

const EASE_LUX = [0.16, 1, 0.3, 1] as const;

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text?: string;
};

/**
 * İç sayfalar için ortak sinematik giriş bandı.
 * Koyu "ink" zemin + grain dokusu; ana sayfa hero'suyla aynı tasarım dili.
 */
export function PageHero({ eyebrow, title, text }: PageHeroProps) {
  return (
    <section className="page-hero section-dark grain">
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_LUX }}
        >
          {eyebrow}
        </motion.span>
        <span style={{ display: "block", overflow: "hidden" }}>
          <motion.h1
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: EASE_LUX }}
          >
            {title}
          </motion.h1>
        </span>
        {text ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE_LUX }}
          >
            {text}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
