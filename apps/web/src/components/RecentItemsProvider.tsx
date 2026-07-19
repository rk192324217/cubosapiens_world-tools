"use client"

import { createContext, useContext, useCallback } from "react"
import { addRecentItem }                           from "@/hooks/useRecentItems"
import type { RecentItem }                         from "@/types"

// ── Context ───────────────────────────────────────────────────
interface RecentItemsContextValue {
  addItem: (item: Omit<RecentItem, "lastAccessed">) => void
}

export const RecentItemsContext = createContext<RecentItemsContextValue>({
  addItem: () => {},
})

export function useRecentItemsContext()
{
  return useContext(RecentItemsContext)
}

// ── Provider ──────────────────────────────────────────────────
export default function RecentItemsProvider({ children }: { children: React.ReactNode })
{
  const addItem = useCallback((item: Omit<RecentItem, "lastAccessed">) => {
    addRecentItem(item)
  }, [])

  return (
    <RecentItemsContext.Provider value={{ addItem }}>
      {children}
    </RecentItemsContext.Provider>
  )
}
