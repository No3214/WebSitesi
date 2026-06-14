"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Global Top-Loading Progress Bar
 * Provides visual feedback during page transitions.
 */
export const LoadingBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <>
      <div className="route-loading-bar fixed top-0 left-0 right-0 h-0.5 bg-gold z-[9999] origin-left" />
      <style jsx global>{`
        .route-loading-bar {
          animation: routeLoadingBar 500ms ease-in-out both;
        }
        @keyframes routeLoadingBar {
          from {
            opacity: 1;
            transform: scaleX(0);
          }
          85% {
            opacity: 1;
            transform: scaleX(1);
          }
          to {
            opacity: 0;
            transform: scaleX(1);
          }
        }
      `}</style>
    </>
  );
};
