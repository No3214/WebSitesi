"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

import { CONSENT_STORAGE_KEY, getDefaultConsent, parseConsent, type ConsentState } from "@/lib/consent";
import { publicEnv } from "@/lib/public-env";

export function TrackingScripts() {
  const [consent, setConsent] = useState<ConsentState>(getDefaultConsent());
  const directGoogleTagId =
    publicEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID || publicEnv.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const shouldLoadDirectGoogleTag =
    consent.analytics && !publicEnv.NEXT_PUBLIC_GTM_ID && Boolean(directGoogleTagId);
  const directGoogleTagConfig = [
    publicEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID
      ? `gtag('config', ${JSON.stringify(publicEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID)}, { send_page_view: true });`
      : "",
    publicEnv.NEXT_PUBLIC_GOOGLE_ADS_ID
      ? `gtag('config', ${JSON.stringify(publicEnv.NEXT_PUBLIC_GOOGLE_ADS_ID)});`
      : "",
  ].filter(Boolean).join("\n");

  useEffect(() => {
    const sync = () => {
      const stored = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
      setConsent(stored || getDefaultConsent());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("consent:updated", sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("consent:updated", sync as EventListener);
    };
  }, []);

  return (
    <>
      {publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      ) : null}

      {consent.analytics && publicEnv.NEXT_PUBLIC_GTM_ID ? (
        <>
          <Script id="gtm-loader" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${publicEnv.NEXT_PUBLIC_GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${publicEnv.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}

      {shouldLoadDirectGoogleTag ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${directGoogleTagId}`}
            strategy="afterInteractive"
          />
          <Script id="direct-google-tag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            ${directGoogleTagConfig}`}
          </Script>
        </>
      ) : null}

      {consent.marketing && publicEnv.NEXT_PUBLIC_META_PIXEL_ID ? (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${publicEnv.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element -- Meta noscript tracking pixel must remain a raw 1x1 img. */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${publicEnv.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
