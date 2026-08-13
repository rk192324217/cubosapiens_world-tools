"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { getStoredCookieConsent } from "@/hooks/useCookieConsent"

interface AdUnitProps {
  slot:   string
  format?: string
  style?: React.CSSProperties
}

export default function AdUnit({ slot, format = "autorelaxed", style }: AdUnitProps)
{
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const check = () => setHasConsent(getStoredCookieConsent()?.marketing === true)
    check()

    window.addEventListener("cookie-consent-change", check)
    return () => window.removeEventListener("cookie-consent-change", check)
  }, [])

  useEffect(() => {
    if(!hasConsent) return

    try
    {
      const adsbygoogle = (window as any).adsbygoogle || []
      adsbygoogle.push({})
    }
    catch(e)
    {
      console.error("AdSense error:", e)
    }
  }, [hasConsent])

  if(!hasConsent) return null

  return (
    <div className="ad-unit-wrap">
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2633780400369885"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-format={format}
        data-ad-client="ca-pub-2633780400369885"
        data-ad-slot={slot}
      />
    </div>
  )
}