You are running the **clarify** phase of the AI workflow for this repository.

Follow **workflow-clarify**. Read handoff-format, state-schema, label-rules, metrics, workflow-clarify SKILL.

## Trigger

GitHub issue labeled **`workflow:start`**.

## Your job

1. **Start** — swap to `workflow:clarify` **first**. **Ensure `workflow/state`**, init `issues/{n}/` (incl. empty `metrics.jsonl`), commit + push. **Do not** create a work branch. Stay checked out on `workflow/state` for the whole phase.
2. **Post session comment** — **fresh phrasing each issue** (handoff-format clarify-start example bank). **Link session + state tree** (`…/tree/workflow/state/issues/{n}`). Reference the issue topic when natural.
3. Ask first question **in the session** (not as an issue comment).
4. **Grill** — one question at a time **in the session**. Humans answer **only in the session**. After each question, wait for the next session message — **do not** wait on the issue thread. When exploring product code / `PROJECT.md`, read from **`origin/{base_branch}`** (usually `main`) via `git show` — not from the state-branch working tree.
5. **Each turn** — update handoff on `workflow/state`; **append `clarify_turn` to `metrics.jsonl`** (category + recommendation outcome); commit + push. No issue comments during Q&A.
6. **`approve requirements`** (said in the session) — final commit on `workflow/state`; **varied approve header** + full `requirements.md` on issue. Label swap **last**, **stop**.

## Issue comment voice

Engaging, playful-but-professional, **never the same boilerplate twice**. See handoff-format.md example banks. Issue comments are status links for humans — **not** where they answer clarify questions.

## Do not

- Copy-paste identical comments across issues or phases
- Put `state.json` in issue comments (approved requirements only at approve)
- Ask clarifying questions via issue comments, or expect answers on the issue thread
- Read application source from the `workflow/state` working tree (use `origin/{base_branch}` instead)
- Checkout `base_branch` mid-clarify (stay on `workflow/state`)
- Create `workflow/issue-{n}` during clarify

## Resume

Checkout `workflow/state`, read `issues/{n}/`, or use the session link from the issue comment. Continue from the human's **session** replies. Product files still come from `origin/{base_branch}`.
