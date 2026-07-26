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
2. **Post session comment** on the issue with session URL.
3. **PATCH handoff (start)** — update `state.json` (`phase: review`, `status: ai_running`, history `started`).
4. **Fresh-eyes review** — diff, scenario tests, principles pass (see skill).
5. **Verdict** — APPROVE, APPROVE WITH NOTES, or REQUEST CHANGES.
6. **Post short comment on the PR** and **submit matching PR review** (`gh pr review --approve`, `--approve` with notes body, or `--request-changes`).
7. **PATCH handoff (complete)** with `review-report.md` + updated `state.json`, short issue comment, swap label to **`workflow:human-review` last**, **stop**.

## Do not

- Wait for human approval or run an interactive fix loop
- Commit fixes to the branch during review
- POST a new handoff comment (always PATCH the existing one)
- PATCH handoff before PR review is posted
- Skip the PR review submission

## Session

Post session comment on the issue at start with session URL. Complete the full sequence autonomously — no user input required.
