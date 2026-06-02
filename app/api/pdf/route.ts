import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('book_id')

  if (!bookId) {
    return NextResponse.json({ error: 'book_id is required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Only allow signed-in users to access PDFs
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in to read PDFs' }, { status: 401 })
  }

  // Get the PDF path from the books table
  const { data: book } = await supabase
    .from('books')
    .select('pdf_url, title')
    .eq('id', bookId)
    .single()

  if (!book?.pdf_url) {
    return NextResponse.json({ error: 'No PDF available for this book' }, { status: 404 })
  }

  // Generate a signed URL valid for 30 minutes (1800 seconds)
  const { data, error } = await supabase.storage
    .from('book-pdfs')
    .createSignedUrl(book.pdf_url, 1800)

  if (error || !data) {
    return NextResponse.json({ error: 'Could not generate PDF link' }, { status: 500 })
  }

  // Redirect user directly to the signed URL (opens PDF in browser)
  return NextResponse.redirect(data.signedUrl)
}
