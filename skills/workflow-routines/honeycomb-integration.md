# Honeycomb Integration

Send workflow metrics to Honeycomb for real-time analysis, dashboards, and alerts.

Honeycomb is a cloud observability platform perfect for event streams like `metrics.jsonl`. You get:
- Real-time querying of all metrics
- Custom dashboards & charts (no coding needed)
- Alerting on anomalies
- Cross-repo aggregation (if you have multiple projects)

---

## Setup

### 1. Create Honeycomb Account & Dataset

1. Go to [honeycomb.io](https://honeycomb.io)
2. Sign up (free tier available — 20 million events/month)
3. Create a new **dataset** named `workflow-metrics`
4. Get your **API key** from Settings → API Keys
5. Note your **environment** (usually `us` or `eu`)

### 2. Send Your Metrics

Use the `send_to_honeycomb.py` script in `bin/`:

```bash
python3 bin/send_to_honeycomb.py \
  --honeycomb-key YOUR_API_KEY \
  --dataset workflow-metrics \
  /path/to/workflow/state
```

See [bin/README.md](../../bin/README.md) for detailed usage and examples.

---

## What You'll Get in Honeycomb

### Pre-built Query Examples

Once data is in, you can query like this in Honeycomb's UI:

**Finding adoption rate (close phase):**
```
BREAKDOWN BY disposition
WHERE phase = "close" AND event = "close_completed"
CALCULATE COUNT
```
Shows: addressed (40%), partial (15%), ignored (35%), unknown (10%)

**Recommendation acceptance (clarify phase):**
```
BREAKDOWN BY recommendation_outcome
WHERE phase = "clarify"
CALCULATE COUNT
```
Shows which outcomes are most common

**Average findings per review:**
```
WHERE event = "review_completed"
CALCULATE AVG(findings_total), P95(findings_total)
```

**Critical findings ignored (red flag):**
```
WHERE event = "close_completed" AND severity = "critical" AND disposition = "ignored"
CALCULATE COUNT
```

---

## Honeycomb Dashboards

Create a dashboard with these tiles:

### Tile 1: Finding Adoption
```
Type: Breakdown
Query: WHERE phase = "close" AND event = "close_completed"
Breakdown: By disposition
Show: COUNT
```
**Insight**: What % of findings are addressed vs ignored?

### Tile 2: Recommendation Acceptance
```
Type: Breakdown
Query: WHERE phase = "clarify"
Breakdown: By recommendation_outcome
Show: COUNT
```
**Insight**: Are AI recommendations hitting the mark?

### Tile 3: Verdict Distribution
```
Type: Breakdown
Query: WHERE event = "review_completed"
Breakdown: By verdict
Show: COUNT
```
**Insight**: Are reviews too strict/lenient?

### Tile 4: Average Findings per Review
```
Type: Heatmap or Time Series
Query: WHERE event = "review_completed"
Calculate: HEATMAP(findings_total)
Time Granularity: By week or by issue
```
**Insight**: Are issues growing in scope over time?

### Tile 5: Unknown Dispositions (Red Flag)
```
Type: Time Series or Single Value
Query: WHERE event = "close_completed"
Calculate: PERCENTILE(findings_unknown, 0.75)
```
**Insight**: If >5%, your findings need better paths

### Tile 6: Category Distribution (Clarify)
```
Type: Breakdown
Query: WHERE phase = "clarify"
Breakdown: By category
Show: COUNT
```
**Insight**: Which question types come up most?

---

## Advanced Querying

### Question: "Is the workflow getting faster or slower?"

```
GROUP BY 1w
WHERE event = "close_completed"
CALCULATE AVG(commits_since_review), P95(commits_since_review)
```

### Question: "Are critical findings being ignored?"

```
WHERE event = "close_completed"
BREAKDOWN BY severity, disposition
CALCULATE COUNT
```

Then look at `(critical, ignored)` row.

### Question: "What % of questions get rejected?"

```
WHERE phase = "clarify"
BREAKDOWN BY recommendation_outcome
CALCULATE COUNT
```

Calculate: `rejected / total * 100`

---

## Alerts

Set up Honeycomb alerts to notify you of issues:

### Alert 1: High ignored rate
```
WHERE event = "close_completed"
CALCULATE (COUNT_DISTINCT WHERE disposition = "ignored") / COUNT > 0.5
Threshold: > 50%
→ Trigger if findings ignored rate exceeds 50%
```

### Alert 2: Too many unknowns
```
WHERE event = "close_completed"
CALCULATE PERCENTILE(findings_unknown, 0.50) > 3
→ Trigger if median unknown dispositions > 3 per issue
```

### Alert 3: Slow cycles
```
WHERE event = "close_completed"
CALCULATE P95(duration_seconds / 3600) > 8
→ Trigger if 95th percentile cycle time > 8 hours
```

---

## Schema Enhancements

Your current metrics.jsonl schema works great. For even better Honeycomb experience, consider adding these optional fields:

```json
{
  "schema_version": 1,
  "ts": "2026-07-28T18:00:00.000Z",
  "issue_number": 42,
  "phase": "close",
  "event": "close_completed",
  "session_id": null,
  
  // Honeycomb-friendly additions:
  "repository": "d-andreev/ai-workflow-routines",    // For multi-repo filtering
  "environment": "production",                        // If you have variants
  "workflow_id": "issue-42-workflow",                // Trace across phases
  "human_addressed": 0.62,                           // (addressed+partial) / total
  "severity_critical_pct": 0.15,                     // Easier to graph
  "duration_seconds": 28800,                         // For cycle time analysis
  
  ...rest of existing fields...
}
```

The `send_to_honeycomb.py` script automatically adds some of these (like `human_addressed_pct`, `findings_total`).

---

## Multi-repo Aggregation

If you use this workflow across multiple repositories, tag each with `--repo`:

```bash
# App repo 1
python3 workflow-tools/bin/send_to_honeycomb.py \
  --repo "my-app" \
  ...

# App repo 2
python3 workflow-tools/bin/send_to_honeycomb.py \
  --repo "another-app" \
  ...
```

Then query across all repos:

```
BREAKDOWN BY repository
WHERE event = "close_completed"
CALCULATE COUNT
```

See adoption rates by app, find which repos need attention, etc.

---

## Comparison: Local Analysis vs Honeycomb

| Task | Local Script | Honeycomb |
|------|--------------|-----------|
| Quick snapshot | ✓ Fast | - |
| Ad-hoc queries | △ Requires script | ✓ Instant UI |
| Live streaming | ✗ Batch only | ✓ Real-time |
| Custom alerts | ✗ Build yourself | ✓ Built-in |
| Trend charts | △ Manual | ✓ Auto |
| Collaboration | ✗ Share reports | ✓ Shared dashboards |
| Cost | ✓ Free | △ Paid (free tier available) |

**Recommendation**: Use **both**:
1. **Local script** (`analyze_metrics.py`) for initial diagnostic
2. **Honeycomb** for ongoing monitoring and dashboards

---

## Troubleshooting

**"HTTP Error 401"**: API key is invalid
- Check Honeycomb Settings → API Keys
- Ensure key has write access to your dataset

**"No metrics found"**: Path doesn't contain data
- Verify: `ls /path/to/workflow/state/issues/*/metrics.jsonl`
- Ensure at least one workflow completed

**"HTTP 429 (rate limited)"**: Honeycomb throttling
- Increase `--batch-size` in the script
- Try again later

---

## Further Reading

- [Metrics Schema](metrics.md) — Complete field definitions
- [Analysis Framework](../../METRICS_ANALYSIS.md) — How to interpret metrics
- [Bin Tools](../../bin/README.md) — Script usage and integration
