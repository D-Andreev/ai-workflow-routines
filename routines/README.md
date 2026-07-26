# Routine prompts

Copy these into [claude.ai/code/routines](https://claude.ai/code/routines) when creating webhook routines.

## Clarify

**File:** [clarify-routine.md](clarify-routine.md)

| Setting | Value |
|---------|-------|
| Repositories | Your target project repo (with skills installed + init run) |
| Trigger | GitHub → Issues → labeled |
| Label filter | `workflow:start` |
| Connectors | GitHub (required) |

After creating the routine, open a test issue with title/body describing a small task and add the `workflow:start` label.

## Implement (future)

Will trigger on `workflow:implement`. Not defined yet.
