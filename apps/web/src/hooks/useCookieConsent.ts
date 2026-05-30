"use client"

import { useCallback, useEffect, useState } from "react"

export type CookieConsent = {
  functional: true
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = "cookie_consent"

const DEFAULT_CONSENT: CookieConsent = {
  functional: true,
  analytics: false,
  marketing: false,
}

function parseConsent(value: string | null): CookieConsent | null
{
  if(!value) return null

  try
  {
    const parsed = JSON.parse(value) as Partial<CookieConsent>
    return {
      functional: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    }
  }
  catch
  {
    return null
  }
}

export function getStoredCookieConsent(): CookieConsent | null
{
  if(typeof window === "undefined") return null
  return parseConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY))
}

export function saveCookieConsent(consent: CookieConsent)
{
  if(typeof window === "undefined") return
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
  window.dispatchEvent(new Event("cookie-consent-change"))
}

export function useCookieConsent()
{
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const refreshConsent = useCallback(() => {
    setConsent(getStoredCookieConsent())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const loadConsent = window.setTimeout(refreshConsent, 0)

    window.addEventListener("storage", refreshConsent)
    window.addEventListener("cookie-consent-change", refreshConsent)

    return () => {
      window.clearTimeout(loadConsent)
      window.removeEventListener("storage", refreshConsent)
      window.removeEventListener("cookie-consent-change", refreshConsent)
    }
  }, [refreshConsent])

  const updateConsent = useCallback((nextConsent: CookieConsent) => {
    saveCookieConsent(nextConsent)
    setConsent(nextConsent)
  }, [])

  return {
    consent,
    isLoaded,
    defaultConsent: DEFAULT_CONSENT,
    setConsent: updateConsent,
  }
}
