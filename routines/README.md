# Routine prompts

Configure at [claude.ai/code/routines](https://claude.ai/code/routines). Requires [Claude GitHub App](https://github.com/apps/claude). Enable **Allow unrestricted branch pushes** for routines that write `workflow/state`.

## Clarify

**File:** [clarify-routine.md](clarify-routine.md) · Trigger: label `workflow:start`

## Implement

**File:** [implement-routine.md](implement-routine.md) · Trigger: label `workflow:implement`

## AI Review

**File:** [review-routine.md](review-routine.md) · Trigger: label `workflow:review`

Autonomous: fresh-eyes review → **one** PR comment with verdict (`gh pr comment` only) → `workflow:human-review`.

## Human review

No routine. Label `workflow:human-review` means the author tests locally (PR stays **draft**), optionally runs `/workflow-comprehension`, then **`gh pr ready`** before inviting human reviewers / merging.

## Close

**File:** [close-routine.md](close-routine.md) · Trigger: **GitHub event** (not a PR trigger)

| Setting | Value |
|---------|-------|
| Event | Issues → **closed** |
| Labels | include `workflow:human-review` |

Runs only for workflow issues (those still labeled `workflow:human-review` at close) — unrelated PR merges do not fire it. Grades AI review findings, writes `findings-grade.json` + `close_completed` metrics, swaps to **`workflow:done`**.

## Comprehension (optional, local)

No routine. After checking out the PR branch and testing locally, run **`/workflow-comprehension`** in a local Claude Code session. Skip by merging the PR and closing the issue.
