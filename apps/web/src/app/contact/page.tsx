import ContactForm from "@/components/ui/ContactForm"

export const metadata = {
  title:       "Contact Us — CUBOSAPIENS",
  description: "Get in touch with CUBOSAPIENS. Report bugs, suggest new tools, ask about GSSoC contributions, or reach out for business enquiries. We respond within 2–3 business days.",
  keywords:    ["contact cubosapiens", "report bug", "feature request", "tool suggestion", "GSSoC", "open source contribution"],
  openGraph: {
    title:       "Contact CUBOSAPIENS",
    description: "Get in touch with the CUBOSAPIENS team. We're happy to hear from you.",
    url:         "https://cubosapiens.world/contact",
  },
}

export default function ContactPage()
{
  return (
    <div className="page-container">
      <div className="page-hero">
        <span className="section-tag">Get in touch</span>
        <h1 className="page-hero-title">Contact Us</h1>
        <p className="page-hero-sub">
          Bug report, feature request, contribution or just want to say hi - we read everything.
        </p>
      </div>
      <ContactForm />
    </div>
  )
}