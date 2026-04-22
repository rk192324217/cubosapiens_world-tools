"use client"

import { useState } from "react"

const socials = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/cubosapiens/",
    icon: "fa-brands fa-instagram",
    color: "#E1306C",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/channel/UCsG60rRXZ302vmYDYg4j97g",
    icon: "fa-brands fa-youtube",
    color: "#FF0000",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/cubosapiens/",
    icon: "fa-brands fa-linkedin",
    color: "#0A66C2",
  },
  // Discord coming soon
  // { name: "Discord", url: "https://discord.gg/cubosapiens", icon: "fa-brands fa-discord", color: "#5865F2" },
]

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch("https://formspree.io/f/mykldlbj", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })

      if (res.ok) {
        setSent(true)
      }
      else {
        setError("Something went wrong. Please try again or email us directly.")
      }
    }
    catch {
      setError("Network error. Please check your connection.")
    }
    finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="form-success">
        <span>✅</span>
        <h3>Message sent!</h3>
        <p>We will get back to you within 2-3 business days.</p>
      </div>
    )
  }

  return (
    <div className="contact-layout">

      {/* ── Form ── */}
      <form className="contact-form" onSubmit={handleSubmit}>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              name="name"
              className="form-input"
              placeholder="e.g. Ravi Kumar"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Type of Issue</label>
          <div className="form-options">
            {[
              { value: "bug", icon: "fa-solid fa-bug", label: "Bug Report" },
              { value: "feature", icon: "fa-solid fa-lightbulb", label: "Feature Request" },
              { value: "tool", icon: "fa-solid fa-wrench", label: "Tool Issue" },
              { value: "general", icon: "fa-solid fa-comment", label: "General Enquiry" },
              { value: "business", icon: "fa-solid fa-briefcase", label: "Business" },
              { value: "gssoc", icon: "fa-solid fa-code-branch", label: "GSSoC Contribution" },
            ].map(opt => (
              <label key={opt.value} className="form-option">
                <input type="radio" name="subject" value={opt.value} required />
                <span className="form-option-box">
                  <i className={opt.icon}></i>
                  <span>{opt.label}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="message"
            className="form-input form-textarea"
            placeholder="Describe your issue or message in detail..."
            required
          />
        </div>

        {error && (
          <p className="form-error">{error}</p>
        )}

        <button
          type="submit"
          className="form-submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message →"}
        </button>

      </form>

      {/* ── Right panel ── */}
      <div className="contact-side">

        {/* Contact details */}
        <div className="contact-info">
          <h3 className="contact-info-title">Get in touch</h3>

          <a href="mailto:cubosapiens@gmail.com" className="contact-detail-item">
            <div className="contact-detail-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div>
              <p className="contact-detail-label">General</p>
              <p className="contact-detail-value">cubosapiens@gmail.com</p>
            </div>
          </a>

          <a href="mailto:cubosapiens+support@gmail.com" className="contact-detail-item">
            <div className="contact-detail-icon">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div>
              <p className="contact-detail-label">Support</p>
              <p className="contact-detail-value">cubosapiens+support@gmail.com</p>
            </div>
          </a>

          <a href="mailto:cubosapiens+contact@gmail.com" className="contact-detail-item">
            <div className="contact-detail-icon">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <p className="contact-detail-label">Contact</p>
              <p className="contact-detail-value">cubosapiens+contact@gmail.com</p>
            </div>
          </a>

          <div className="contact-detail-item">
            <div className="contact-detail-icon">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div>
              <p className="contact-detail-label">Response time</p>
              <p className="contact-detail-value">Within 2–3 business days</p>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="contact-socials">
          <h3 className="contact-info-title">Follow us</h3>
          <div className="contact-social-grid">
            {socials.map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-box"
                title={s.name}
              >
                <i className={`${s.icon} contact-social-icon`}></i>
                <span className="contact-social-name">{s.name}</span>
              </a>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}