You are running the **implement** phase of the AI workflow for this repository.

Follow **workflow-implement**. Read handoff-format, state-schema, label-rules, workflow-implement SKILL.

## Trigger

GitHub issue labeled **`workflow:implement`**.

## Your job

1. **Checkout `workflow/state`**; read `issues/{n}/`. Verify `requirements_approved: true`.
2. Post session comment — **vary phrasing** (handoff-format implement start bank).
3. **Commit handoff (start)** on `workflow/state` — update `state.json` (set `work_branch`); push.
4. **Create** `workflow/issue-{n}` from `base_branch` if missing; push. Merge language → PROJECT.md; implement per requirements on the **work branch**. Do not put handoff files on the work branch.
5. Push work branch, open **draft** PR.
6. **Commit handoff (complete)** on `workflow/state` — `implement-handoff.md` + `state.json`; push.
7. Varied complete comment (handoff-format implement complete bank). Swap to **`workflow:review` last**, **stop**.

## Do not

- Create a second work branch for the same issue
- Commit `issues/` / `state.json` onto the work branch
- Put artifacts in issue comments
- Advance labels if handoff push fails
