# AI Workflow Routines

[![skills.sh](https://skills.sh/b/D-Andreev/ai-workflow-routines)](https://skills.sh/b/D-Andreev/ai-workflow-routines)

Turn GitHub issues into shipped code. An improved [ai-workflow](https://github.com/D-Andreev/ai-workflow) that runs in the cloud via [Claude Code Routines](https://code.claude.com/docs/en/routines) — add a label, a routine starts, you interact from your phone or browser.

## How it works

Label an issue to kick off a phase. The routine posts **short session links** on the issue. Machine state lives in a **secret handoff gist** — not in issue comments or repo workflow folders.

```mermaid
flowchart LR
    issue["Issue + workflow:start"] --> clarify --> implement --> aiReview --> human --> merge["Merge · close"]
    human -->|"optional"| comprehension --> merge
```

| Phase | What the AI does | What you do |
|-------|------------------|-------------|
| **Clarify** | Asks questions, writes requirements | Answer in the session. Say **`approve requirements`** when done |
| **Implement** | Creates branch, writes code, opens **draft PR** | Wait, or watch in the session |
| **AI Review** | Reviews the diff; posts short PR comment; submits approve / approve-with-notes / request-changes | Nothing — check the PR review on GitHub |
| **Human review** | — | If REQUEST CHANGES: fix and re-run review. Else: test locally, optional **`/workflow-comprehension`**, **`gh pr ready`**, merge |
| **Done** | — | Merge PR, close issue |

Labels advance automatically (`workflow:start` → `workflow:clarify` → `workflow:implement` → `workflow:review` → `workflow:human-review`). You only add `workflow:start` to begin.

## Setup

One-time, in your **target repo**:

**1. Install skills and init**

```bash
INSTALL_INTERNAL_SKILLS=1 npx skills add D-Andreev/ai-workflow-routines --copy --skill '*' -a claude-code -y
/workflow-init
```

`/workflow-init` creates GitHub labels and scaffolds `workflow/` (commit that folder). 

To update skills later, re-run the same install command:

```bash
INSTALL_INTERNAL_SKILLS=1 npx skills add D-Andreev/ai-workflow-routines --copy --skill '*' -a claude-code -y
```

Start a **new Claude Code session** after updating. Your `workflow/` files are unchanged — no need to run init again.

**2. Create routines**

At [claude.ai/code/routines](https://claude.ai/code/routines), create three routines — connect your repo with the [Claude GitHub App](https://github.com/apps/claude) (**required** for issue comments, labels, PR reviews, handoff gists, and git push). Org repos: an admin may need to approve app access.

| Routine | Label trigger | Paste from |
|---------|---------------|------------|
| Clarify | `workflow:start` | [routines/clarify-routine.md](routines/clarify-routine.md) |
| Implement | `workflow:implement` | [routines/implement-routine.md](routines/implement-routine.md) |
| AI Review | `workflow:review` | [routines/review-routine.md](routines/review-routine.md) |

## Use it

1. Open a GitHub issue describing the work
2. Add label **`workflow:start`**
3. Open the session link on the issue and follow the phases above

## Example

See [simple-todo-app](https://github.com/D-Andreev/simple-todo-app) — a repo set up with this workflow. Browse its issues and PRs to see clarify → implement → review in action.
