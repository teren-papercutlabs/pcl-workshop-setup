# Phase 4: Dispatch

Run sub-agents on the same repo. Foundation first, then features in parallel.

## File Ownership (CRITICAL)

To avoid conflicts, each agent owns specific paths. No agent touches another agent's files.

### Foundation Owns:
- `/app/layout.tsx`
- `/app/page.tsx` (landing/redirect only)
- `/components/ui/*` (ShadCN)
- `/components/shared/*` (layout, nav, common)
- `/lib/*` (supabase client, utils, types)
- `/supabase/*` (migrations, schema)
- `package.json`, `tailwind.config.ts`, etc.

### Each Feature Owns:
- `/app/[feature-route]/*` (pages)
- `/app/api/[feature-route]/*` (API routes)
- `/components/[feature-name]/*` (feature-specific components)

**Rule:** If a feature needs a shared component that doesn't exist, it asks Foundation to create it - it does NOT create it in `/components/shared/`.

## Dispatch Sequence

### Step 1: Foundation Agent + Infra Setup (Parallel)

Foundation MUST complete before features start. **While Foundation runs, set up deployment infrastructure with the participant.**

**Dispatch Foundation:**

```
Task(
  prompt: "[Preamble + contents of /docs/agents/foundation.md]",
  subagent_type: "general-purpose",
  description: "Foundation agent",
  model: "opus"
)
```

**While Foundation is running, walk participant through infra setup:**

Guide them step by step. Don't assume they know how.

1. **Create GitHub repo** (always private, don't ask)
   - "Let's push this to GitHub so we can deploy it later."
   - Ask for their GitHub username
   - Run: `gh repo create [their-username]/[app-name] --private --source=. --push`
   - Verify: "You should see your repo at github.com/[username]/[app-name]"

2. **Create Vercel project**
   - "Now let's connect this to Vercel for hosting."
   - Go to vercel.com → Add New → Project
   - Select "Import Git Repository"
   - Find and select the repo you just created
   - Framework preset: Next.js (should auto-detect)
   - **Don't deploy yet** - click "Skip" or cancel the deploy

3. **Create Supabase via Vercel integration**
   - "Now we need a database to store your campaigns. Vercel can create one for you."
   - In your Vercel project, click the **Storage** tab at the top
   - Click **Create Database**, then pick **Supabase**
   - It'll ask you to name your database - use the app name (e.g. "campaign-archive")
   - Click through the setup - Vercel handles the connection automatically
   - "This gives you a Postgres database. Vercel already knows how to connect to it."

4. **Copy database credentials to your computer**
   - "Your app needs two pieces of info to talk to the database. Vercel has them, but your laptop doesn't yet."
   - In Vercel: Settings → Environment Variables
   - Find `NEXT_PUBLIC_SUPABASE_URL` - click the eye icon, copy the value
   - Find `NEXT_PUBLIC_SUPABASE_ANON_KEY` - same thing
   - Create a file called `.env.local` in your project folder
   - Paste both values in this format:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
     ```
   - "Now when you run the app locally, it can reach the database."

**Wait for Foundation to complete.** Do not dispatch features until Foundation returns.

**When Foundation completes, explain what it built in plain English:**

Don't just list technical deliverables. Translate for the participant. Example:

> "Foundation set up the skeleton of your app:
> - A login page - only people with accounts can get in
> - The basic layout - header with your app name and a logout button
> - The campaign card design - how each campaign will look in the list
> - Database tables - where your campaign data will live
>
> Now the feature agents will build the actual screens on top of this."

**Verify Foundation worked:**
```bash
pnpm install && pnpm build
```

If build fails, fix before continuing.

### Step 2: Feature Agents (Parallel)

After Foundation complete, dispatch ALL features in ONE message using multiple Task calls:

```
Task(
  prompt: "[Preamble + contents of /docs/agents/feature-search.md]",
  subagent_type: "general-purpose",
  description: "Feature: Search",
  model: "opus"
)

Task(
  prompt: "[Preamble + contents of /docs/agents/feature-detail.md]",
  subagent_type: "general-purpose",
  description: "Feature: Detail",
  model: "opus"
)

// ... all features in same message
```

This dispatches them in parallel. Wait for ALL to return.

## Sub-Agent Prompt Preamble

Include this before every agent MD file:

```
You are building part of a workshop app.

PROJECT ROOT: [absolute path]

CRITICAL - FILE OWNERSHIP:
You may ONLY create/modify files in these paths:
[list the paths this agent owns]

Do NOT touch any other files. If you need something from a shared location, import it - don't modify it.

INSTRUCTIONS:
1. Read the brief below
2. Build exactly what's specified
3. Only touch files you own
4. Run your integration tests
5. Report: what you built, tests passed/failed, any blockers

---

[Agent MD file contents]
```

## Progress Updates

Keep participant informed:

- "Dispatching Foundation agent... (this sets up the project structure)"
- "Foundation complete. Build verified. Dispatching [N] feature agents in parallel..."
- "All features complete. Moving to final verification."

## After All Agents Return

Check for issues:
1. Any agent report failures? → Fix before proceeding
2. Build still works? → `pnpm build`
3. Any TypeScript errors? → Fix them

Then proceed to Phase 5.
