"use client"
import { useEffect } from "react"
import { trackVisit } from "@/lib/api"
import { getStoredCookieConsent } from "@/hooks/useCookieConsent"

export default function TrackVisit()
{
  useEffect(() => {
    const consent = getStoredCookieConsent()
    if(consent?.analytics !== true) return

    if(!sessionStorage.getItem("visited"))
    {
      sessionStorage.setItem("visited", "1")
      trackVisit()
    }
  }, [])

  return null
}