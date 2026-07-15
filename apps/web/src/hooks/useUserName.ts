"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "cubosapiens_user_name"

export function useUserName() {
  const [name, setNameState] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Read from localStorage once, on mount (client-side only)
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    setNameState(stored)
    setIsLoaded(true)
  }, [])

  const setName = useCallback((newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    window.localStorage.setItem(STORAGE_KEY, trimmed)
    setNameState(trimmed)
  }, [])

  const clearName = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setNameState(null)
  }, [])

  return { name, setName, clearName, isLoaded }
}
