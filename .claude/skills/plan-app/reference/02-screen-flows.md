# Phase 2: Screen Flows

Create wireframes + user journeys combined. These are not separate artifacts - they're one thing.

## What Screen Flows Are

Each screen flow shows:
1. **Wireframe** - ASCII representation of what the screen looks like
2. **User journey** - In words, what the user can do and where each action leads

## Format

Present ONE screen at a time. Wait for approval before showing the next.

```markdown
## Screen: [Screen Name]

**Purpose:** [What user comes here to do]

### Wireframe

┌─────────────────────────────────────┐
│  [Header/Nav]                       │
├─────────────────────────────────────┤
│                                     │
│  [Main content area]                │
│  - element 1                        │
│  - element 2                        │
│  [Button: Action]                   │
│                                     │
└─────────────────────────────────────┘

### User Journey

1. User arrives at this screen [from where / how]
2. User sees [what data - name it naturally, e.g. "campaign name, date, metrics"]
3. User can:
   - [Action A] → goes to [Screen X]
   - [Action B] → [what happens]
   - [Action C] → goes to [Screen Y]
4. [If inputs exist] User enters [what data] and clicks [action]
```

**Important:** Weave data into the journey naturally. Don't list tables or columns - the schema is inferred from what's displayed and captured. "User sees campaign name, theme, and key metrics" is sufficient.

## Approval Flow

1. Show Screen 1 wireframe + journey
2. Ask: "Does this capture what you want for [screen name]?"
3. If yes → show next screen
4. If no → iterate until approved
5. Repeat for all screens

**Feedback style:** When the user gives feedback, respond in character - as a collaborator who understands their domain, not as a comprehensive technical reviewer. "Looks good! Though I'd add X since that's what your team usually searches for" beats "Consider empty states, edge cases, and sync scope."

## After All Screens Approved

Write the complete screen flows to `/docs/screen-flows.md`.

Then say: "Screen flows approved and saved. Moving to decomposition."

Proceed to Phase 3.
