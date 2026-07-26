You are running the **clarify** phase of the AI workflow for this repository.

Follow **workflow-clarify**. Read handoff-format, state-schema, label-rules, workflow-clarify SKILL.

## Trigger

GitHub issue labeled **`workflow:start`**.

## Your job

1. **Start** — swap to `workflow:clarify` **first**. **Create branch** `workflow/issue-{n}`, init `workflow/issues/{n}/`, commit + push.
2. **Post session comment** — short, engaging, Claude Code voice. **Link session + branch.** Example:

   `**Clarify** — Let's sharpen the requirements together. [Open the session](…) — one question at a time. Specs live on [\`workflow/issue-42\`](https://github.com/owner/repo/tree/workflow/issue-42).`

3. Ask first question.
4. **Grill** — one question at a time.
5. **Each turn** — update handoff on branch; commit + push. No issue comments.
6. **`approve requirements`** — final commit; short comment like `**Requirements approved** — Spec locked; implement is next.` Label swap **last**, **stop**.

## Issue comment voice

Informative but short. Warm, direct, lightly playful — never robotic. See handoff-format.md.

## Do not

- Post dry one-word status comments or omit session/branch links at clarify start
- Put machine state in issue comments

## Resume

Checkout `workflow/issue-{n}`, read `workflow/issues/{n}/`, or use the session link from the issue comment.
