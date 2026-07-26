# Issue Comment Handoff Format

Per-issue pipeline artifacts live in **one GitHub issue comment**. Clarify **POSTs** it; every later phase **PATCHes** the same comment and **updates `state.json`**.

Full schema: [state-schema.md](state-schema.md)

## Marker

```html
<!-- ai-workflow:handoff v1 issue=42 -->
```

## Comment body template

```markdown
<!-- ai-workflow:handoff v1 issue=42 -->

_Workflow handoff — updated by each phase._

### state.json

```json
{ ... }
```

### task.md
...

### language.md
...

### requirements.md
...

### adrs.md
...

### implement-handoff.md
...

### review-report.md
...
```

Use **per-section fences only**. Omit empty optional sections until that phase writes them.

### Section rules

| Section | First writer | Updated by |
|---------|--------------|------------|
| `state.json` | clarify | **every phase** (POST + PATCH each start/complete) |
| `task.md`, `language.md`, `requirements.md`, `adrs.md` | clarify | preserved in every PATCH |
| `implement-handoff.md` | implement (complete) | preserved in review PATCH |
| `review-report.md` | review (complete) | — |

## Write protocol

### GitHub API (cloud routines — required)

Handoff POST/PATCH **must** use the **`gh` CLI** (Bash). Cloud sessions authenticate via the **[Claude GitHub App](https://github.com/apps/claude)** on the repo — not `$GITHUB_TOKEN`, not `curl`, not git credential helpers.

**Do not:**

- `curl` to `api.github.com` with a manually sourced token
- Read `$GITHUB_TOKEN` from the environment and call the REST API yourself
- Skip PATCH because the handoff is readable by marker — **reading ≠ updating `state.json`**

**Do:**

- `gh api …` for POST/PATCH (same auth as `gh issue comment`, `gh pr review`, label edits)
- Verify the response — if it contains `"message"` and HTTP failed, **stop** (see failure handling below)
- Prefer writing the comment body to a temp file, then:

```bash
# POST new handoff
gh api --method POST "repos/{owner}/{repo}/issues/{n}/comments" \
  --input - <<< "$(jq -n --rawfile body /tmp/handoff.md '{body: $body}')"

# PATCH existing handoff (REST comment id from POST response or state.json handoff_comment_id)
gh api --method PATCH "repos/{owner}/{repo}/issues/comments/{comment_id}" \
  --input - <<< "$(jq -n --rawfile body /tmp/handoff.md '{body: $body}')"
```

If REST PATCH fails, retry with GraphQL `updateIssueComment` (needs comment **node** id, not numeric id):

```bash
gh api graphql -f query='mutation($id:ID!, $body:String!){
  updateIssueComment(input:{id:$id, body:$body}) { issueComment { id } }
}' -f id='{graphql_node_id}' -f body='...'
```

Get node id: `gh api graphql …` query `issue(number: N) { comments { nodes { id databaseId } } }`.

**Routine setup:** repo must have the Claude GitHub App installed with **issues: write**. Org repos may need an admin to approve app access.

### On handoff write failure

1. Post a **short issue comment** — phase name, that handoff PATCH/POST failed, paste error snippet, link session if known.
2. **Stop** — do not swap workflow labels, do not open PR, do not claim the next phase will pick up stale state.
3. Do **not** tell the user that reading the handoff by marker is sufficient.

### Clarify (POST once, then PATCH for comment id)

1. Build full snapshot from in-session artifacts
2. **POST** new comment — `gh api POST repos/{owner}/{repo}/issues/{n}/comments`
3. Read `id` from response → **PATCH** same comment immediately — set `handoff_comment_id` in `state.json`, append history `handoff_created`
4. Do **not** POST or PATCH handoff during Q&A turns

### Later phases (implement, review, …)

1. Read handoff — use `state.json` → `handoff_comment_id`, or find comment with marker
2. **PATCH at phase start** — update `state.json` (`phase`, `status: ai_running`, `last_session_url`, history `started`)
3. Do phase work
4. **PATCH at phase complete** — update `state.json` (phase fields, history `phase_completed`, `labels_updated`), add phase sections (`implement-handoff.md`, `review-report.md`, …)
5. **Full snapshot every PATCH** — include all existing sections, not just deltas

**Never POST a second handoff comment** for the same issue. **Never use curl** for handoff writes — see [GitHub API (cloud routines)](#github-api-cloud-routines--required) above.

## Read protocol

1. Fetch issue comments; find `<!-- ai-workflow:handoff v1 issue={n} -->` (prefer `handoff_comment_id` from last read)
2. If missing — clarify not finished; implement must not run
3. Parse `### {filename}` sections → fenced blocks

## Session comment (separate, at phase start)

Claude Code session URL — posted on the issue when **clarify**, **implement**, or **review** starts; not the handoff. See [label-rules.md](label-rules.md).

## Repo vs issue

| During clarify (session memory) | Handoff comment (issue) | Repo (implement writes) |
|-------------------------------|-------------------------|-------------------------|
| `language.md` | handoff `language.md` | `workflow/PROJECT.md` `## Language` |
| `requirements.md` | handoff `requirements.md` | |
| `adrs.md` | handoff `adrs.md` | `docs/adr/` |

**Label swap is always the last GitHub write** when advancing phases (see [label-rules.md](label-rules.md)).
