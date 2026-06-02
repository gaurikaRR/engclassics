-- ================================================================
-- ENGCLASSICS.COM — COMPLETE DATABASE SETUP
-- Paste this entire file into Supabase SQL Editor and click RUN
-- ================================================================

-- 1. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  author        TEXT NOT NULL,
  genre         TEXT NOT NULL,
  year_published INTEGER,
  summary       TEXT,
  isbn          TEXT,
  pdf_url       TEXT,
  amazon_link   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES TABLE (auto-populated from Google sign-in)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id       UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, user_id)  -- one review per user per book
);

-- 4. VIEW: books with average rating and review count
CREATE OR REPLACE VIEW public.books_with_stats AS
SELECT
  b.*,
  COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
  COUNT(r.id)::integer AS review_count
FROM public.books b
LEFT JOIN public.reviews r ON r.book_id = b.id
GROUP BY b.id;

-- 5. STORAGE BUCKET for PDFs (private — accessed via signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('book-pdfs', 'book-pdfs', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.books    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews  ENABLE ROW LEVEL SECURITY;

-- 7. BOOKS POLICIES
CREATE POLICY "Anyone can read books"
  ON public.books FOR SELECT USING (true);

CREATE POLICY "Admins can add books"
  ON public.books FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can edit books"
  ON public.books FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete books"
  ON public.books FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 8. PROFILES POLICIES
CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- 9. REVIEWS POLICIES
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Signed-in users can add reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users and admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 10. STORAGE POLICIES for book-pdfs bucket
CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'book-pdfs' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Signed-in users can view PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-pdfs' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 11. TRIGGER: auto-create profile row when user signs in with Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- DONE. All tables, policies, bucket, view and trigger created.
-- ================================================================
