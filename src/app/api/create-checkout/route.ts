import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: Request) {
  try {
    const { quoteId, amount, title } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: title }, unit_amount: amount }, quantity: 1 }],
      mode: 'payment',
      success_url: `${appUrl}/api/payment-success?quoteId=${quoteId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/quote/cancelled`,
      metadata: { quoteId },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 })
  }
}
