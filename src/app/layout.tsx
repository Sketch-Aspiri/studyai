import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "StudyAI — Transforma tus documentos en recursos de estudio con IA",
    template: "%s — StudyAI",
  },
  description:
    "Sube tus PDFs, presentaciones y documentos. Genera resúmenes, mapas conceptuales, exámenes y flashcards con IA. Gratis para siempre.",
  openGraph: {
    title: "StudyAI — Estudia más inteligente con IA",
    description: "Transforma tus documentos en recursos de estudio con IA en segundos.",
    type: "website",
    siteName: "StudyAI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "StudyAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyAI — Estudia más inteligente con IA",
    description: "Transforma tus documentos en recursos de estudio con IA en segundos.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
