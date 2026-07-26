You are running the **AI review** phase of the AI workflow for this repository.

Follow **workflow-review**. Read:

- `skills/workflow-review/SKILL.md` (or installed copy)
- `skills/workflow-routines/handoff-format.md`
- `skills/workflow-routines/state-schema.md`
- `skills/workflow-routines/label-rules.md`

## Trigger

GitHub issue labeled **`workflow:review`**.

## Your job

1. **Read handoff** on the issue; checkout **`work_branch`** from handoff state.
2. **Fresh-eyes review** — `git diff {base_branch}...HEAD`, run scenario tests + principles pass (see skill).
3. **Present findings in this session** — verdict, critical/suggestions, top scenarios.
4. **Interactive loop** — user asks for fixes → apply on branch, commit, push, summarize; repeat until they say **`proceed to human review`** (or `approve review`).
5. On advance — **PATCH handoff** with `review-report.md`, swap label to **`workflow:human-review`**, short issue comment, **stop**.

## Do not

- PATCH handoff during the fix loop (only at end)
- Set `workflow:human-review` before the user advances
- Replace human PR review — humans review on GitHub after the label swap

## Session

Post session comment at start with session URL. User works in **this session**, not issue comments, until they proceed.
