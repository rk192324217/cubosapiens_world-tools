"use client"

import { useState } from "react"

export default function ContactForm()
{
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>)
  {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Replace YOUR_FORM_ID with your Formspree form ID
    // Sign up free at formspree.io
    const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
      method:  "POST",
      body:    data,
      headers: { Accept: "application/json" }
    })

    if(res.ok) setSent(true)
  }

  if(sent)
  {
    return (
      <div className="form-success">
        <span>✅</span>
        <h3>Message sent!</h3>
        <p>Weapos;ll get back to you within 2-3 business days.</p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label className="form-label">Your Name</label>
        <input name="name" className="form-input" placeholder="e.g. Ravi Kumar" required />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input name="email" type="email" className="form-input" placeholder="you@example.com" required />
      </div>

      <div className="form-group">
        <label className="form-label">Subject</label>
        <select name="subject" className="form-input">
          <option value="bug">🐛 Bug Report</option>
          <option value="feature">💡 Feature Request</option>
          <option value="general">👋 General Enquiry</option>
          <option value="business">💼 Business / Collaboration</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Message</label>
        <textarea name="message" className="form-input form-textarea" placeholder="Tell us what's on your mind..." required />
      </div>

      <button type="submit" className="form-submit">
        Send Message →
      </button>

    </form>
  )
}