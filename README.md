# RunbookForge

A modern platform for creating beautiful technical runbooks.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Clerk** (authentication)
- **Lucide React** (icons)

## Getting Started

### 1. Clone and Install

```bash
cd runbookforge-next
npm install
```

### 2. Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your API keys from the Clerk dashboard
4. Create `.env.local` file:

```bash
cp .env.example .env.local
```

5. Add your Clerk keys to `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Add authentication and dashboard"
git push
```

### 2. Add Environment Variables in Vercel

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`

### 3. Redeploy

Vercel will automatically redeploy when you push changes.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with Clerk
│   ├── globals.css           # Global styles
│   ├── sign-in/              # Sign in page
│   ├── sign-up/              # Sign up page
│   └── dashboard/            # Protected dashboard
│       ├── layout.tsx        # Dashboard layout with sidebar
│       ├── page.tsx          # Dashboard home
│       ├── create/           # Create runbook
│       ├── runbooks/         # My runbooks
│       ├── import/           # AI import
│       ├── templates/        # Templates
│       ├── shared/           # Shared with me
│       └── settings/         # Settings
├── middleware.ts             # Clerk auth middleware
└── components/               # Shared components
```

## Features

- ✅ Landing page with waitlist
- ✅ User authentication (Clerk)
- ✅ Dashboard with sidebar navigation
- ✅ Create runbook page (form builder)
- ✅ AI import page (placeholder)
- ✅ Templates page
- ✅ Settings page
- 🚧 Database integration (coming next)
- 🚧 Save/load runbooks
- 🚧 Export to HTML/PDF

## Next Steps

1. Add Supabase for database
2. Save runbooks to database
3. Add live preview
4. Add export functionality
5. Connect AI import to Claude API

---

© 2025 RunbookForge by StepUpTech
