# Phase 5: Testing

Verify everything works before deploying.

**Explain to participant:** "Before we put this live, let's make sure the wiring works. I'll run some quick checks on the API and pages, then you can click through yourself to make sure it feels right."

## Step 1: Automated Verification

Test that routes and APIs are wired correctly. Fast programmatic checks, not browser clicking.

**For each feature, verify:**
- Page routes return 200 (SSR renders without error)
- API endpoints return expected data shapes
- Database operations work (create, read, update if applicable)

**Create verification prompts per feature:**

```
Verify the [feature] works in [project path]:

DEV SERVER: http://localhost:3000

CHECKS:
1. Page renders: fetch http://localhost:3000/[route] - should return 200
2. API works: fetch http://localhost:3000/api/[endpoint] - should return [expected shape]
3. Data exists: Query Supabase for [table] - should have [expected structure]

Run each check. Report:
- Check 1: PASS/FAIL - [details]
- Check 2: PASS/FAIL - [details]
- Check 3: PASS/FAIL - [details]
```

**Dispatch verification in parallel (use Sonnet):**

```
Task(
  prompt: "[verification prompt for feature 1]",
  subagent_type: "general-purpose",
  description: "Verify: [feature name]",
  model: "sonnet"
)

Task(
  prompt: "[verification prompt for feature 2]",
  subagent_type: "general-purpose",
  description: "Verify: [feature name]",
  model: "sonnet"
)

// ... all features
```

## Step 2: Consolidate Results

When all test agents return:

1. Collect all FAILs
2. Group by likely cause (same component, same API, etc.)

**Report to participant in plain English:**

> "The test agents found a few issues:
> - The search filter doesn't actually filter - it shows all campaigns regardless
> - Clicking 'Sync' throws an error about missing API key
>
> Let me dispatch agents to fix these."

If all tests pass: "All journeys tested successfully. Let's have you click through it yourself."

## Step 3: Fix Failures

For each failure (or group of related failures), dispatch an Opus agent to fix:

```
Task(
  prompt: "Fix this bug in [project path]:

  PROBLEM: [what's broken]
  EXPECTED: [what should happen]
  LIKELY LOCATION: [file/component if known]

  Find the bug, fix it, verify the fix works.",
  subagent_type: "general-purpose",
  description: "Fix: [bug summary]",
  model: "opus"
)
```

After fixes, re-run the failed tests to verify.

## Step 4: User Testing

**Explain:** "The automated tests pass, but you know your workflow better than any test. Let's have you click through it and make sure it feels right."

Start the dev server if not running:
```bash
pnpm dev
```

Guide participant through each journey:

1. "Open http://localhost:3000 in your browser"
2. "Try signing up with your email, then log in"
3. "Now try [first journey] - [describe what to do]"
4. After each journey: "Did that work how you expected?"

**Capture feedback:**
- If something's off: note it, fix it
- If it's a nice-to-have: note for later, don't block deploy

## Step 5: UI Review Checklist

Quick visual scan for polish issues. Check each:

- [ ] **Padding** - Content doesn't touch screen edges (should have container with side padding)
- [ ] **Empty states** - Empty lists show icon + message, not just blank or "No items"
- [ ] **Loading states** - Skeleton loaders for content, spinners for buttons
- [ ] **Colors** - At least one accent color (buttons, badges), not all grayscale
- [ ] **Card hover** - Cards that link somewhere have hover state (shadow or border)
- [ ] **Toasts** - Actions show feedback (saved, synced, error messages)

If any fail: fix before deploy. These are quick wins that make the app feel polished.

## Done State

When participant confirms it works:

"Great - everything's working. Ready to put it live?"

Proceed to Phase 6.
