"use client"

import { useCallback, useEffect, useState } from "react"
import type { Tool } from "@/types"

const STORAGE_KEY = "cubosapiens:recently-used-tools"
const MAX_ENTRIES = 5

export interface RecentToolEntry {
  id:       string | number
  slug:     string
  name:     string
  icon:     string
  usedAt:   string // ISO timestamp
}

function readEntries(): RecentToolEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupted or inaccessible storage — fail safe rather than throw.
    return []
  }
}

function writeEntries(entries: RecentToolEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage full or disabled (private browsing) — this is a nice-to-have
    // feature, not critical functionality, so silently no-op.
  }
}

/**
 * Record that a tool was used/viewed. Moves it to the front if already
 * present, and caps the list at MAX_ENTRIES (oldest entries drop off).
 */
export function recordRecentlyUsedTool(tool: Pick<Tool, "id" | "slug" | "name" | "icon">): void {
  const existing = readEntries().filter((entry) => entry.slug !== tool.slug)
  const updated: RecentToolEntry[] = [
    {
      id:     tool.id,
      slug:   tool.slug,
      name:   tool.name,
      icon:   tool.icon,
      usedAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, MAX_ENTRIES)

  writeEntries(updated)
}

export function clearRecentlyUsedTools(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // No-op if storage is unavailable.
  }
}

/**
 * React hook for reading recently used tools reactively (e.g. so the
 * homepage list updates immediately after "Clear history" is pressed,
 * without needing a full page reload).
 */
export function useRecentlyUsedTools() {
  const [entries, setEntries] = useState<RecentToolEntry[]>([])

  useEffect(() => {
    setEntries(readEntries())
  }, [])

  const clear = useCallback(() => {
    clearRecentlyUsedTools()
    setEntries([])
  }, [])

  return { entries, clear }
}