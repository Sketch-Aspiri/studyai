import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "StudyAI — Transforma tus documentos en recursos de estudio con IA"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "64px",
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
            }}
          >
            📚
          </div>
          <span style={{ fontSize: "48px", fontWeight: 700, color: "#ffffff" }}>
            StudyAI
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          Transforma tus documentos en recursos de estudio
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Resúmenes · Mapas conceptuales · Exámenes · Flashcards
        </div>

        {/* CTA pill */}
        <div
          style={{
            marginTop: "48px",
            background: "#ffffff",
            color: "#4F46E5",
            fontSize: "22px",
            fontWeight: 600,
            padding: "14px 36px",
            borderRadius: "999px",
          }}
        >
          Gratis — sin tarjeta requerida
        </div>
      </div>
    ),
    { ...size }
  )
}
