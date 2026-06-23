import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import type Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "Sin firma" }, { status: 400 })

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET no configurado" }, { status: 500 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firma inválida"
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        if (!userId || !session.subscription) break

        await db.user.update({
          where: { id: userId },
          data: {
            subscription_status: "PRO",
            subscription_id: session.subscription as string,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const dbUser = await db.user.findFirst({
          where: { stripe_customer_id: sub.customer as string },
        })
        if (!dbUser) break

        const status = sub.status === "active" ? "PRO" : "CANCELED"

        await db.user.update({
          where: { id: dbUser.id },
          data: {
            subscription_status: status,
            subscription_id: sub.id,
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const dbUser = await db.user.findFirst({
          where: { stripe_customer_id: sub.customer as string },
        })
        if (!dbUser) break

        await db.user.update({
          where: { id: dbUser.id },
          data: {
            subscription_status: "CANCELED",
            subscription_ends_at: new Date(),
          },
        })
        break
      }
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
