import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Platform's cut, kept in sync with what's shown to the user when the quote
// was created. We never trust an amount sent from the browser.
const PLATFORM_FEE_RATE = 0.02

export async function POST(req: Request) {
  try {
    const { quoteId } = await req.json()
    if (!quoteId) return NextResponse.json({ error: 'Missing quoteId' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    // Always read the real price and status from the database — never from
    // the request body. A tampered "amount" from a browser dev console can
    // no longer change what gets charged.
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, title, total, commission, status, public_token, user_id')
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    if (quote.status !== 'accepted') {
      return NextResponse.json({ error: 'Quote is not ready to be paid' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', quote.user_id)
      .single()

    const amount = Math.round(quote.total * 100)
    const applicationFeeAmount = Math.round(quote.commission * 100)

    // If the tradesperson has finished connecting their Stripe account, split
    // the payment automatically: they get paid directly, we keep our cut.
    // If not, the money still goes to the platform account (old behavior)
    // rather than blocking the client from paying.
    let connectedAccountReady = false
    if (profile?.stripe_account_id) {
      try {
        const account = await stripe.accounts.retrieve(profile.stripe_account_id)
        connectedAccountReady = !!account.charges_enabled
      } catch (e) {
        console.error('Could not verify connected account:', e)
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'oxxo'],
      line_items: [{
        price_data: { currency: 'mxn', product_data: { name: quote.title }, unit_amount: amount },
        quantity: 1,
      }],
      mode: 'payment',
      payment_method_options: {
        oxxo: { expires_after_days: 3 },
      },
      // OXXO vouchers are only redeemable in Mexico, hours or days after
      // checkout, so we don't get an instant redirect — the webhook is what
      // marks the quote as paid, whether it's card (instant) or OXXO (delayed).
      payment_intent_data: connectedAccountReady ? {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: profile!.stripe_account_id! },
      } : undefined,
      success_url: `${appUrl}/quote/${quote.public_token}?paid=1`,
      cancel_url: `${appUrl}/quote/${quote.public_token}?cancelled=1`,
      metadata: { quoteId: quote.id },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 })
  }
}
