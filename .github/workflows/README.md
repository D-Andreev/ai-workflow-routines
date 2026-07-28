# Workflow Actions

GitHub Actions for workflow automation.

## send-metrics.yml

Automatically sends workflow metrics to Honeycomb after PR merge.

### Triggers

**Automatic (PR Merge):**
- Runs when a PR is merged (pull_request closed + merged=true)
- Fetches `workflow/state` branch
- Sends all metrics to Honeycomb
- Adds summary to PR

**Manual (Workflow Dispatch):**
- Run from Actions tab anytime
- Useful for re-sending metrics or testing setup
- Supports optional repo name override

### Setup

#### 1. Create Honeycomb Secrets

In your repo (Settings → Secrets and variables → Actions), add:

**`HONEYCOMB_API_KEY`** (required)
- Get from Honeycomb Settings → API Keys
- Keep this secret; don't commit

**`HONEYCOMB_DATASET`** (optional)
- Dataset name in Honeycomb (default: `workflow-metrics`)
- Create in Honeycomb UI if it doesn't exist

#### 2. First Run (Manual)

Test the setup manually before relying on auto-trigger:

1. Go to **Actions** tab in your repo
2. Select **Send Workflow Metrics to Honeycomb**
3. Click **Run workflow** (use workflow_dispatch)
4. Check logs to verify it works

#### 3. Verify in Honeycomb

1. Go to [honeycomb.io](https://honeycomb.io)
2. Open your dataset
3. Should see events from your workflow
4. Build queries and dashboards

### What It Does

```
1. Checkout workflow-routines repo
2. Fetch workflow/state branch (if exists)
3. Run send_to_honeycomb.py
   - Tag events with repository name
   - Send all metrics.jsonl events
   - Batch requests for efficiency
4. Report summary to PR or workflow run
```

### Limitations & Notes

**First Run**: If this is the first workflow run, `workflow/state` won't exist yet.
- Action completes gracefully
- No error — workflow/state is created by the close routine

**Requires workflow/state**: The action looks for metrics at `issues/*/metrics.jsonl`
- This branch is managed by the AI workflow routines (not your app repo)
- Lives on `workflow/state` branch in your app's repo
- Created automatically when you start a workflow on an issue

**PR Context**: The action runs in the context of the app repo using this workflow
- It pulls workflow-routines code to get the script
- It pushes to the *app repo's* workflow/state branch

### Example: Using with Multiple Repos

If multiple app repos use this workflow:

1. Each app repo sets `HONEYCOMB_API_KEY` in its Actions secrets
2. Action automatically tags events with repo name
3. In Honeycomb, query by repository:
   ```
   BREAKDOWN BY repository
   WHERE event = "close_completed"
   ```

### Troubleshooting

**"HONEYCOMB_API_KEY secret not configured"**
- Go to Settings → Secrets and variables → Actions
- Add `HONEYCOMB_API_KEY` with your key from Honeycomb

**"No workflow/state data to send"**
- Expected on first run
- workflow/state is created when the close routine first runs
- After first workflow completes, metrics will appear

**"workflow/state branch not found"**
- This branch is created by the workflow routines
- Expected if you haven't run the workflow yet
- Action gracefully skips in this case

**"HTTP Error 401 in logs"**
- Your API key is invalid or dataset doesn't exist
- Verify in Honeycomb Settings → API Keys
- Check dataset name matches

**"Metrics showing up but incomplete"**
- Give workflow/state time to be pushed by close routine
- Restart the action from Actions tab
- Or wait for next PR merge to auto-trigger

### Manual Trigger (Testing)

```bash
# Via GitHub CLI (if installed)
gh workflow run send-metrics.yml --repo your-org/your-app
```

Or use GitHub UI:
1. Actions tab
2. "Send Workflow Metrics to Honeycomb"
3. "Run workflow"
4. (Optional) Enter custom repo name
5. Watch logs in real-time

### Dashboards

Once metrics flow in, refer to [honeycomb-integration.md](../../skills/workflow-routines/honeycomb-integration.md) for:
- Pre-built dashboard examples
- Query recipes
- Alert configurations

### Further Reading

- [Honeycomb Integration Guide](../../skills/workflow-routines/honeycomb-integration.md)
- [Send Script](../../bin/send_to_honeycomb.py)
- [Metrics Schema](../../skills/workflow-routines/metrics.md)
