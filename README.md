# AI Workflow Routines

[![skills.sh](https://skills.sh/b/D-Andreev/ai-workflow-routines)](https://skills.sh/b/D-Andreev/ai-workflow-routines)

GitHub-issue-driven development workflow powered by [Claude Code Routines](https://code.claude.com/docs/en/skills). Adapted from [ai-workflow](https://github.com/D-Andreev/ai-workflow).

## How it works

```mermaid
flowchart LR
    issue["Issue + workflow:start"]
    clarify["Clarify"]
    implement["Implement"]
    aiReview["AI Review\n(session)"]
    human["Human review\n(GitHub PR)"]

    issue --> clarify
    clarify --> implement
    implement --> aiReview
    aiReview -->|"proceed to human review"| human
```

1. **Clarify** — session Q&A → handoff comment → `workflow:implement`
2. **Implement** — branch, TDD, PR → `workflow:review`
3. **AI Review** — fresh-eyes diff review in session; user can request fixes on branch until **`proceed to human review`** → `workflow:human-review`
4. **Human review** — review and merge PR on GitHub (no routine)

## Install

From your **target project** (not this repo):

```bash
INSTALL_INTERNAL_SKILLS=1 npx skills add D-Andreev/ai-workflow-routines --copy --skill '*' -a claude-code -y
/workflow-init
```

Workflow files (`PROJECT.md`, etc.) live under **`.claude/workflows/`** — separate from skills. Commit that directory to git; it is not managed by the skills CLI.

## Update skills

After pushing changes to GitHub, from the **target project**:

```bash
INSTALL_INTERNAL_SKILLS=1 npx skills add D-Andreev/ai-workflow-routines --copy --skill '*' -a claude-code -y
```

Global install: add `-g` to the `skills add` command above (skills land in `~/.claude/skills/`).

Start a **new Claude Code session** after updating.

### If skills disappeared after `skills update`

Re-run the install command above.

If `.claude/skills/` is missing but `.agents/skills/` has your skills, symlink (from project root):

```bash
mkdir -p .claude/skills
for skill in .agents/skills/*/; do
  name=$(basename "$skill")
  ln -sf "../../.agents/skills/$name" ".claude/skills/$name"
done
```

Or use `--copy` via `skills add` to populate `.claude/skills/` directly.

Verify: `npx skills list -a claude-code` and check `.claude/skills/workflow-clarify/SKILL.md` exists.

**Local development** (before push): re-run `skills add` with a local path — `skills update` does not track local installs:

```bash
INSTALL_INTERNAL_SKILLS=1 npx skills add /path/to/ai-workflow-routines --copy --skill '*' -a claude-code -y
```

## Labels

| Label | Triggers |
|-------|----------|
| `workflow:start` | Clarify routine |
| `workflow:clarify` | Clarify in progress |
| `workflow:implement` | Implement routine |
| `workflow:review` | AI Review routine |
| `workflow:human-review` | Human PR review (no routine) |

## Routines

| Routine | Label | Prompt |
|---------|-------|--------|
| Clarify | `workflow:start` | [routines/clarify-routine.md](routines/clarify-routine.md) |
| Implement | `workflow:implement` | [routines/implement-routine.md](routines/implement-routine.md) |
| AI Review | `workflow:review` | [routines/review-routine.md](routines/review-routine.md) |

Handoff format: [skills/workflow-routines/handoff-format.md](skills/workflow-routines/handoff-format.md)

## Skills

| Skill | Scope |
|-------|-------|
| `workflow-init` | Repo setup |
| `workflow-clarify` | Requirements; handoff at approve |
| `workflow-implement` | Code on branch; PR |
| `workflow-review` | AI review + fix loop; handoff at proceed |

## Session commands

| Phase | Advance |
|-------|---------|
| Clarify | `approve requirements` |
| AI Review | `proceed to human review` (alias: `approve review`) |
