"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type AnalyticsScriptsProps = {
  gtmId?: string;
  metaPixelId?: string;
};

function isConsentGranted() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cookie_consent") === "accepted";
}

export function AnalyticsScripts({ gtmId, metaPixelId }: AnalyticsScriptsProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => setEnabled(isConsentGranted());

    syncConsent();
    window.addEventListener("storage", syncConsent);
    window.addEventListener("cookie-consent-updated", syncConsent as EventListener);

    return () => {
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener("cookie-consent-updated", syncConsent as EventListener);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {gtmId ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      ) : null}

      {metaPixelId ? (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');`}
        </Script>
      ) : null}
    </>
  );
}
