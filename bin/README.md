# Workflow Tools

Scripts for working with AI workflow routines.

## send_to_honeycomb.py

Send workflow metrics to Honeycomb for analysis and dashboarding.

### Installation

This script is part of the `ai-workflow-routines` repository. Clone it or reference it from your workflow-using repo:

```bash
# In your repo that uses ai-workflow-routines:
git clone https://github.com/d-andreev/ai-workflow-routines.git

# Or add as a submodule:
git submodule add https://github.com/d-andreev/ai-workflow-routines.git workflow-tools
```

### Quick Start

```bash
python3 workflow-tools/bin/send_to_honeycomb.py \
  --honeycomb-key YOUR_API_KEY \
  --dataset workflow-metrics \
  /path/to/workflow/state
```

### Usage

```bash
python3 bin/send_to_honeycomb.py \
  --honeycomb-key YOUR_API_KEY \
  --dataset workflow-metrics \
  [--env us|eu] \
  [--repo repository-name] \
  [--batch-size 50] \
  /path/to/workflow/state
```

**Arguments:**
- `--honeycomb-key`: Required. Your Honeycomb API key (get from Settings → API Keys)
- `--dataset`: Required. Honeycomb dataset name (create in Honeycomb UI)
- `--env`: Optional. Honeycomb environment (`us` or `eu`, default: `us`)
- `--repo`: Optional. Repository name to tag all events (for filtering multi-repo data)
- `--batch-size`: Optional. Events per batch (default: 50)
- `state_root`: Required. Path to your `workflow/state` branch checkout

### Example: From Your App Repo

If `workflow/state` is on a separate branch:

```bash
# In your app repo:

# 1. Clone workflow tools (one-time)
git clone https://github.com/d-andreev/ai-workflow-routines.git workflow-tools

# 2. Fetch workflow/state from origin
git fetch origin workflow/state:workflow-state-local

# 3. Run the script
python3 workflow-tools/bin/send_to_honeycomb.py \
  --honeycomb-key YOUR_KEY \
  --dataset workflow-metrics \
  --repo "my-app" \
  workflow-state-local

# 4. Clean up
rm -rf workflow-state-local
```

### Environment Variables (Alternative)

Instead of `--honeycomb-key`, set:

```bash
export HONEYCOMB_KEY=your_api_key
```

Then modify the script to use `os.getenv("HONEYCOMB_KEY")` if needed.

### Output

```
📊 Loading metrics from /path/to/workflow/state...
✅ Loaded 42 events
🔧 Enriching events...
📤 Sending to Honeycomb (us)...
   Dataset: workflow-metrics
   Batch size: 50
   Batch 1: 42/42 ✓

==================================================
📈 Results:
   Sent:   42
   Failed: 0

✨ All events sent successfully!

Next steps:
  1. Go to honeycomb.io
  2. Open dataset: workflow-metrics
  3. Build queries and dashboards!
```

### Troubleshooting

**"HTTP Error 401"**: API key is invalid or dataset doesn't exist
- Verify key in Honeycomb Settings → API Keys
- Verify dataset name matches what you created in Honeycomb

**"No metrics found"**: workflow/state path doesn't contain `issues/*/metrics.jsonl`
- Check path is correct: `ls /path/to/workflow/state/issues/*/metrics.jsonl`
- Ensure you've fetched the `workflow/state` branch
- Ensure at least one workflow has completed (written metrics)

**"HTTP 429 (rate limited)"**: Honeycomb throttling your requests
- Increase `--batch-size` to send fewer requests
- Add delay between batches (requires script modification)

### Integration with Routines

To automatically send metrics after a routine completes, add to your routine's post-script:

```bash
# After git push on workflow/state
python3 ../ai-workflow-routines/bin/send_to_honeycomb.py \
  --honeycomb-key $HONEYCOMB_KEY \
  --dataset workflow-metrics \
  --repo $(git remote get-url origin | sed 's/.*\///; s/\.git//') \
  .
```

(Assumes workflow/state is your current directory and `HONEYCOMB_KEY` env var is set)

### Further Reading

- [Honeycomb Setup Guide](../skills/workflow-routines/honeycomb-setup.md) — Dashboard examples and queries
- [Metrics Schema](../skills/workflow-routines/metrics.md) — What fields are available
