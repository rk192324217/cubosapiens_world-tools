"use client"

import { useState, useEffect, useRef } from "react"

export default function Clock() {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [dayOfWeek, setDayOfWeek] = useState<string>("")
  const [timezone, setTimezone] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [timeFormat, setTimeFormat] = useState<"12" | "24">("12")
  const [showAnalogClock, setShowAnalogClock] = useState(false)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    // Update time immediately
    const updateTime = () => {
      const now = new Date()
      
      // Get timezone
      const tzName = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "short",
      }).formatParts(now).find(part => part.type === "timeZoneName")?.value || "UTC"
      setTimezone(tzName)

      // 12-hour format
      const timeStr12 = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })

      // 24-hour format
      const timeStr24 = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })

      const timeStr = timeFormat === "12" ? timeStr12 : timeStr24

      const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      const dayStr = now.toLocaleDateString("en-US", {
        weekday: "long",
      })

      setTime(timeStr)
      setDate(dateStr)
      setDayOfWeek(dayStr)
      
      // For analog clock
      setHours(now.getHours() % 12)
      setMinutes(now.getMinutes())
      setSeconds(now.getSeconds())
    }

    updateTime()

    // Update every second
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [timeFormat])

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="clock-widget flex items-center gap-2">
        <div className="w-16 h-6 bg-white/5 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div
      ref={widgetRef}
      className="clock-widget-wrapper"
      style={isDragging ? { position: "fixed", left: `${position.x}px`, top: `${position.y}px`, zIndex: 9999, cursor: "grabbing" } : {}}
      onMouseDown={handleMouseDown}
    >
      {/* Compact Clock Display */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="clock-button group no-drag relative flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 cursor-grab active:cursor-grabbing"
        aria-label="Toggle clock details"
      >
        <i className="fa-regular fa-clock text-brand text-xs md:text-sm" />
        <span className="clock-time font-mono text-xs md:text-sm font-semibold text-white whitespace-nowrap">
          {time}
        </span>

        {/* Tooltip on hover */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {dayOfWeek}
        </div>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="clock-expanded-panel no-drag fixed md:absolute bottom-4 left-4 right-4 md:top-full md:right-0 md:mt-2 md:bottom-auto z-50 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-3 md:p-4 shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300 md:min-w-[250px] max-w-sm">
          <div className="space-y-3 md:space-y-4">
            {/* Format Toggle */}
            <div className="flex gap-2 pb-3 border-b border-white/10">
              <button
                onClick={() => setTimeFormat("12")}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  timeFormat === "12"
                    ? "bg-brand/20 border border-brand text-brand"
                    : "border border-white/20 text-white/60 hover:text-white"
                }`}
              >
                12h
              </button>
              <button
                onClick={() => setTimeFormat("24")}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  timeFormat === "24"
                    ? "bg-brand/20 border border-brand text-brand"
                    : "border border-white/20 text-white/60 hover:text-white"
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setShowAnalogClock(!showAnalogClock)}
                className="px-2 py-1 text-xs rounded border border-white/20 text-white/60 hover:text-white transition-all ml-auto"
                title="Toggle analog clock"
              >
                <i className="fa-solid fa-circle-notch" />
              </button>
            </div>

            {/* Analog Clock */}
            {showAnalogClock && (
              <div className="flex justify-center py-3 border-b border-white/10">
                <div className="relative w-24 h-24 rounded-full bg-white/5 border-2 border-brand/30">
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-brand rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20" />
                  
                  {/* Hour hand */}
                  <div
                    className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-white origin-bottom transform -translate-x-1/2 -translate-y-full rounded-full"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${(hours + minutes / 60) * 30}deg)`,
                    }}
                  />
                  
                  {/* Minute hand */}
                  <div
                    className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-brand/80 origin-bottom transform -translate-x-1/2 -translate-y-full rounded-full"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${minutes * 6}deg)`,
                    }}
                  />
                  
                  {/* Second hand */}
                  <div
                    className="absolute top-1/2 left-1/2 w-px h-9 bg-brand origin-bottom transform -translate-x-1/2 -translate-y-full"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${seconds * 6}deg)`,
                    }}
                  />

                  {/* Hour markers */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-px h-1.5 bg-white/40 left-1/2 top-1 transform -translate-x-1/2"
                      style={{
                        transform: `translate(-50%, 0) rotate(${i * 30}deg)`,
                        transformOrigin: "center 45px",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Time Display */}
            <div className="flex items-center gap-2 md:gap-3 pb-2 md:pb-3 border-b border-white/10">
              <i className="fa-regular fa-clock text-brand text-lg" />
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">Current Time</p>
                <p className="font-mono text-base md:text-lg font-bold text-white">{time}</p>
              </div>
            </div>

            {/* Date Display */}
            <div className="flex items-center gap-2 md:gap-3 pb-2 md:pb-3 border-b border-white/10">
              <i className="fa-regular fa-calendar text-brand text-lg" />
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">Date</p>
                <p className="font-semibold text-sm md:text-base text-white">{date}</p>
              </div>
            </div>

            {/* Day of Week Display */}
            <div className="flex items-center gap-2 md:gap-3 pb-2 md:pb-3 border-b border-white/10">
              <i className="fa-regular fa-sun text-brand text-lg" />
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">Day</p>
                <p className="font-semibold text-sm md:text-base text-white">{dayOfWeek}</p>
              </div>
            </div>

            {/* Timezone Display */}
            <div className="flex items-center gap-2 md:gap-3">
              <i className="fa-solid fa-globe text-brand text-lg" />
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">Timezone</p>
                <p className="font-semibold text-sm md:text-base text-white">{timezone}</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 p-1 text-white/60 hover:text-white transition-colors no-drag"
            aria-label="Close clock panel"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>
      )}

      {/* Close expanded panel on outside click */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
