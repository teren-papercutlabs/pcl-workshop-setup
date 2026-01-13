# Phase 3: Decomposition

Split the app into work units so multiple agents can build in parallel.

**Explain to participant:** "Now I'm going to break this into pieces that can be built at the same time. One agent builds the foundation - the stuff everything else depends on. Then separate agents build each screen in parallel. It's like having multiple contractors working on different rooms of a house."

## Decomposition Strategy

### Foundation Agent (runs first)

Builds the shared infrastructure every screen needs:

- **Project setup** - The app skeleton, database connection, UI library
- **Database tables** - Where your data lives
- **Login** - Email/password sign-in so only people with accounts can access it
- **Shared pieces** - Header, navigation, components used across screens
- **Data shapes** - Definitions of what a "campaign" or "asset" looks like in code

Foundation MUST finish before features start - they need the pieces it creates.

### Feature Agents (run in parallel)

Each feature = one screen (or a pair of related screens).

Feature agents build their screen using the foundation's pieces. They can all work at the same time since they don't touch each other's files.

## Sub-Agent MD File Format

Create `/docs/agents/` directory. Write one MD file per agent.

### Foundation Agent (`/docs/agents/foundation.md`)

```markdown
# Foundation Agent

## App Context
[Full app description - what it does, who it's for, why it exists]

## Your Job
Set up the foundation that all features will build on.

## Deliverables

### 1. Project Setup
- Next.js app with App Router
- Supabase client configured
- ShadCN installed with components: [list needed components]
- `.env.local` with Supabase credentials (get from user)
- `.env.example` documenting required variables

### 2. Database Schema
[Full schema with all tables, columns, types, relationships]

### 3. Auth (if applicable)
- Supabase Auth with email/password
- Login page with tabs: "Sign In" and "Create Account" (clear which mode you're in)
- Email confirmation callback route (`/auth/callback`) - confirms user and redirects to app
- After confirmation: redirect to main page with success toast "Account confirmed!"
- Protected route middleware
- User context provider

### 4. Shared Components
- Layout component with navigation
- [Other shared components from screen flows]

### 5. UI Defaults (apply to every app)

**Layout**
- Container: `max-w-6xl mx-auto px-6` - content never touches edges
- Spacing: `space-y-6` between sections, `gap-4` in grids
- Header padding matches body padding

**Color**
- Pick ONE accent color (blue, teal, indigo - whatever fits the app)
- Use accent for: primary buttons, active states, hover borders
- Keep most UI neutral (gray/white) - accent is for emphasis only
- Badges/tags: soft colored backgrounds when categories exist (not all gray)

**States**
- Empty states: icon + helpful message + optional action button (never just text)
- Loading: skeleton loaders for content, spinner inside buttons during action
- Card hover: `hover:shadow-md` or subtle left border accent
- Form validation: inline errors, not just on submit

**Feedback**
- Toast notifications for completed actions (saved, synced, created, etc.)
- Success = green, Error = red, Info = accent color

**Performance**
- Navigation: use `<Link href="..." prefetch={true}>` not `onClick={() => router.push()}`
  - Link prefetches the page bundle on hover = instant navigation
- Cards that link somewhere: wrap in Link, don't use onClick handlers

### 5. Type Definitions
[All TypeScript types for the data models]

## Integration Tests
- [ ] App runs without errors
- [ ] Database connection works
- [ ] Auth flow completes (if applicable)
- [ ] All shared components render

## Contracts You Expose
[List the components, types, and utilities features will import]
```

### Feature Agent (`/docs/agents/feature-{name}.md`)

```markdown
# Feature Agent: [Feature Name]

## App Context
[Same full app description as Foundation - give full context]

## Your Job
Build [specific screen(s)] for [specific user need].

## Screen Flows (from approved designs)
[Copy the relevant screen flow(s) from /docs/screen-flows.md]

## User Journeys
[The step-by-step user journeys for this feature]

## Deliverables

### 1. Pages/Routes
- `/app/[route]/page.tsx` - [description]

### 2. API Routes
- `/app/api/[endpoint]/route.ts` - [what it does]

### 3. Components (feature-specific)
- [List components this feature needs beyond Foundation's shared ones]

## Integration Tests
- [ ] [Test 1 - specific user journey step]
- [ ] [Test 2 - specific user journey step]
- [ ] [Test 3 - edge case or error handling]

## Contracts You Consume (from Foundation)
- Types: [list types you'll import]
- Components: [list components you'll use]
- Auth: [how you check auth if needed]
```

## Output

After writing all agent briefs:

**Explain to participant:** "I've written instructions for each builder agent - one for the foundation, and one for each screen. Here's what I created:"

1. List what you created: "foundation.md, feature-search.md, feature-detail.md, etc."
2. "Ready to dispatch? The foundation agent runs first (a few minutes), then all the feature agents run at the same time."

Wait for confirmation before proceeding to Phase 4.
