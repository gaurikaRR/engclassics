export interface Book {
  id: string
  title: string
  author: string
  genre: string
  year_published: number
  summary: string
  isbn: string
  pdf_url: string | null
  amazon_link: string
  created_at: string
  avg_rating?: number
  review_count?: number
}

export interface Review {
  id: string
  book_id: string
  user_id: string
  rating: number
  review_text: string
  created_at: string
  profiles?: {
    display_name: string
    avatar_url: string
  }
}

export interface Profile {
  id: string
  display_name: string
  avatar_url: string
  role: string
  created_at: string
}

// Genres available in the admin dropdown — must match exactly across all books
export const GENRES = [
  'Literary Fiction & Social Realism',
  'Dystopian & Political Satire',
  'Gothic & Horror',
  'Adventure & High Seas',
  'Mystery, Crime & Suspense',
  'Epic Fantasy & Magical Realism',
  'Science Fiction',
  'Coming-of-Age & Family Sagas',
  'Historical & Multi-Cultural Fiction',
  'Satire & Absurdist Humor',
] as const

// Build Open Library cover URL from ISBN
export function getCoverUrl(isbn: string): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}

// Genre background colours for fallback covers (when Open Library has no image)
export const GENRE_COLOURS: Record<string, string> = {
  'Literary Fiction & Social Realism': '#4A2C6B',
  'Dystopian & Political Satire':      '#1B3A5A',
  'Gothic & Horror':                   '#7A1F2A',
  'Adventure & High Seas':             '#1A4A3A',
  'Mystery, Crime & Suspense':         '#3A2A1A',
  'Epic Fantasy & Magical Realism':    '#4A2C6B',
  'Science Fiction':                   '#1A3A5A',
  'Coming-of-Age & Family Sagas':      '#2E4A1E',
  'Historical & Multi-Cultural Fiction': '#5A3A1A',
  'Satire & Absurdist Humor':          '#5A2A4A',
}
