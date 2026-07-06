"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
})

const fullTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
})

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
})

export default function LocalTimeWidget() {
  const [now, setNow] = useState<Date | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNow(new Date())

    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!widgetRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const timeZone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone"
  }, [])

  const compactTime = now ? timeFormatter.format(now) : "--:--"
  const fullTime = now ? fullTimeFormatter.format(now) : "--:--:--"
  const date = now ? dateFormatter.format(now) : "Loading date"
  const shortDate = now ? shortDateFormatter.format(now) : ""
  const weekday = now ? weekdayFormatter.format(now) : "Loading"

  return (
    <div className="local-time-widget" ref={widgetRef}>
      <button
        type="button"
        className="local-time-toggle"
        aria-expanded={isOpen}
        aria-controls="local-time-panel"
        aria-label={isOpen ? "Hide local time details" : "Show local time details"}
        onClick={() => setIsOpen(open => !open)}
      >
        <i className="fa-regular fa-clock" aria-hidden="true" />
        <span className="local-time-summary">
          <span>{compactTime}</span>
          <span aria-hidden="true">•</span>
          <span className="local-time-date">{shortDate}</span>
        </span>
      </button>

      {isOpen && (
        <div
          className="local-time-panel"
          id="local-time-panel"
          role="region"
          aria-label="Local time details"
        >
          <div className="local-time-panel-row">
            <span>Time</span>
            <strong>{fullTime}</strong>
          </div>
          <div className="local-time-panel-row">
            <span>Date</span>
            <strong>{date}</strong>
          </div>
          <div className="local-time-panel-row">
            <span>Day</span>
            <strong>{weekday}</strong>
          </div>
          <div className="local-time-zone">{timeZone}</div>
        </div>
      )}
    </div>
  )
}
