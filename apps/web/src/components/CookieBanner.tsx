"use client"

import { useEffect, useState } from "react"
import CookieModal from "@/components/CookieModal"
import { useCookieConsent } from "@/hooks/useCookieConsent"
import type { CookieConsent } from "@/hooks/useCookieConsent"

export default function CookieBanner()
{
  const { consent, isLoaded, defaultConsent, setConsent } = useCookieConsent()
  const [isVisible, setIsVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if(!isLoaded || consent) return

    const frame = window.requestAnimationFrame(() => setIsVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [consent, isLoaded])

  function saveAndClose(nextConsent: CookieConsent)
  {
    setConsent(nextConsent)
    setIsModalOpen(false)
    setIsVisible(false)
  }

  if(!isLoaded || consent) return null

  return (
    <>
      <section
        className={`pointer-events-none fixed inset-x-0 bottom-4 z-[300] flex justify-center px-4 transition duration-300 ease-out sm:bottom-6 sm:px-6 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        aria-label="Cookie consent"
      >
        <div className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0b]/95 p-4 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#84ff00]/30 bg-[#84ff00]/10 text-sm font-black text-[#84ff00] sm:flex">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1 break-words text-xs font-bold uppercase tracking-[0.18em] text-[#84ff00] sm:tracking-[0.22em]">
                Cookie Preferences
              </p>
              <p className="max-w-none text-sm leading-6 text-white/75">
                We use essential storage to keep CUBOSAPIENS working. Choose whether to allow analytics and marketing cookies.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => saveAndClose({ functional: true, analytics: true, marketing: true })}
              className="min-h-11 whitespace-normal rounded-full bg-[#84ff00] px-5 py-2 text-sm font-bold leading-5 text-black transition hover:bg-[#9cff2f] focus:outline-none focus:ring-2 focus:ring-[#84ff00] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={() => saveAndClose(defaultConsent)}
              className="min-h-11 whitespace-normal rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-semibold leading-5 text-white/85 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#84ff00]"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="min-h-11 whitespace-normal rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-semibold leading-5 text-white/85 transition hover:border-[#84ff00]/60 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#84ff00]"
            >
              Manage Preferences
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <CookieModal
          initialConsent={defaultConsent}
          onClose={() => setIsModalOpen(false)}
          onSave={saveAndClose}
        />
      )}
    </>
  )
}
