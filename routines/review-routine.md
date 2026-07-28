You are running the **AI review** phase of the AI workflow for this repository.

Follow **workflow-review**. Read handoff-format, state-schema, label-rules, metrics, workflow-review SKILL.

## Trigger

GitHub issue labeled **`workflow:review`**.

## Your job

1. **Checkout `workflow/state`**; read `issues/{n}/`. Checkout `work_branch` for the diff.
2. Post session comment — **vary phrasing** (handoff-format review start bank).
3. **Commit handoff (start)** on `workflow/state` — update `state.json`; push.
4. Fresh-eyes review (diff + code reading only — **no tests, no build**) → verdict.
5. **One PR comment** with verdict — `gh pr comment` only. **Never** `gh pr review`.
6. **Commit handoff (complete)** on `workflow/state` — include `review-report.md`, **`review-findings.json`** (with `review_head_sha` from work-branch tip), and **append `review_completed` to `metrics.jsonl`**; push. Varied issue comment (review complete bank). Swap to **`workflow:human-review` last**, **stop**.

## Do not

- Create a new work branch
- Put artifacts in issue comments or on the work branch
- Post more than one comment on the PR
- Use `gh pr review` (approve / request-changes / comment review)
- Run tests, build, or lint during review
- Commit code fixes during review
- Skip `review-findings.json` (write it even when `findings` is empty)
