import { NextResponse } from 'next/server'

// Deprecated: this route used to mark quotes as "paid" based only on a
// redirect, which meant anyone could fake a payment by visiting this URL
// directly. The webhook at /api/webhook is now the only source of truth.
// This route is kept only so old links don't 404 — it just forwards home.
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  return NextResponse.redirect(`${appUrl}/dashboard`)
}
