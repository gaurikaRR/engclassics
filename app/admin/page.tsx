'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GENRES } from '@/types'

export default function AdminPage() {
  const router  = useRouter()
  const supabase = createClient()

  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage]   = useState('')

  // Form fields
  const [title, setTitle]         = useState('')
  const [author, setAuthor]       = useState('')
  const [genre, setGenre]         = useState(GENRES[0])
  const [year, setYear]           = useState('')
  const [summary, setSummary]     = useState('')
  const [isbn, setIsbn]           = useState('')
  const [amazonLink, setAmazonLink] = useState('')
  const [pdfFile, setPdfFile]     = useState<File | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/'); return }
      setIsAdmin(true)
      setChecking(false)
    }
    checkAdmin()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !author || !genre || !isbn || !amazonLink) {
      setMessage('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      let pdfUrl: string | null = null

      // Upload PDF if provided
      if (pdfFile) {
        const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '-')}`
        const { error: uploadError } = await supabase.storage
          .from('book-pdfs')
          .upload(fileName, pdfFile, { contentType: 'application/pdf' })

        if (uploadError) throw new Error('PDF upload failed: ' + uploadError.message)
        pdfUrl = fileName // store path, not full URL
      }

      // Insert book row
      const { error: insertError } = await supabase.from('books').insert({
        title,
        author,
        genre,
        year_published: year ? parseInt(year) : null,
        summary,
        isbn,
        amazon_link: amazonLink,
        pdf_url: pdfUrl,
      })

      if (insertError) throw new Error('Book upload failed: ' + insertError.message)

      setMessage(`✓ "${title}" added successfully!`)
      // Reset form
      setTitle(''); setAuthor(''); setYear(''); setSummary('')
      setIsbn(''); setAmazonLink(''); setPdfFile(null)
      const fileInput = document.getElementById('pdf-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
    setSubmitting(false)
  }

  if (checking) return <div className="p-10 text-stone-500">Checking access…</div>
  if (!isAdmin) return null

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-playfair text-3xl font-semibold text-stone-900 mb-2">Admin — Add a book</h1>
      <p className="text-stone-500 text-sm mb-8">Fill in the details below. All fields marked * are required.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-500" />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Author *</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-500" />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Genre *</label>
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-500 bg-white">
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Year Published</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)}
            placeholder="e.g. 1813"
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-500" />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Summary</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4}
            placeholder="Use the vibe description from your book list…"
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-stone-500" />
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">ISBN * <span className="font-normal text-stone-400">(13-digit number from Amazon product page)</span></label>
          <input value={isbn} onChange={e => setIsbn(e.target.value)} required
            placeholder="e.g. 9780141439518"
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-stone-500" />
          {isbn && (
            <p className="text-xs text-stone-400 mt-1">
              Cover preview: <a href={`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">view image</a>
            </p>
          )}
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            PDF <span className="font-normal text-stone-400">(public domain books only — leave empty for copyrighted books)</span>
          </label>
          <input id="pdf-input" type="file" accept="application/pdf"
            onChange={e => setPdfFile(e.target.files?.[0] || null)}
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-stone-100 file:text-stone-700" />
        </div>

        {/* Amazon Link */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Amazon link * <span className="font-normal text-stone-400">(include your affiliate tag)</span></label>
          <input value={amazonLink} onChange={e => setAmazonLink(e.target.value)} required
            placeholder="https://amazon.com/dp/…?tag=your-tag-20"
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-500" />
        </div>

        {/* Submit */}
        {message && (
          <p className={`text-sm p-3 rounded-lg ${message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </p>
        )}

        <button type="submit" disabled={submitting}
          className="w-full bg-stone-900 text-white text-sm font-medium py-3 px-6 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50">
          {submitting ? 'Uploading…' : 'Add book to library'}
        </button>
      </form>
    </div>
  )
}
