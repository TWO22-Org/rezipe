# Backend Scaffold

This folder contains a minimal Supabase Edge Functions scaffold.

- functions/health: basic health endpoint
- supabase/: config and migrations placeholder

## Sentry
- Uses `.env.local` variables (see `.env.example`)
- DSN key: `SENTRY_DSN_EDGE`
- Default tags: `surface=edge`, `feature`, `flow`
