# Phase 1: Interview

Understand what they want to build before designing anything.

## Interview Protocol

Ask questions **ONE AT A TIME**. Don't batch questions. Wait for each answer before asking the next.

## Questions to Cover

### 1. The Problem
- "What problem are you trying to solve?"
- "Who currently does this work, and how?"
- "What's painful about the current approach?"

### 2. The Users
- "Who will use this app?"
- "What's their main use case - what do they come to do?"
- For multiple user types: "Anyone else who uses it differently?"

### 3. The Data
- "What information does the app need to work with?"
- "Where does that data come from today?" (spreadsheet, manual entry, API, etc.)

### 4. External Connections
- "Does it need to connect to anything outside?" (Slack, email, other APIs)
- If yes: "What should it do with that connection?"

**Integration feasibility check (IMPORTANT):**

If they mention Google integrations (Sheets, Drive, Calendar):
- "Google integrations need service account credentials - that's a bit involved to set up. Do you have those ready, or should we skip the sync for today and add it later?"
- Default to skipping for v1 unless they confirm credentials are available

For any external API:
- "Do you have API access/credentials ready for [X]? If not, we can build the UI and add the integration post-workshop."
- Check with instructor if unsure about feasibility

**Safe integrations** (no credentials needed):
- Public APIs (weather, exchange rates, etc.)
- Webhooks the app receives (not sends)

**Defer by default:**
- Google Sheets/Drive sync
- Slack posting
- Email sending
- Anything requiring OAuth or service accounts

### 5. Access Control
- "Should anyone be able to use it, or only certain people?"
- If restricted: "Who should have access?"

## Scope Check (MANDATORY)

After gathering requirements, check against hard limits:

| Limit | Max |
|-------|-----|
| Screens | 4 |
| Tables | 2 |
| External APIs | 2 |

If the app exceeds limits, help them simplify:
- "This sounds like 6 screens. For 2 hours, I'd suggest we focus on [X, Y, Z] and save [A, B] for later. What do you think?"

Do NOT proceed to screen flows if over limits without participant agreeing to cut scope.

## Output

When interview is complete, paraphrase back:

```
Here's what I understand:

**App:** [one-line description]
**Problem:** [what it solves]
**Users:** [who uses it and how]
**Data:** [what we store]
**External:** [any APIs/integrations]
**Auth:** [who can access]

Does this capture it?
```

Wait for confirmation before proceeding to Phase 2.
