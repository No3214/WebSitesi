"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Image from "next/image";

export function ConsentGatedScripts() {
  const [consent, setConsent] = useState<{ analytics: boolean; marketing: boolean } | null>(null);

  useEffect(() => {
    const checkConsent = () => {
      const saved = localStorage.getItem("cookie_consent_v2");
      if (saved) {
        try {
          setConsent(JSON.parse(saved));
        } catch {
          setConsent(null);
        }
      }
    };

    checkConsent();
    const handleConsentUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setConsent(detail);
    };

    window.addEventListener("cookie-consent-updated", handleConsentUpdate);

    return () => {
      window.removeEventListener("cookie-consent-updated", handleConsentUpdate);
    };
  }, []);

  if (!consent) return <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      
      {consent.analytics && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID || ''}');`}
          </Script>
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID || ''}`}
              height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {consent.marketing && (
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
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''}');
            fbq('track', 'PageView');`}
          </Script>
          <noscript>
            <Image
              height={1}
              width={1}
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || ""}&ev=PageView&noscript=1`}
              alt=""
              unoptimized
            />
          </noscript>
        </>
      )}
    </>
  );
}
