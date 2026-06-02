import Image from 'next/image'
import Link from 'next/link'
import { getCoverUrl, GENRE_COLOURS } from '@/types'
import type { Book } from '@/types'

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <span className="text-amber-500 text-sm tracking-wide">
        {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
      </span>
      <span className="text-stone-500 text-xs">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function BookCard({ book }: { book: Book }) {
  const coverColour = GENRE_COLOURS[book.genre] || '#3A2A4A'

  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white hover:border-stone-400 hover:-translate-y-1 transition-all duration-200">
        {/* Cover image */}
        <div className="relative h-48 w-full" style={{ backgroundColor: coverColour }}>
          <Image
            src={getCoverUrl(book.isbn)}
            alt={book.title}
            fill
            className="object-cover"
            onError={(e) => {
              // Hide the image on error — fallback colour shows through
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          {/* Fallback title shown over colour if image fails */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none">
            <span className="font-playfair text-white/90 text-sm text-center font-medium leading-snug drop-shadow">
              {book.title}
            </span>
            <span className="text-white/50 text-xs mt-1 text-center">{book.author}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="font-playfair font-semibold text-stone-900 text-sm leading-tight line-clamp-2 mb-1">
            {book.title}
          </p>
          <p className="text-stone-500 text-xs mb-2">{book.author}</p>
          <StarRating rating={book.avg_rating || 0} />
          <p className="text-stone-400 text-xs mt-1">{book.review_count} reviews</p>
        </div>
      </div>
    </Link>
  )
}
