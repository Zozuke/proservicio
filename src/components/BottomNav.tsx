'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/lang-context'
import { Home, FileText, Calendar, Users, Settings } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLang()

  const links = [
    { href: '/dashboard', icon: Home, label: t('dashboard') },
    { href: '/quotes', icon: FileText, label: t('quotes') },
    { href: '/jobs', icon: Calendar, label: t('jobs') },
    { href: '/clients', icon: Users, label: t('clients') },
    { href: '/settings', icon: Settings, label: t('settings') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe z-50">
      <div className="flex max-w-lg mx-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? 'text-primary-500' : 'text-muted'}`}>
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
