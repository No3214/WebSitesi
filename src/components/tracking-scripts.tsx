"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Image from "next/image";

import { env } from "@/lib/env";
import { CONSENT_STORAGE_KEY, getDefaultConsent, parseConsent, type ConsentState } from "@/lib/consent";

export function TrackingScripts() {
  const [consent, setConsent] = useState<ConsentState>(getDefaultConsent());

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
      {consent.analytics && env.NEXT_PUBLIC_GTM_ID ? (
        <>
          <Script id="gtm-loader" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${env.NEXT_PUBLIC_GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}

      {consent.marketing && env.NEXT_PUBLIC_META_PIXEL_ID ? (
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
            fbq('init', '${env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');`}
          </Script>
          <noscript>
            <Image
              height={1}
              width={1}
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
              unoptimized
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
