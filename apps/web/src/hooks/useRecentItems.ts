"use client"

import { useCallback, useEffect, useState } from "react"
import type { RecentItem }                   from "@/types"

// ── Constants ─────────────────────────────────────────────────
const STORAGE_KEY = "cubosapiens_recent"
const MAX_ITEMS   = 10

// ── Storage helpers ───────────────────────────────────────────
export function getStoredRecentItems(): RecentItem[]
{
  if(typeof window === "undefined") return []
  try
  {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if(!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  }
  catch
  {
    return []
  }
}

export function addRecentItem(item: Omit<RecentItem, "lastAccessed">): void
{
  if(typeof window === "undefined") return

  const next: RecentItem = { ...item, lastAccessed: Date.now() }

  // Dedupe: remove existing entry with same id, then prepend
  const existing = getStoredRecentItems().filter(r => r.id !== next.id)
  const updated  = [next, ...existing].slice(0, MAX_ITEMS)

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event("recent-items-change"))
}

export function clearRecentItems(): void
{
  if(typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event("recent-items-change"))
}

// ── React hook ────────────────────────────────────────────────
export function useRecentItems()
{
  const [items, setItems] = useState<RecentItem[]>([])

  const refresh = useCallback(() => {
    setItems(getStoredRecentItems())
  }, [])

  useEffect(() => {
    // Hydrate from localStorage on mount
    const timer = window.setTimeout(refresh, 0)

    window.addEventListener("storage",             refresh)
    window.addEventListener("recent-items-change", refresh)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("storage",             refresh)
      window.removeEventListener("recent-items-change", refresh)
    }
  }, [refresh])

  const addItem = useCallback((item: Omit<RecentItem, "lastAccessed">) => {
    addRecentItem(item)
    refresh()
  }, [refresh])

  const clearAll = useCallback(() => {
    clearRecentItems()
    refresh()
  }, [refresh])

  return { items, addItem, clearAll }
}
