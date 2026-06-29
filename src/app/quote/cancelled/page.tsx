'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CancelledPage() {
  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold text-white mb-2">Pago cancelado</h1>
        <p className="text-muted mb-6">No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.</p>
        <Link href="/" className="btn-primary block max-w-xs mx-auto">Volver al inicio</Link>
      </div>
    </div>
  )
}
