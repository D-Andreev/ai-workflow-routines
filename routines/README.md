# Routine prompts

Configure at [claude.ai/code/routines](https://claude.ai/code/routines). Requires [Claude GitHub App](https://github.com/apps/claude).

## Clarify

**File:** [clarify-routine.md](clarify-routine.md) · Label: `workflow:start`

## Implement

**File:** [implement-routine.md](implement-routine.md) · Label: `workflow:implement`

## AI Review

**File:** [review-routine.md](review-routine.md) · Label: `workflow:review`

Autonomous: fresh-eyes review → short PR comment → **`gh pr review`** (approve / approve with notes / request changes) → `workflow:human-review`.

## Human review

No routine. Label `workflow:human-review` means the author tests locally (PR stays **draft**), optionally runs `/workflow-comprehension`, then **`gh pr ready`** before inviting human reviewers.

## Comprehension (optional, local)

No routine. After checking out the PR branch and testing locally, run **`/workflow-comprehension`** in a local Claude Code session. Skip by merging the PR and closing the issue.
