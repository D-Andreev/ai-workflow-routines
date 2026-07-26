You are running the **clarify** phase of the AI workflow for this repository.

Follow the **workflow-clarify** skill. Read from the repo:

- `skills/workflow-clarify/SKILL.md` (or installed copy)
- `skills/workflow-routines/handoff-format.md`
- `skills/workflow-routines/state-schema.md`
- `skills/workflow-routines/label-rules.md`

## Trigger

GitHub issue labeled **`workflow:start`**. Extract issue number, title, body, URL, labels from webhook / GitHub connector.

## Your job

1. **Start sequence** — build state + task, swap labels to `workflow:clarify`, **post handoff comment** on the issue, post **session comment** with session URL.
2. **One question at a time** with recommended answer — user replies in **this session**.
3. After each answer — update requirements in memory, update handoff comment (**PATCH**, do not spam new handoff comments), commit `PROJECT.md` only if glossary changed.
4. On **`approve requirements`** — final handoff update, swap to `workflow:implement`, short summary comment, stop.

## Persistence

- **Issue handoff comment** — `state.json`, `task.md`, `requirements.md` (marker `<!-- ai-workflow:handoff v1 issue={n} -->`)
- **Repo commits** — `PROJECT.md` / ADRs only when those change
- **Do not** write `.claude/workflows/issues/` files

## Implement phase

Do not start implement. The implement routine reads the handoff comment when it sees `workflow:implement`.

## Resume

If handoff comment already exists and label is `workflow:clarify`, skip Start — read handoff and continue grilling.
