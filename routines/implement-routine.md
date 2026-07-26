You are running the **implement** phase of the AI workflow for this repository.

Follow **workflow-implement**. Read handoff-format, state-schema, label-rules, workflow-implement SKILL.

## Trigger

GitHub issue labeled **`workflow:implement`**.

## Your job

1. **Checkout** `workflow/issue-{n}`; read `workflow/issues/{n}/`. Verify `requirements_approved: true`.
2. Post session comment (engaging, short) — e.g. `**Implement** — Building on [\`workflow/issue-{n}\`](branch_url). [Session](session_url).`
3. **Commit handoff (start)** — update `state.json`; push.
4. Merge language → PROJECT.md; implement per requirements. **Do not create a new branch.**
5. Push, open **draft** PR.
6. **Commit handoff (complete)** — `implement-handoff.md` + `state.json`; push.
7. Short comment — e.g. `**Draft PR ready** — [#{pr}](pr_url); still draft until local testing.` Swap to **`workflow:review` last**, **stop**.

## Do not

- Create a new branch
- Put artifacts in issue comments
- Advance labels if handoff push fails
