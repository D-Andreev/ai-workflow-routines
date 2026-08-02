# Honeycomb Integration Refactor

**Old flow:** PR merges → GitHub Action runs → sends batch of all metrics to Honeycomb  
**New flow:** Issue closes → close routine runs → sends metrics for that issue to Honeycomb

## What Changed

### Close Phase Now Sends Metrics (Primary)

When the **close routine** runs (issue closed with `workflow:human-review`):

1. Grade findings
2. Append metrics to metrics.jsonl
3. **Send metrics to Honeycomb** (new step)
   ```bash
   node bin/send-to-honeycomb-issue.js \
     --issue {n} \
     --honeycomb-key "$HONEYCOMB_API_KEY" \
     --dataset workflow-metrics \
     --repo "$GITHUB_REPOSITORY"
   ```

**Requirements:**
- Set `HONEYCOMB_API_KEY` environment variable in the routine (or keep unset to skip)
- Close routine must have network access (already has for other operations)

### GitHub Action is Now Optional (Fallback)

The `.github/workflows/send-metrics.yml` action still runs on PR merge, but:
- It's labeled as "Fallback"
- Only sends metrics that weren't already sent from close phase
- Can be disabled if all issues go through close phase

**When GitHub Action is useful:**
- Issues closed without going through close phase (manual close, archived, etc.)
- Metrics from issues that failed to send during close
- Batch verification that all metrics made it to Honeycomb

## Benefits

### ✅ Tighter Coupling
- Metrics send immediately when close is done, not after PR merge
- No race condition between PR merge and metric delivery
- Metrics sent right after findings grade, before labels change

### ✅ Better Error Handling
- Close routine can see network errors and log them
- Failed sends don't block issue close (graceful degradation)
- Retry logic can be added later in close routine

### ✅ Simpler Secrets Management
- No need for GitHub Action secrets
- Use routine environment variables (already available)
- Can be configured per routine

### ✅ Cleaner Separation of Concerns
- GitHub Actions do what they do best: react to PR events (fallback only)
- Workflow routine handles workflow metrics (primary path)

## Environment Configuration

### For Routines

Set environment variables when creating the close routine:

```bash
HONEYCOMB_API_KEY=your-api-key
HONEYCOMB_DATASET=workflow-metrics  # optional, defaults to workflow-metrics
```

Or leave unset to skip metric sending (metrics stay on workflow/state for later batch).

### For GitHub Action (Optional)

Set repository secrets:

```
HONEYCOMB_API_KEY = your-api-key
HONEYCOMB_DATASET = workflow-metrics  # optional
```

If unset, action skips sending silently.

## Testing

### Test send from close phase:

```bash
# Simulate close routine environment
export HONEYCOMB_API_KEY="your-test-key"
export GITHUB_REPOSITORY="owner/repo"

node bin/send-to-honeycomb-issue.js \
  --issue 42 \
  --honeycomb-key "$HONEYCOMB_API_KEY" \
  --dataset workflow-metrics \
  --repo "$GITHUB_REPOSITORY"
```

### Test GitHub Action fallback:

```bash
# From workflow/state directory
node bin/send-to-honeycomb.js \
  --honeycomb-key "your-test-key" \
  --dataset workflow-metrics \
  --repo "owner/repo" \
  .
```

## Migration Checklist

- [ ] Add `HONEYCOMB_API_KEY` to close routine environment variables
- [ ] Test close routine with metrics sending enabled
- [ ] Verify metrics appear in Honeycomb after issue close
- [ ] Keep GitHub Action as fallback (or disable if confident in close phase)
- [ ] Remove GitHub Action secrets if no longer needed

## Files

| File | Purpose |
|------|---------|
| `bin/send-to-honeycomb-issue.js` | Send metrics for one issue (called from close phase) |
| `bin/send-to-honeycomb.js` | Existing batch sender (called from GitHub Action fallback) |
| `skills/workflow-close/SKILL.md` | Updated to call send-to-honeycomb-issue.js |
| `.github/workflows/send-metrics.yml` | Now labeled as fallback, optional |
