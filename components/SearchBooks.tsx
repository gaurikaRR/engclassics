'use client'

import { useState } from 'react'
import BookCard from './BookCard'
import type { Book } from '@/types'

export default function SearchBooks({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('')

  const filtered = books.filter((b) => {
    const q = query.toLowerCase()
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* Search bar */}
      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author or genre…"
          className="w-full max-w-md border border-stone-300 rounded-full px-5 py-2.5 text-sm bg-white focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-300 placeholder:text-stone-400"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-stone-500 text-sm py-8">No books match your search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
