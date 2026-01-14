# Phase 5: Merge & Deploy

Verify the app works end-to-end, then deploy to Vercel.

## Verification Checklist

### 1. Build Check
```bash
pnpm build
```
Must pass with no errors.

### 2. Integration Tests

Run through each user journey from the screen flows:

For each journey:
1. Start the dev server: `pnpm dev`
2. Manually walk through the journey
3. Verify each step works as designed

Report to participant: "Testing [journey name]... works / found issue: [describe]"

### 3. Fix Any Issues

If tests reveal problems:
1. Identify which agent's code has the bug
2. Fix it directly (no need to re-dispatch)
3. Re-run the affected test

## Deploy to Vercel

### First-Time Setup (if no Vercel project exists)

1. Ensure participant has Vercel account
2. Link to Vercel:
   ```bash
   npx vercel link
   ```
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any other env vars the app needs

### Deploy

```bash
npx vercel --prod
```

Wait for deployment to complete. Get the production URL.

## Done State

Confirm with participant:

1. **Live URL** - "Your app is live at: [URL]"
2. **It works** - "I tested [list of journeys] and they all work"
3. **What's next** - "You can share this with your team. The code is in [repo location]."

## Create README

Write a `/README.md` with:

```markdown
# [App Name]

[One-line description]

## What it does

[Brief description of the app and who it's for]

## Live URL

[Vercel URL]

## Local Development

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Tech Stack

- Next.js (App Router)
- Supabase (Database + Auth)
- ShadCN (UI Components)
- Vercel (Hosting)
```

## Completion

Say: "Your app is deployed and ready to share. Here's your live URL: [URL]"

The skill is complete.
