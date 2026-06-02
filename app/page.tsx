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
    return <p className="p-8 text-red-600">Error loading books.</p>
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-playfair text-4xl font-semibold text-stone-900 mb-3">
          English Literature's Greatest Works
        </h1>
        <p className="text-stone-500 text-base">
          Free classic texts · community reviews · PDF access · curated editions
        </p>
      </div>

      {/* Search + Grid */}
      <SearchBooks books={books || []} />
    </div>
  )
}
