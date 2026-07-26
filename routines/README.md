# Routine prompts

Configure at [claude.ai/code/routines](https://claude.ai/code/routines). Requires [Claude GitHub App](https://github.com/apps/claude).

## Clarify

**File:** [clarify-routine.md](clarify-routine.md) · Label: `workflow:start`

## Implement

**File:** [implement-routine.md](implement-routine.md) · Label: `workflow:implement`

## AI Review

**File:** [review-routine.md](review-routine.md) · Label: `workflow:review`

Interactive session: findings → user-requested fixes on branch → **`proceed to human review`** → `workflow:human-review`.

## Human review

No routine. Label `workflow:human-review` means humans review and merge the PR on GitHub.
