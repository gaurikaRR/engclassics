import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
})

export const metadata: Metadata = {
  title: 'EngClassics — English Literature\'s Greatest Works',
  description:
    'Free classic texts with community reviews, PDF access, and curated editions.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="bg-stone-50 text-stone-900 font-lato min-h-screen">
        <Navbar user={user} profile={profile} />
        <main>{children}</main>
      </body>
    </html>
  )
}
