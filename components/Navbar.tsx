'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface NavbarProps {
  user: User | null
  profile: Profile | null
}

export default function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="bg-[#1c1410] text-stone-100 px-6 py-0 flex items-center h-14 gap-6 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="font-playfair text-xl font-medium tracking-tight text-amber-100 hover:text-white transition-colors">
        EngClassics
      </Link>

      <div className="flex-1" />

      {/* Admin link (only shown to admins) */}
      {profile?.role === 'admin' && (
        <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-100 transition-colors">
          Admin
        </Link>
      )}

      {/* Auth section */}
      {user ? (
        <div className="flex items-center gap-3">
          {profile?.avatar_url && (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name || 'User'}
              width={30}
              height={30}
              className="rounded-full ring-1 ring-stone-600"
            />
          )}
          <span className="text-sm text-stone-300 hidden sm:block">
            {profile?.display_name}
          </span>
          <button
            onClick={signOut}
            className="text-sm bg-stone-800 hover:bg-stone-700 px-4 py-1.5 rounded-full transition-colors border border-stone-700"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={signIn}
          className="text-sm bg-stone-800 hover:bg-stone-700 px-4 py-1.5 rounded-full transition-colors border border-stone-600"
        >
          Sign in with Google
        </button>
      )}
    </nav>
  )
}
