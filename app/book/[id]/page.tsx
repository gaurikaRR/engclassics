import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewSection from '@/components/ReviewSection'
import BookCard from '@/components/BookCard'
import { getCoverUrl, GENRE_COLOURS } from '@/types'

interface Props {
  params: { id: string }
}

export default async function BookPage({ params }: Props) {
  const supabase = await createClient()

  // Get logged-in user + profile
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // Fetch the book
  const { data: book } = await supabase
    .from('books_with_stats')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!book) return notFound()

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

  const coverColour = GENRE_COLOURS[book.genre] || '#3A2A4A'
  const roundedRating = Math.round(book.avg_rating || 0)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Back link */}
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800 transition-colors inline-flex items-center gap-1 mb-8">
        ← Back to library
      </Link>

      {/* Book header */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Cover */}
        <div
          className="relative w-full md:w-52 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: coverColour, minHeight: '14rem' }}
        >
          <Image
            src={getCoverUrl(book.isbn)}
            alt={book.title}
            fill
            className="object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 pointer-events-none">
            <span className="font-playfair text-white/90 text-base text-center font-medium leading-snug drop-shadow">
              {book.title}
            </span>
            <span className="text-white/50 text-sm mt-2">{book.author}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">{book.genre}</p>
          <h1 className="font-playfair text-3xl font-semibold text-stone-900 mb-1 leading-tight">
            {book.title}
          </h1>
          <p className="text-stone-500 text-base mb-4">{book.author} · {book.year_published}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-amber-500 text-xl tracking-wider">
              {'★'.repeat(roundedRating)}{'☆'.repeat(5 - roundedRating)}
            </span>
            <span className="font-semibold text-stone-800 text-lg">{(book.avg_rating || 0).toFixed(1)}</span>
            <span className="text-stone-400 text-sm">({book.review_count} reviews)</span>
          </div>

          {/* Summary */}
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">About this book</p>
          <p className="text-stone-700 text-sm leading-relaxed">{book.summary}</p>
        </div>
      </div>

      <hr className="border-stone-200 mb-10" />

      {/* Reviews */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-2xl font-semibold text-stone-900">
            Reviews <span className="text-stone-400 text-lg font-normal">({book.review_count})</span>
          </h2>
        </div>

        <ReviewSection
          bookId={book.id}
          initialReviews={reviews || []}
          user={user}
          profile={profile}
        />
      </section>

      <hr className="border-stone-200 mb-10" />

      {/* PDF + Amazon */}
      <section className="mb-12">
        <h2 className="font-playfair text-2xl font-semibold text-stone-900 mb-2">Get the book</h2>
        <p className="text-stone-500 text-sm mb-6">
          {book.pdf_url
            ? 'This is a public domain work — read it free online or buy a curated physical edition.'
            : 'This book is under copyright. Purchase a copy via Amazon.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* PDF button — only for public domain books */}
          {book.pdf_url && (
            <a
              href={`/api/pdf?book_id=${book.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-sm font-medium py-3 px-6 rounded-xl transition-colors"
            >
              📖 Read online (PDF)
            </a>
          )}

          {/* Amazon link */}
          {book.amazon_link && (
            <a
              href={book.amazon_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-medium py-3 px-6 rounded-xl transition-colors"
            >
              🛒 Buy hard copy on Amazon
            </a>
          )}
        </div>
      </section>

      {/* Similar books */}
      {similarBooks && similarBooks.length > 0 && (
        <>
          <hr className="border-stone-200 mb-10" />
          <section>
            <h2 className="font-playfair text-2xl font-semibold text-stone-900 mb-2">Similar books</h2>
            <p className="text-stone-500 text-sm mb-6">More from {book.genre}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {similarBooks.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
