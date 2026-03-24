"use client"
import { useEffect } from "react"
import { trackVisit } from "@/lib/api"

export default function TrackVisit()
{
  useEffect(() => {
    if(!sessionStorage.getItem("visited"))
    {
      sessionStorage.setItem("visited", "1")
      trackVisit()
    }
  }, [])

  return null
}