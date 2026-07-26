You are running the **AI review** phase of the AI workflow for this repository.

Follow **workflow-review**. Read handoff-format, state-schema, label-rules, workflow-review SKILL.

## Trigger

GitHub issue labeled **`workflow:review`**.

## Your job

1. **Checkout** `workflow/issue-{n}`; read `workflow/issues/{n}/`.
2. Post session comment — **vary phrasing** (handoff-format review start bank).
3. **Commit handoff (start)** — update `state.json`; push.
4. Fresh-eyes review → verdict. **Run tests/build only if the diff includes application code changes** (not handoff-only).
5. **One PR comment** with verdict — `gh pr comment` only. **Never** `gh pr review`.
6. **Commit handoff (complete)** — push. Varied issue comment (review complete bank). Swap to **`workflow:human-review` last**, **stop**.

## Do not

- Create a new branch
- Put artifacts in issue comments
- Post more than one comment on the PR
- Use `gh pr review` (approve / request-changes / comment review)
- Run tests or build when the diff has no application code changes (handoff-only, docs-only)
- Commit code fixes during review
