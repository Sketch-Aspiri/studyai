import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Precios — StudyAI",
  description:
    "Planes simples y transparentes. Empieza gratis con 2 proyectos y 15 generaciones al mes. Actualiza a Pro por $9.99/mes para acceso ilimitado.",
  openGraph: {
    title: "Precios — StudyAI",
    description: "Planes para estudiantes y maestros. Empieza gratis, mejora cuando lo necesites.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "StudyAI Precios" }],
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
