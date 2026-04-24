"use client"

import { useEffect } from "react"

interface AdUnitProps {
  slot:   string
  format?: string
  style?: React.CSSProperties
}

export default function AdUnit({ slot, format = "autorelaxed", style }: AdUnitProps)
{
  useEffect(() => {
    try
    {
      const adsbygoogle = (window as any).adsbygoogle || []
      adsbygoogle.push({})
    }
    catch(e)
    {
      console.error("AdSense error:", e)
    }
  }, [])

  return (
    <div className="ad-unit-wrap">
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