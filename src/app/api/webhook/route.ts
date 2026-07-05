import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This is the ONLY place a quote should ever be marked as "paid".
// Stripe signs every request with STRIPE_WEBHOOK_SECRET, so we can trust
// this handler in a way we could never trust a plain redirect URL.
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const quoteId = session.metadata?.quoteId

    if (quoteId) {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'paid',
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        })
        .eq('id', quoteId)
        // Extra safety: only ever transition out of 'accepted', never overwrite
        // an already-paid quote or one that was never accepted.
        .eq('status', 'accepted')

      if (error) console.error('Error updating quote after payment:', error)
    }
  }

  return NextResponse.json({ received: true })
}

// Stripe needs the raw, unparsed request body to verify the signature.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
