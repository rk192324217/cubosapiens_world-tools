"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}
export default function PWAInstallPrompt()
{
  
 const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  // Check installed and dismissed lazily — no setState in effect
  const isInstalled = typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches

  const isDismissed = typeof window !== "undefined" &&
    !!localStorage.getItem("pwa_dismissed")

  useEffect(() => {

    if(isInstalled || isDismissed) return

    const handler = (e: Event) => {
      e.preventDefault()

  const deferredPrompt = e as BeforeInstallPromptEvent
  setPrompt(deferredPrompt)

  // console.log("PWA EVENT CAPTURED ✅")

  setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)

  }, [isInstalled, isDismissed])

  async function handleInstall()
  {
    if(!prompt) return
    prompt.prompt()
    const result = await prompt.userChoice
    if(result.outcome === "accepted") setVisible(false)
    setVisible(false)
  }

  function handleDismiss()
  {
    setVisible(false)
    localStorage.setItem("pwa_dismissed", Date.now().toString())
  }

  if(!visible || isInstalled) return null

  return (
    <div className="pwa-backdrop">
      <div className="pwa-popup">
        <button className="pwa-close" onClick={handleDismiss}>✕</button>
        <div className="pwa-icon">
          <Image
  src="/icons/icon-128.png"
  alt="CUBOSAPIENS"
  width={64}
  height={64}
/>
        </div> 
        <h3 className="pwa-title">Install CUBOSAPIENS</h3>
        <p className="pwa-desc">
          Add to your home screen for instant access to all tools, games and AI — works offline too.
        </p>
        <div className="pwa-btns">
          <button className="pwa-btn-install" onClick={handleInstall}>
            ⬇ Install App
          </button>
          <button className="pwa-btn-skip" onClick={handleDismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}