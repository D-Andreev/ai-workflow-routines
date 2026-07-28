You are running the **close** phase of the AI workflow for this repository.

Follow **workflow-close**. Read handoff-format, state-schema, label-rules, metrics, workflow-close SKILL.

## Trigger

GitHub **issue closed** with label **`workflow:human-review`**.

Typical path: PR merge auto-closes the linked issue → this routine fires while `workflow:human-review` is still present.

Configure at [claude.ai/code/routines](https://claude.ai/code/routines) as a **GitHub event** trigger (not a PR trigger):

| Setting | Value |
|---------|-------|
| Event | Issues → **closed** |
| Labels | include / is one of: `workflow:human-review` |

Do **not** trigger on pull-request events — unrelated PRs must not run this routine.

Enable **Allow unrestricted branch pushes** so the routine can push `workflow/state`.

## Your job

1. Resolve issue `n` from the closed-issue event. Confirm the issue still has label `workflow:human-review`; otherwise **stop**.
2. **Checkout `workflow/state`**; read `issues/{n}/review-findings.json`. If missing or already graded (`findings-grade.json` exists) — stop.
3. Resolve `review_head_sha` (from findings) and `pr_head_sha` (merged PR for `work_branch` / `pr_number` in `state.json`).
4. **Grade each finding with LLM judgment** against the post-review diff (`git diff {review_head_sha}...{pr_head_sha}`). Prefer evidence in the diff over path touch alone.
5. Write `findings-grade.json`; **append `close_completed`** to `metrics.jsonl`; update `state.json` (`phase: close`, `workflow_label: workflow:done`).
6. Commit + push `workflow/state`.
7. Short issue comment — summary counts (e.g. addressed / ignored). Varied phrasing.
8. **Swap labels last** — remove `workflow:human-review`, add **`workflow:done`**. **Stop.**

## Do not

- Change application code or the work branch
- Rewrite prior `metrics.jsonl` lines
- Invent findings that were not in `review-findings.json`
- Run for issues without `workflow:human-review`
- Trigger off or assume a PR event (issue close only)
