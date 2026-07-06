"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useUserName } from "@/hooks/useUserName"
import { getGreeting } from "@/lib/greeting"

export default function OnboardingGreeting() {
  const { name, setName, clearName, isLoaded } = useUserName()
  const [showModal, setShowModal] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Portals need to run client-side only, after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isLoaded && !name) {
      setShowModal(true)
    }
  }, [isLoaded, name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    setName(inputValue)
    setShowModal(false)
    setIsEditing(false)
    setInputValue("")
  }

  const handleEditClick = () => {
    setInputValue(name ?? "")
    setIsEditing(true)
    setShowModal(true)
  }

  if (!isLoaded) return null

  const modal = showModal ? (
    <div className="onboarding-overlay" role="dialog" aria-modal="true">
      <div className="onboarding-modal">
        <h2 className="onboarding-title">
          {isEditing ? "Edit your name" : "Welcome to CUBOSAPIENS"}
        </h2>
        <p className="onboarding-subtitle">
          {isEditing
            ? "Update the name we use to greet you."
            : "What should we call you?"}
        </p>
        <form onSubmit={handleSubmit} className="onboarding-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Your name or nickname"
            className="onboarding-input"
            autoFocus
            maxLength={30}
          />
          <div className="onboarding-actions">
            <button type="submit" className="onboarding-submit">
              {isEditing ? "Save" : "Continue"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="onboarding-cancel"
                onClick={() => {
                  setShowModal(false)
                  setIsEditing(false)
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {isEditing && (
          <button
            type="button"
            className="onboarding-reset"
            onClick={() => {
              clearName()
              setShowModal(false)
              setIsEditing(false)
            }}
          >
            Forget my name
          </button>
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      {name && (
        <p className="hero-greeting">
          {getGreeting()}, {name}
          <button
            type="button"
            onClick={handleEditClick}
            className="hero-greeting-edit"
            aria-label="Edit your name"
          >
            <i className="fas fa-pen" />
          </button>
        </p>
      )}

      {mounted && modal && createPortal(modal, document.body)}
    </>
  )
}
