# EngClassics — Setup Instructions
# Follow these steps in order after Phase 1 and 2 are complete

---

## PHASE 3 — Database Setup (5 minutes)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `setup.sql` from this folder
5. Copy the entire contents and paste into the SQL editor
6. Click **Run** (green button)
7. You should see "Success. No rows returned."

That's it — all 3 tables, RLS policies, storage bucket, and trigger are created.

---

## PHASE 4 — Copy code files into your Next.js project (15 minutes)

### Step 1: Install required packages
Open your VS Code terminal (the engclassics project folder) and run:
```
npm install @supabase/ssr @supabase/supabase-js
```

### Step 2: Set up environment variables
- Copy `.env.local.example` into your project root
- Rename it to `.env.local`
- Go to Supabase → Project Settings → API
- Copy the Project URL → paste as NEXT_PUBLIC_SUPABASE_URL
- Copy the anon public key → paste as NEXT_PUBLIC_SUPABASE_ANON_KEY

### Step 3: Copy all files
Copy every file and folder from this download into your engclassics project,
matching the folder structure exactly:

```
next.config.js        → project root (replace existing)
middleware.ts         → project root
types/index.ts        → create types/ folder, add index.ts
lib/supabase/client.ts → create lib/supabase/ folder, add client.ts
lib/supabase/server.ts → same folder, add server.ts
components/Navbar.tsx  → create components/ folder
components/BookCard.tsx
components/SearchBooks.tsx
components/ReviewSection.tsx
app/globals.css        → replace existing
app/layout.tsx         → replace existing
app/page.tsx           → replace existing
app/book/[id]/page.tsx → create app/book/[id]/ folder
app/admin/page.tsx     → create app/admin/ folder
app/auth/callback/route.ts → create app/auth/callback/ folder
app/api/pdf/route.ts   → create app/api/pdf/ folder
```

### Step 4: Enable Google sign-in in Supabase
- Supabase → Authentication → Providers → Google → Enable
- Paste your Google Client ID and Client Secret
- Set Redirect URL to: https://your-project.supabase.co/auth/v1/callback
- Save

### Step 5: Test locally
```
npm run dev
```
Open http://localhost:3000 — you should see the homepage.

### Step 6: Push to GitHub → auto-deploys to Vercel
```
git add .
git commit -m "Complete engclassics app"
git push
```
Vercel will detect the push and deploy automatically. Takes ~30 seconds.

### Step 7: Add environment variables to Vercel
- Vercel dashboard → your project → Settings → Environment Variables
- Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Redeploy

---

## PHASE 5 — Add content (use isbn_reference.md)

1. Sign in to your live site with Google
2. Go to Supabase → Table Editor → profiles → find your row → change role to 'admin'
3. Go to yoursite.com/admin
4. Upload each of the 30 books using isbn_reference.md for the ISBN numbers
5. For the 18 public domain books: download PDFs from gutenberg.org and attach them
6. For the 12 copyright books: leave PDF empty, just fill in the Amazon affiliate link

---

## Amazon Affiliate Setup
1. Go to associates.amazon.com and apply
2. Wait for approval (24-48 hrs)
3. Get your affiliate tag (e.g. engclassics-20)
4. When adding Amazon links to books, format them as:
   https://www.amazon.com/dp/PRODUCT_ID?tag=engclassics-20

---

That's everything. The site is fully functional once these steps are complete.
