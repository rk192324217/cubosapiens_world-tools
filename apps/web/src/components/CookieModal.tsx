"use client"

import { useEffect, useRef, useState } from "react"
import type { CookieConsent } from "@/hooks/useCookieConsent"

type CookieModalProps = {
  initialConsent: CookieConsent
  onClose: () => void
  onSave: (consent: CookieConsent) => void
}

export default function CookieModal({
  initialConsent,
  onClose,
  onSave,
}: CookieModalProps)
{
  const [analytics, setAnalytics] = useState(initialConsent.analytics)
  const [marketing, setMarketing] = useState(initialConsent.marketing)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent)
    {
      if(event.key === "Escape")
      {
        onClose()
        return
      }

      if(event.key !== "Tab" || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]

      if(!firstElement || !lastElement) return

      if(event.shiftKey && document.activeElement === firstElement)
      {
        event.preventDefault()
        lastElement.focus()
      }
      else if(!event.shiftKey && document.activeElement === lastElement)
      {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
      previousFocus?.focus()
    }
  }, [onClose])

  function handleSave()
  {
    onSave({
      functional: true,
      analytics,
      marketing,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 text-white shadow-2xl ring-1 ring-white/10 sm:p-6"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-[#84ff00]">
              Privacy Preferences
            </p>
            <h2 id="cookie-modal-title" className="text-xl font-bold">
              Manage cookie consent
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/60">
              Choose which optional cookies CUBOSAPIENS can use. Functional cookies stay on so the site works properly.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg leading-none text-white/70 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#84ff00]"
            aria-label="Close cookie preferences"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3">
          <PreferenceToggle
            checked
            disabled
            label="Functional"
            description="Required for core site features and saved preferences."
            onChange={() => undefined}
          />
          <PreferenceToggle
            checked={analytics}
            label="Analytics"
            description="Helps us understand usage with privacy-conscious metrics."
            onChange={setAnalytics}
          />
          <PreferenceToggle
            checked={marketing}
            label="Marketing"
            description="Allows advertising and promotional personalization."
            onChange={setMarketing}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#84ff00]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="min-h-11 rounded-full bg-[#84ff00] px-5 py-2 text-sm font-bold text-black transition hover:bg-[#9cff2f] focus:outline-none focus:ring-2 focus:ring-[#84ff00] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

type PreferenceToggleProps = {
  checked: boolean
  disabled?: boolean
  label: string
  description: string
  onChange: (checked: boolean) => void
}

function PreferenceToggle({
  checked,
  disabled,
  label,
  description,
  onChange,
}: PreferenceToggleProps)
{
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20 hover:bg-white/[0.06]">
      <span>
        <span className="block text-sm font-bold text-white">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-white/55">{description}</span>
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={event => onChange(event.target.checked)}
          className="peer sr-only"
          aria-label={`${label} cookies`}
        />
        <span className="block h-7 w-12 rounded-full border border-white/15 bg-white/10 transition peer-checked:border-[#84ff00] peer-checked:bg-[#84ff00] peer-focus-visible:ring-2 peer-focus-visible:ring-[#84ff00] peer-disabled:opacity-70" />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5 peer-checked:bg-black" />
      </span>
    </label>
  )
}
