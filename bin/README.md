# send-to-honeycomb.js

Send close phase data to Honeycomb.

```bash
node bin/send-to-honeycomb.js \
  --honeycomb-key KEY \
  --dataset workflow-metrics \
  /path/to/workflow/state
```

**Sends**: metrics.jsonl, findings-grade.json, state.json from all issues.

Used by `.github/workflows/send-metrics.yml` (auto-runs after PR merge).
