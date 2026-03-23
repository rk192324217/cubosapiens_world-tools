import Link from "next/link"

export default function NotFound()
{
  return (
    <div className="page-container" style={{ textAlign: "center", paddingTop: "80px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "80px", color: "var(--brand)" }}>
        404
      </h1>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", marginBottom: "12px" }}>
        Page not found
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        The page you are looking for does not exist.
      </p>
      <Link href="/" style={{
        background: "var(--brand)",
        color: "white",
        padding: "12px 28px",
        borderRadius: "10px",
        fontWeight: 600,
        fontSize: "14px",
      }}>
        ← Back to Home
      </Link>
    </div>
  )
}