import type { Metadata }                    from "next"
import { Alfa_Slab_One, Syne, DM_Sans,Geist }    from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import TrackVisit from "@/components/TrackVisit"
import { cn } from "@/lib/utils";
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// ── Fonts loaded via next/font/google ─────────────────────────
// Next.js downloads these at build time
// No external requests at runtime — fast + no layout shift

const alfaSlabOne = Alfa_Slab_One({
  subsets:  ["latin"],
  weight:   "400",
  variable: "--font-display",
  display:  "swap",
})

const syne = Syne({
  subsets:  ["latin"],
  weight:   ["400", "600", "700", "800"],
  variable: "--font-heading",
  display:  "swap",
})

const dmSans = DM_Sans({
  subsets:  ["latin"],
  variable: "--font-body",
  display:  "swap",
})
export const metadata: Metadata = {
  title: {
    default:  "CUBOSAPIENS",
    template: "%s | CUBOSAPIENS",
  },
  description: "Free browser tools, games and AI for everyone. No signup. No cost.",
  keywords:    ["free tools", "GPS photo stamp", "QR generator", "browser tools", "free online tools","online games", "password generator"],
  authors:     [{ name: "CUBOSAPIENS" }],
  creator:     "CUBOSAPIENS",
  metadataBase: new URL("https://cubosapiens.world"),
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://cubosapiens.world",
    siteName:    "CUBOSAPIENS",
    title:       "CUBOSAPIENS",
    description: "Free browser tools, games and AI for everyone. No signup. No cost.",
    images: [{
      url:    "/og-image.png",
      width:  1200,
      height: 630,
      alt:    "CUBOSAPIENS",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "CUBOSAPIENS",
    description: "Free browser tools, games and AI for everyone.",
    images:      ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon:  "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
}
export const viewport = {
  themeColor: "#000000",
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
})
{
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${alfaSlabOne.variable} ${syne.variable} ${dmSans.variable}`}>
        <TrackVisit />
        <Header />
        <main>{children}</main>
        <Footer />
        <PWAInstallPrompt />
      </body>
    </html>
  )
}