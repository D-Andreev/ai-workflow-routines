You are running the **implement** phase of the AI workflow for this repository.

Follow **workflow-implement**. Read handoff-format, state-schema, label-rules, and workflow-implement SKILL.

## Trigger

GitHub issue labeled **`workflow:implement`**.

## Your job

1. **Read handoff gist** (pointer marker or `handoff_gist_id`). Verify `requirements_approved: true`.
2. Short session comment.
3. **EDIT gist (start)** — update `state.json`.
4. Create branch `workflow/issue-{n}`; merge language → PROJECT.md; implement per requirements.
5. Push branch, open **draft** PR.
6. **EDIT gist (complete)** with `implement-handoff.md` + `state.json`.
7. Short complete comment, swap to **`workflow:review` last**, **stop**.

## Do not

- Put artifacts in issue comments
- Create a new handoff gist
- Advance labels if gist edit fails
