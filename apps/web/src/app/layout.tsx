import type { Metadata }                    from "next"
import { Sora, Space_Grotesk, Inter,Geist  } from "next/font/google"
import "./globals.css"
import BackToTop from "@/components/BackToTop";
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import TrackVisit from "@/components/TrackVisit"
import { cn } from "@/lib/utils"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import CookieBanner from "@/components/CookieBanner"
import { fetchTools } from "@/lib/api"
const geist = Geist({subsets:["latin"],variable:"--font-sans"});


// ── Fonts loaded via next/font/google ─────────────────────────
// Next.js downloads these at build time  
// No external requests at runtime — fast + no layout shift

const sora = Sora({
  subsets:  ["latin"],
  weight:   "400",
  variable: "--font-display",
  display:  "swap",
})

const space = Space_Grotesk({
  subsets:  ["latin"],
  weight:   ["300","400", "600", "700", ],
  variable: "--font-heading",
  display:  "swap",
})

const inter = Inter({
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
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
})
{
  const aiTools = await fetchTools({ category: "ai" })
  const hasLiveAi = aiTools.length > 0

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
     <head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2633780400369885"
    crossOrigin="anonymous"></script>
</head>
      <body className={`${sora.variable} ${space.variable} ${inter.variable}`}>
        <TrackVisit />
        <Header hasLiveAi={hasLiveAi} />
        <main>{children}</main>
        <Footer />
        <PWAInstallPrompt />
        <CookieBanner />
        <BackToTop />
      </body>
    </html>
  )
}
