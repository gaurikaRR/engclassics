'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getCoverUrl, GENRE_COLOURS } from '@/types'
import type { Book } from '@/types'

export default function BookCard({ book }: { book: Book }) {
  const [imgFailed, setImgFailed] = useState(false)
  const colour = GENRE_COLOURS[book.genre] || '#3A2A4A'
  const rating  = book.avg_rating || 0
  const stars   = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))

  return (
    <Link href={`/book/${book.id}`} className="block group">
      <div className="rounded-xl overflow-hidden border border-stone-200 bg-white transition-all duration-200 group-hover:-translate-y-1 group-hover:border-stone-300 h-full">

        {/* Cover */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ height: '200px', backgroundColor: colour }}
        >
          {!imgFailed ? (
            <img
              src={getCoverUrl(book.isbn)}
              alt={book.title}
              onError={() => setImgFailed(true)}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            /* Fallback: styled text on coloured background */
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: 1.35,
                marginBottom: '6px',
                fontFamily: 'var(--font-playfair, Georgia, serif)',
              }}>
                {book.title}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
                {book.author}
              </p>
            </div>
          )}
        </div>

        {/* Info — title shown only once here */}
        <div style={{ padding: '12px' }}>
          <p style={{
            fontWeight: 600,
            fontSize: '13px',
            color: '#1c1917',
            marginBottom: '3px',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {book.title}
          </p>
          <p style={{ fontSize: '12px', color: '#78716c', marginBottom: '8px' }}>
            {book.author}
          </p>
          <p style={{ color: '#f59e0b', fontSize: '13px', letterSpacing: '1px' }}>{stars}</p>
          <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '2px' }}>
            {rating.toFixed(1)} · {book.review_count || 0} reviews
          </p>
        </div>
      </div>
    </Link>
  )
}
