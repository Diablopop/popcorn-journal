'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  if (!user) return null

  const navItems = [
    { href: '/daily-entry', label: 'Daily Entry' },
    { href: '/history', label: 'History' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
