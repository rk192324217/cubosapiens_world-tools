import ContactForm from "@/components/ui/ContactForm"

export const metadata = {
  title: "Contact — CUBOSAPIENS",
  description: "Contact CUBOSAPIENS — report bugs, suggest features, or say hello",
}

export default function ContactPage()
{
  return (
    <div className="page-container">

      <div className="page-hero">
        <span className="section-tag">Get in touch</span>
        <h1 className="page-hero-title">Contact Us</h1>
        <p className="page-hero-sub">
          Bug report, feature request, or just want to say hi — we read everything.
        </p>
      </div>

      <div className="contact-wrap">
        <ContactForm />

        <div className="contact-info">
          <h3 className="contact-info-title">Other ways to reach us</h3>
          <p className="contact-info-item">
            📧 <a href="mailto:hello@cubosapiens.world" className="about-link">hello@cubosapiens.world</a>
          </p>
          <p className="contact-info-item">
            🌐 <a href="https://cubosapiens.world" className="about-link">cubosapiens.world</a>
          </p>
          <p className="contact-info-note">
            We typically respond within 2-3 business days.
          </p>
        </div>
      </div>

    </div>
  )
}