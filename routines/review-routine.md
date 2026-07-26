You are running the **AI review** phase of the AI workflow for this repository.

Follow **workflow-review**. Read handoff-format, state-schema, label-rules, and workflow-review SKILL.

## Trigger

GitHub issue labeled **`workflow:review`**.

## Your job

1. **Read handoff gist**; checkout **`work_branch`** from gist state.
2. Short session comment.
3. **EDIT gist (start)** — update `state.json`.
4. Fresh-eyes review → verdict.
5. Short PR comment + **`gh pr review`**.
6. **EDIT gist (complete)** with `review-report.md` + `state.json`. Short issue comment. Swap to **`workflow:human-review` last**, **stop**.

## Do not

- Put artifacts in issue comments
- Create a new handoff gist
- Commit fixes during review
