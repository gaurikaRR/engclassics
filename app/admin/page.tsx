'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GENRES } from '@/types'

export default function AdminPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [checking, setChecking]     = useState(true)
  const [isAdmin, setIsAdmin]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage]       = useState('')
  const [title, setTitle]           = useState('')
  const [author, setAuthor]         = useState('')
  const [genre, setGenre]           = useState<string>(GENRES[0])
  const [year, setYear]             = useState('')
  const [summary, setSummary]       = useState('')
  const [isbn, setIsbn]             = useState('')
  const [amazonLink, setAmazonLink] = useState('')
  const [pdfFile, setPdfFile]       = useState<File | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
        return
      }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single()
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
      if (pdfFile) {
        const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '-')}`
        const { error: uploadError } = await supabase.storage
          .from('book-pdfs').upload(fileName, pdfFile, { contentType: 'application/pdf' })
        if (uploadError) throw new Error('PDF upload failed: ' + uploadError.message)
        pdfUrl = fileName
      }
      const { error: insertError } = await supabase.from('books').insert({
        title, author, genre,
        year_published: year ? parseInt(year) : null,
        summary, isbn, amazon_link: amazonLink, pdf_url: pdfUrl,
      })
      if (insertError) throw new Error('Book upload failed: ' + insertError.message)
      setMessage(`✓ "${title}" added successfully!`)
      setTitle(''); setAuthor(''); setYear(''); setSummary('')
      setIsbn(''); setAmazonLink(''); setPdfFile(null)
      const f = document.getElementById('pdf-input') as HTMLInputElement
      if (f) f.value = ''
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
    setSubmitting(false)
  }

  if (checking) return <div style={{ padding: '40px', color: '#78716c' }}>Checking access…</div>
  if (!isAdmin) return null

  const inputStyle = {
    width: '100%', border: '1px solid #d6d3d1', borderRadius: '8px',
    padding: '10px 14px', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', color: '#1c1917', backgroundColor: 'white',
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 600, color: '#1c1917', marginBottom: '6px' }}>
        Admin — Add a book
      </h1>
      <p style={{ color: '#78716c', fontSize: '14px', marginBottom: '32px' }}>
        Fields marked * are required.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Author *</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Genre *</label>
          <select value={genre} onChange={e => setGenre(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Year Published</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 1813" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Summary</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>ISBN * <span style={{ fontWeight: 400, color: '#a8a29e' }}>(13-digit number)</span></label>
          <input value={isbn} onChange={e => setIsbn(e.target.value)} required placeholder="e.g. 9780141439518" style={{ ...inputStyle, fontFamily: 'monospace' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>PDF <span style={{ fontWeight: 400, color: '#a8a29e' }}>(public domain only — leave empty for copyrighted books)</span></label>
          <input id="pdf-input" type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: '8px 14px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '6px' }}>Amazon link * <span style={{ fontWeight: 400, color: '#a8a29e' }}>(include affiliate tag)</span></label>
          <input value={amazonLink} onChange={e => setAmazonLink(e.target.value)} required placeholder="https://amazon.com/dp/...?tag=your-tag-20" style={inputStyle} />
        </div>

        {message && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '14px', backgroundColor: message.startsWith('✓') ? '#f0fdf4' : '#fef2f2', color: message.startsWith('✓') ? '#166534' : '#991b1b', border: `1px solid ${message.startsWith('✓') ? '#bbf7d0' : '#fecaca'}` }}>
            {message}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ backgroundColor: '#1c1917', color: 'white', border: 'none', borderRadius: '10px', padding: '13px 24px', fontSize: '14px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Uploading…' : 'Add book to library'}
        </button>
      </form>
    </div>
  )
}