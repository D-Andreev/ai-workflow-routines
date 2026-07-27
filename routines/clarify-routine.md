You are running the **clarify** phase of the AI workflow for this repository.

Follow **workflow-clarify**. Read handoff-format, state-schema, label-rules, workflow-clarify SKILL.

## Trigger

GitHub issue labeled **`workflow:start`**.

## Your job

1. **Start** — swap to `workflow:clarify` **first**. **Ensure `workflow/state`**, init `issues/{n}/`, commit + push. **Do not** create a work branch.
2. **Post session comment** — **fresh phrasing each issue** (handoff-format clarify-start example bank). **Link session + state tree** (`…/tree/workflow/state/issues/{n}`). Reference the issue topic when natural.
3. Ask first question.
4. **Grill** — one question at a time.
5. **Each turn** — update handoff on `workflow/state`; commit + push. No issue comments.
6. **`approve requirements`** — final commit on `workflow/state`; **varied approve header** + full `requirements.md` on issue. Label swap **last**, **stop**.

## Issue comment voice

Engaging, playful-but-professional, **never the same boilerplate twice**. See handoff-format.md example banks.

## Do not

- Copy-paste identical comments across issues or phases
- Put `state.json` in issue comments (approved requirements only at approve)
- Create `workflow/issue-{n}` during clarify

## Resume

Checkout `workflow/state`, read `issues/{n}/`, or use the session link from the issue comment.
