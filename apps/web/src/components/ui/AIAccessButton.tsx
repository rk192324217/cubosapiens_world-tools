"use client"

import Link from "next/link"
import { useState } from "react"
import type { ReactNode } from "react"
import AIUnavailableModal from "./AIUnavailableModal"

interface Props {
  href: string
  label: string
  icon?: ReactNode
  className?: string
  hasLive?: boolean
  showIcon?: boolean
}

export default function AIAccessButton({
  href,
  label,
  icon,
  className = "",
  hasLive = false,
  showIcon = true,
}: Props) {
  const [open, setOpen] = useState(false)

  const content = (
    <>
      {showIcon && icon && icon}
      {label}
    </>
  )

  if (!hasLive) {
    return (
      <>
        <button className={className} onClick={() => setOpen(true)}>
          {content}
        </button>
        <AIUnavailableModal open={open} onClose={() => setOpen(false)} />
      </>
    )
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

