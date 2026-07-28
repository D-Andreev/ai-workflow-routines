# send-metrics.yml

GitHub Action that sends workflow metrics to Honeycomb after PR merge.

## Setup

1. Go to your app repo: Settings → Secrets and variables → Actions
2. Add secret: `HONEYCOMB_API_KEY` (get from Honeycomb Settings → API Keys)
3. (Optional) Add secret: `HONEYCOMB_DATASET` (defaults to `workflow-metrics`)

## How It Works

- Triggers on PR merge
- Fetches `workflow/state` branch from your app repo
- Runs `send-to-honeycomb.js` to send metrics to Honeycomb
- Tags events with your repository name

## Manual Trigger

Run anytime from Actions tab:
```
Actions → Send Workflow Metrics to Honeycomb → Run workflow
```

## Notes

- First run: Expected to have no data (workflow/state created on first workflow completion)
- Continues gracefully if secrets not configured or workflow/state missing
- Uses Node.js (no additional dependencies)
