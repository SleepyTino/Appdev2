# FitLife — AI-Powered Fitness & Wellness SaaS Platform

A production-ready fitness platform built with **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, **Supabase**, and **Google Gemini AI**.

---

## 🏗️ Architecture

```
├── app/
│   ├── (protected)/          # Authenticated routes (dashboard layout)
│   │   ├── layout.tsx        # Sidebar + TopBar + BottomNav shell
│   │   ├── dashboard/        # Home dashboard
│   │   ├── workouts/         # Workout templates & tracking
│   │   ├── meals/            # Meal logging & nutrition
│   │   ├── progress/         # Weekly analytics & goals
│   │   ├── ai-coach/         # AI fitness chat (Gemini)
│   │   └── profile/          # Profile & settings
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── auth/callback/        # OAuth callback handler
│   ├── api/ai/               # Secure Gemini AI route
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Root redirect
│   └── globals.css           # Tailwind + custom styles
├── components/
│   ├── layout/               # Sidebar, BottomNav, TopBar
│   └── ui/                   # Button, Input, Card, Select, etc.
├── lib/
│   ├── supabase/             # Client, Server, Middleware helpers
│   └── types/                # TypeScript types & DB schema
├── supabase/
│   └── schema.sql            # Complete database schema with RLS
├── middleware.ts              # Auth middleware (route protection)
└── public/                   # Static assets
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+** and npm/yarn/pnpm
- **Supabase** account ([supabase.com](https://supabase.com))
- **Google AI Studio** API key ([aistudio.google.com](https://aistudio.google.com/apikey))

### 1. Install Dependencies

```bash
cd Appdev2
npm install
```

### 2. Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase — get from: Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...your-service-role-key

# Gemini AI — get from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your-gemini-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

1. Go to your Supabase Dashboard → **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL — this creates all tables, indexes, RLS policies, and triggers

### 4. Configure Supabase Auth

1. **Email auth** is enabled by default
2. For **Google OAuth**:
   - Go to Dashboard → Authentication → Providers → Google
   - Add your Google OAuth Client ID & Secret
   - Set redirect URL: `http://localhost:3000/auth/callback`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security

| Feature | Implementation |
|---------|---------------|
| **Supabase credentials** | Stored in `.env.local`, never committed |
| **Gemini API key** | Server-only (`GEMINI_API_KEY` — no `NEXT_PUBLIC_` prefix) |
| **Route protection** | Next.js middleware verifies session on every request |
| **Row Level Security** | All Supabase tables have RLS policies |
| **OAuth flow** | Server-side code exchange via `/auth/callback` |
| **AI API** | Server-side only via `/api/ai` route — key never reaches client |

### Environment Variable Security

| Variable | Exposed to Client? | Usage |
|----------|-------------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes (safe) | Supabase endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes (safe with RLS) | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | Server-only admin operations |
| `GEMINI_API_KEY` | ❌ No | Server-only AI calls |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Extended user profiles (linked to auth.users) |
| `workouts` | Workout sessions with exercises (JSONB) |
| `meals` | Meal entries with macros |
| `progress_logs` | Weight, body fat, steps, activity tracking |

All tables use UUID primary keys, have foreign key constraints to `users`, and are protected by Row Level Security policies that ensure users can only access their own data.

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & DB**: Supabase (SSR auth helpers)
- **AI**: Google Gemini (server-side streaming)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — FitLife SaaS"
git remote add origin https://github.com/YOUR_USER/fitlife.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)
4. Deploy!

### 3. Update Supabase Auth URLs

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

For Google OAuth, also update the redirect URI in Google Cloud Console.

---

## 📱 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 1024px) | Bottom navigation, stacked cards, full-width |
| Desktop (≥ 1024px) | Sidebar navigation, grid layouts, proper spacing |

The UI is designed as a premium SaaS product — not a stretched mobile app. Desktop views use sidebars, multi-column grids, and optimized information density.

---

## 🤖 AI Coach (Gemini Integration)

The AI fitness coach uses Google Gemini with **streaming responses**:

1. User sends message from the client
2. Request goes to `/api/ai` (server-side Next.js route)
3. Server validates auth, calls Gemini API with system prompt
4. Response is streamed back to the client in real-time
5. API key never leaves the server

---

## 📄 License

MIT
