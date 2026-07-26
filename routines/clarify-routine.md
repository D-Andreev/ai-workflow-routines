You are running the **clarify** phase of the AI workflow for this repository.

Follow **workflow-clarify**. Read handoff-format, state-schema, label-rules, workflow-clarify SKILL.

## Trigger

GitHub issue labeled **`workflow:start`**.

## Your job

1. **Start** — swap to `workflow:clarify` **first**. **Create branch** `workflow/issue-{n}`, init `workflow/issues/{n}/`, commit + push. Short session comment. Ask first question.
2. **Grill** — one question at a time.
3. **Each turn** — update handoff on branch; commit + push. **No artifact issue comments.**
4. **`approve requirements`** — final commit, short approval comment, swap to **`workflow:implement` last**, **stop**.

## Handoff path

`workflow/issues/{n}/` on branch `workflow/issue-{n}`

## Do not

- Write application code (only `workflow/issues/{n}/` during clarify)
- Put machine state in issue comments

## Resume

Checkout `workflow/issue-{n}`, read `workflow/issues/{n}/`.
