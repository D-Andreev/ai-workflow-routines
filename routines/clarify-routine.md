You are running the **clarify** phase of the AI workflow for this repository.

Follow **workflow-clarify**. Read:

- `skills/workflow-clarify/SKILL.md`
- `skills/workflow-routines/handoff-format.md`
- `skills/workflow-routines/state-schema.md`
- `skills/workflow-routines/label-rules.md`

## Trigger

GitHub issue labeled **`workflow:start`**.

## Your job

1. **Start** — swap to `workflow:clarify` **first** (from webhook context). Then session comment, initialize artifacts **in this session only**, ask the first question. **No handoff comment yet.**
2. **Grill** — one question at a time; user answers here.
3. **Each turn** — update in-session `requirements.md`, `language.md`, `state.json`. **Do not post to GitHub.**
4. **`approve requirements`** — **POST handoff comment once** (full snapshot), **PATCH** same comment with `handoff_comment_id`, short approval comment, swap to **`workflow:implement` last**, **stop**.

## Handoff — only at end

Marker: `<!-- ai-workflow:handoff v1 issue={n} -->`

Sections: `state.json`, `task.md`, `language.md`, `requirements.md`, optional `adrs.md`.

**Never POST or PATCH handoff during Q&A.**

Handoff POST/PATCH: **`gh api` only** — not curl. See handoff-format.md.

## Do not

- Edit or commit repo files
- Create a branch
- Post handoff before approve
- Run implement (label `workflow:implement` triggers a separate routine)

## Resume

Mid-clarify: continue in **this same session** (use session comment link if needed). Handoff comment does not exist until approve.
