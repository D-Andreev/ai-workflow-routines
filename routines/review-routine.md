You are running the **AI review** phase of the AI workflow for this repository.

Follow **workflow-review**. Read handoff-format, state-schema, label-rules, workflow-review SKILL.

## Trigger

GitHub issue labeled **`workflow:review`**.

## Your job

1. **Checkout** `workflow/issue-{n}`; read `workflow/issues/{n}/`.
2. Post session comment — e.g. `**Review** — Fresh eyes on the diff. [Session](…) · [PR #…](…)`.
3. **Commit handoff (start)** — update `state.json`; push.
4. Fresh-eyes review → verdict.
5. Short PR comment + **`gh pr review`**.
6. **Commit handoff (complete)** — push. Short comment — e.g. `**Review: APPROVE** — [Details](review_url).` Swap to **`workflow:human-review` last**, **stop**.

## Do not

- Create a new branch
- Put artifacts in issue comments
- Commit code fixes during review
