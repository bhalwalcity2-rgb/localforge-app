# LocalForge App Foundation

LocalForge is a Local SEO operations platform. The first module is citation management, with room to add GBP audits, reviews, rank tracking, competitor analysis, and reporting later.

## What Is Included

- Next.js app structure
- LocalForge dashboard UI
- Citation module screens
- Supabase-ready database schema
- GitHub Actions CI workflow
- Vercel deployment-ready setup

## Owner Workflow

1. Changes are made in the app code.
2. Code is saved to GitHub.
3. Automatic checks run.
4. Vercel deploys the app.
5. You use the live dashboard link.

## First Setup Needed Later

- Create GitHub repository
- Create Supabase project
- Add environment variables in Vercel
- Connect GitHub repository to Vercel

## Environment Variables

Copy `.env.example` to `.env.local` for local development.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Database

The first database schema is in:

```text
supabase/migrations/001_initial_schema.sql
```

## Status

This is the app foundation. The UI currently uses sample data. The next build step is connecting the screens to Supabase.
