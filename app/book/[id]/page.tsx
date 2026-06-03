import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewSection from '@/components/ReviewSection'
import BookCard from '@/components/BookCard'
import { getCoverUrl, GENRE_COLOURS } from '@/types'

// Next.js 15+ requires params to be awaited
interface Props {
  params: Promise<{ id: string }>
}

export default async function BookPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  // Get logged-in user + profile
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Fetch the book using the awaited id
  const { data: book, error } = await supabase
    .from('books_with_stats')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !book) return notFound()

  // Fetch reviews with reviewer profiles
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .eq('book_id', book.id)
    .order('created_at', { ascending: false })

  // Fetch similar books (same genre, excluding this book)
  const { data: similarBooks } = await supabase
    .from('books_with_stats')
    .select('*')
    .eq('genre', book.genre)
    .neq('id', book.id)
    .limit(3)

  const coverColour  = GENRE_COLOURS[book.genre] || '#3A2A4A'
  const rating       = book.avg_rating || 0
  const roundedRating = Math.round(rating)
  const stars        = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Back link */}
      <Link href="/" style={{ fontSize: '13px', color: '#78716c', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '32px' }}>
        ← Back to library
      </Link>

      {/* Book header */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', flexWrap: 'wrap' }}>

        {/* Cover */}
        <div style={{
          width: '160px',
          minWidth: '160px',
          height: '220px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: coverColour,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <img
            src={getCoverUrl(book.isbn)}
            alt={book.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600, lineHeight: 1.35 }}>{book.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '6px' }}>{book.author}</p>
          </div>
        </div>

        {/* Meta */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#a8a29e', marginBottom: '8px' }}>
            {book.genre}
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '28px', fontWeight: 600, color: '#1c1917', marginBottom: '6px', lineHeight: 1.2 }}>
            {book.title}
          </h1>
          <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '16px' }}>
            {book.author} &middot; {book.year_published}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ color: '#f59e0b', fontSize: '20px', letterSpacing: '2px' }}>{stars}</span>
            <span style={{ fontWeight: 600, fontSize: '18px', color: '#1c1917' }}>{rating.toFixed(1)}</span>
            <span style={{ fontSize: '13px', color: '#a8a29e' }}>({book.review_count || 0} reviews)</span>
          </div>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a8a29e', marginBottom: '8px' }}>About this book</p>
          <p style={{ fontSize: '14px', color: '#57534e', lineHeight: 1.75 }}>{book.summary}</p>
        </div>
      </div>

      <hr style={{ borderColor: '#e7e5e4', marginBottom: '36px' }} />

      {/* Reviews */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '22px', fontWeight: 600, color: '#1c1917' }}>
            Reviews <span style={{ fontWeight: 400, fontSize: '15px', color: '#a8a29e' }}>({book.review_count || 0})</span>
          </h2>
        </div>
        <ReviewSection
          bookId={book.id}
          initialReviews={reviews || []}
          user={user}
          profile={profile}
        />
      </section>

      <hr style={{ borderColor: '#e7e5e4', marginBottom: '36px' }} />

      {/* Get the book */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '22px', fontWeight: 600, color: '#1c1917', marginBottom: '8px' }}>
          Get the book
        </h2>
        <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '20px' }}>
          {book.pdf_url
            ? 'Public domain — read free online or buy a physical edition.'
            : 'This title is under copyright. Purchase via Amazon.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {book.pdf_url && (
            <a
              href={`/api/pdf?book_id=${book.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, minWidth: '160px',
                textAlign: 'center',
                border: '1px solid #d6d3d1',
                backgroundColor: '#fafaf9',
                color: '#1c1917',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              📖 Read online (PDF)
            </a>
          )}
          {book.amazon_link && (
            <a
              href={book.amazon_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, minWidth: '160px',
                textAlign: 'center',
                border: '1px solid #fbbf24',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              🛒 Buy on Amazon
            </a>
          )}
        </div>
      </section>

      {/* Similar books */}
      {similarBooks && similarBooks.length > 0 && (
        <>
          <hr style={{ borderColor: '#e7e5e4', marginBottom: '36px' }} />
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontSize: '22px', fontWeight: 600, color: '#1c1917', marginBottom: '6px' }}>
              Similar books
            </h2>
            <p style={{ fontSize: '13px', color: '#a8a29e', marginBottom: '20px' }}>
              More from {book.genre}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
              {similarBooks.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
