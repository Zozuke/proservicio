import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Starts (or resumes) Stripe's hosted onboarding for a tradesperson so that
// payments can be split automatically instead of sitting in the platform's
// account waiting for a manual bank transfer.
export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_account_id, email, business_name')
      .eq('id', userId)
      .single()

    if (error || !profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    let accountId = profile.stripe_account_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'MX',
        email: profile.email,
        business_type: 'individual',
        business_profile: { name: profile.business_name },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id
      await supabase.from('profiles').update({ stripe_account_id: accountId }).eq('id', userId)
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/api/stripe/connect?userId=${userId}`,
      return_url: `${appUrl}/settings?stripe_return=1`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error('Stripe connect error:', err)
    return NextResponse.json({ error: 'Could not start onboarding' }, { status: 500 })
  }
}

// Lets the settings page ask "is this account actually ready to receive
// payments yet?" — having a stripe_account_id saved isn't enough, since
// the tradesperson might have abandoned onboarding halfway through.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', userId)
    .single()

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ connected: false, pending: false })
  }

  try {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)
    return NextResponse.json({
      connected: !!account.charges_enabled,
      pending: !account.charges_enabled,
    })
  } catch {
    return NextResponse.json({ connected: false, pending: true })
  }
}
