'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const getNavItems = (isAdmin: boolean) => [
  {
    href: '/',
    label: 'Vitrine',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} 
        stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    href: '/favoritos',
    label: 'Favoritos',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} 
        stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    ),
  },
  {
    href: '/anunciar',
    label: 'Anunciar',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} 
        stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { isAdmin, loading } = useAuth()
  const navItems = getNavItems(isAdmin)

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      bg-cream/95 backdrop-blur-xl
      border-t border-gold/25
      pb-[env(safe-area-inset-bottom)]
    ">
      <div className="max-w-[480px] mx-auto flex h-[58px]">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-[3px]
                font-dm text-[10px] tracking-widest uppercase
                transition-colors duration-200 relative
                ${active ? 'text-ink' : 'text-muted'}
              `}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-b" />
              )}
              {item.icon(active)}
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
