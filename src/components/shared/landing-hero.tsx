"use client";

import { useRouter } from "next/navigation";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";

export function LandingHero() {
  const router = useRouter();

  return (
    <PixelHero
      word1="StudyAI"
      word2="Aprende."
      description="Transforma tus documentos en recursos de estudio con IA. Resúmenes, mapas conceptuales, exámenes y flashcards en segundos."
      primaryCta="Empieza gratis"
      primaryCtaMobile="Empieza"
      secondaryCta="Iniciar sesión"
      secondaryCtaMobile="Login"
      onPrimaryClick={() => router.push("/signup")}
      onSecondaryClick={() => router.push("/login")}
      marqueeLabel="Construido con tecnología de punta"
    />
  );
}
