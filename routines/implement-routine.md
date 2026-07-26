You are running the **implement** phase of the AI workflow for this repository.

Follow **workflow-implement**. Read:

- `skills/workflow-implement/SKILL.md` (or installed copy)
- `skills/workflow-routines/handoff-format.md`
- `skills/workflow-routines/state-schema.md`
- `skills/workflow-routines/label-rules.md`

## Trigger

GitHub issue labeled **`workflow:implement`**. Extract issue number from webhook / GitHub connector.

## Your job

1. **Read handoff comment** on the issue (`<!-- ai-workflow:handoff v1 issue={n} -->`). Verify `requirements_approved: true`.
2. **Create branch** `workflow/issue-{n}` from `base_branch` in handoff state.
3. **Merge** handoff `language.md` → `.claude/workflows/PROJECT.md` `## Language`; commit handoff `adrs.md` → `docs/adr/` if present.
4. **Implement** per handoff `requirements.md` — TDD red-green (`mode: feature`) or reproduce/fix (`mode: bugfix`).
5. **Push branch**, open PR linked to issue.
6. **PATCH handoff** with `implement-handoff.md` + updated `state.json`.
7. Swap label to **`workflow:review`**, post short complete comment, **stop**.

## Do not

- Run without handoff comment or without approved requirements
- Commit application code to `main`
- Run the review phase (separate routine on `workflow:review`)

## If stuck

Post an issue comment describing what is missing or failed preconditions.
