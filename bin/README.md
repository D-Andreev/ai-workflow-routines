# send-to-honeycomb.js

Send workflow metrics.jsonl to Honeycomb.

## Usage

```bash
node bin/send-to-honeycomb.js \
  --honeycomb-key YOUR_API_KEY \
  --dataset workflow-metrics \
  /path/to/workflow/state
```

## Options

- `--honeycomb-key` (required): Honeycomb API key from Settings → API Keys
- `--dataset` (required): Honeycomb dataset name
- `--env` (optional): `us` or `eu` (default: `us`)
- `--repo` (optional): Repository name to tag events
- `--batch-size` (optional): Events per batch (default: 50)

## GitHub Action

This script runs automatically via `.github/workflows/send-metrics.yml` after PR merge.

To set up:
1. Add `HONEYCOMB_API_KEY` secret in repo Settings → Secrets and variables → Actions
2. (Optional) Add `HONEYCOMB_DATASET` secret (defaults to `workflow-metrics`)
3. Merge a PR and the metrics will automatically send to Honeycomb
