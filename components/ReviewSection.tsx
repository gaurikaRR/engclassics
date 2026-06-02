'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Review, Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

interface Props {
  bookId: string
  initialReviews: Review[]
  user: User | null
  profile: Profile | null
}

const FILTERS = ['All', '5★', '4★', '3★', '2★', '1★']

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-500 text-sm">
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

export default function ReviewSection({ bookId, initialReviews, user, profile }: Props) {
  const [reviews, setReviews]         = useState<Review[]>(initialReviews)
  const [filter, setFilter]           = useState('All')
  const [rating, setRating]           = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText]               = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const router = useRouter()
  const supabase = createClient()

  const displayed = filter === 'All'
    ? reviews
    : reviews.filter((r) => r.rating === parseInt(filter))

  async function submitReview() {
    if (!rating) { setError('Please select a star rating.'); return }
    if (!text.trim()) { setError('Please write your review.'); return }
    setSubmitting(true)
    setError('')

    const { data, error: err } = await supabase
      .from('reviews')
      .insert({ book_id: bookId, user_id: user!.id, rating, review_text: text })
      .select('*, profiles(display_name, avatar_url)')
      .single()

    if (err) {
      setError(err.message.includes('unique') ? 'You have already reviewed this book.' : err.message)
    } else {
      setReviews([data, ...reviews])
      setRating(0)
      setText('')
      router.refresh()
    }
    setSubmitting(false)
  }

  async function deleteReview(reviewId: string) {
    await supabase.from('reviews').delete().eq('id', reviewId)
    setReviews(reviews.filter((r) => r.id !== reviewId))
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              filter === f
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-300 text-stone-600 hover:border-stone-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Write a review (signed-in users only) */}
      {user ? (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-8">
          <p className="font-playfair font-semibold text-stone-800 mb-3">Write a review</p>

          {/* Star picker */}
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-colors"
                style={{ color: n <= (hoverRating || rating) ? '#F59E0B' : '#D6D3D1' }}
              >
                ★
              </button>
            ))}
            {rating > 0 && <span className="text-sm text-stone-500 ml-2 self-center">{rating} star{rating > 1 ? 's' : ''}</span>}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this book…"
            rows={3}
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-stone-500 mb-3"
          />

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          <button
            onClick={submitReview}
            disabled={submitting}
            className="bg-stone-900 text-white text-sm px-6 py-2 rounded-full hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      ) : (
        <p className="text-stone-500 text-sm mb-8">
          <span className="font-medium text-stone-700">Sign in with Google</span> to write a review.
        </p>
      )}

      {/* Review list */}
      {displayed.length === 0 ? (
        <p className="text-stone-500 text-sm py-6">No reviews at this rating yet.</p>
      ) : (
        <div className="divide-y divide-stone-100">
          {displayed.map((review) => (
            <div key={review.id} className="py-5">
              <div className="flex items-start gap-3 mb-2">
                {/* Avatar */}
                {review.profiles?.avatar_url ? (
                  <Image
                    src={review.profiles.avatar_url}
                    alt={review.profiles.display_name || 'Reviewer'}
                    width={34} height={34}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-[34px] h-[34px] rounded-full bg-stone-300 flex-shrink-0 flex items-center justify-center text-stone-600 text-xs font-bold">
                    {review.profiles?.display_name?.charAt(0) || '?'}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-800">
                      {review.profiles?.display_name || 'Anonymous'}
                    </span>
                    <Stars n={review.rating} />
                    <span className="text-stone-400 text-xs">
                      {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    {/* Delete button (own review or admin) */}
                    {(review.user_id === user?.id || profile?.role === 'admin') && (
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="text-xs text-stone-400 hover:text-red-500 ml-auto"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-stone-700 text-sm leading-relaxed pl-[46px]">
                {review.review_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
