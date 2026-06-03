import { createClient } from '@/lib/supabase/server'
import SearchBooks from '@/components/SearchBooks'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: books, error } = await supabase
    .from('books_with_stats')
    .select('*')
    .order('title')

  if (error) {
    console.error(error)
    return (
      <div style={{ padding: '40px', color: '#dc2626' }}>
        Error loading books. Check your Supabase connection.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Hero */}
      <div style={{ marginBottom: '40px', borderBottom: '1px solid #e7e5e4', paddingBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: '38px',
          fontWeight: 600,
          color: '#1c1917',
          marginBottom: '10px',
          lineHeight: 1.2,
        }}>
          English Literature&apos;s Greatest Works
        </h1>
        <p style={{ color: '#78716c', fontSize: '15px' }}>
          Free classic texts &middot; community reviews &middot; PDF access &middot; curated editions
        </p>
        <p style={{
          marginTop: '8px',
          fontSize: '13px',
          color: '#a8a29e',
        }}>
          {books?.length || 0} books in the collection
        </p>
      </div>

      {/* Books */}
      <SearchBooks books={books || []} />
    </div>
  )
}
