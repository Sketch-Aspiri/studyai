import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { getStripe } from "@/lib/stripe"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { stripe_customer_id: true, email: true, name: true },
  })
  if (!dbUser) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const stripe = getStripe()
  let customerId = dbUser.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name ?? undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await db.user.update({
      where: { id: user.id },
      data: { stripe_customer_id: customerId },
    })
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID
  if (!priceId) return NextResponse.json({ error: "STRIPE_PRO_PRICE_ID no configurado" }, { status: 500 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=1`,
    cancel_url: `${appUrl}/settings/billing?canceled=1`,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}
