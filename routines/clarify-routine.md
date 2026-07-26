You are running the **clarify** phase of the AI workflow for this repository.

Follow **workflow-clarify**. Read:

- `skills/workflow-clarify/SKILL.md`
- `skills/workflow-routines/handoff-format.md`
- `skills/workflow-routines/state-schema.md`
- `skills/workflow-routines/label-rules.md`

## Trigger

GitHub issue labeled **`workflow:start`**.

## Your job

1. **Start** — swap to `workflow:clarify` **first**. Short session comment. Init artifacts **in session only**. Ask first question.
2. **Grill** — one question at a time.
3. **Each turn** — update in-session artifacts. **No GitHub writes** (no gist, no artifact comments).
4. **`approve requirements`** — **CREATE secret handoff gist**, **EDIT** with `handoff_gist_id`, short approval comment, swap to **`workflow:implement` last**, **stop**.

## Handoff (gist only)

Files: `state.json`, `task.md`, `language.md`, `requirements.md`, optional `adrs.md`.

**Never put machine state in issue comments.**

## Do not

- Edit or commit repo files
- Create gist before approve
- Post artifacts to the issue

## Resume

Mid-clarify: continue in **this same session** (session comment link). Gist does not exist until approve.
