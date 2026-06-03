'use client'

import { useState } from 'react'
import BookCard from './BookCard'
import type { Book } from '@/types'

export default function SearchBooks({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('')

  const filtered = books.filter(b => {
    const q = query.toLowerCase()
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '32px' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, author or genre…"
          style={{
            width: '100%',
            maxWidth: '420px',
            border: '1px solid #d6d3d1',
            borderRadius: '999px',
            padding: '10px 20px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
            color: '#1c1917',
          }}
          onFocus={e => (e.target.style.borderColor = '#78716c')}
          onBlur={e => (e.target.style.borderColor = '#d6d3d1')}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p style={{ color: '#78716c', fontSize: '14px', padding: '32px 0' }}>
          No books match your search.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '20px',
        }}>
          {filtered.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
