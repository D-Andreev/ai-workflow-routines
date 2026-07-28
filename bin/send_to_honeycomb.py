#!/usr/bin/env python3
"""
Send workflow metrics.jsonl to Honeycomb.

Usage:
    python3 bin/send_to_honeycomb.py \\
      --honeycomb-key YOUR_API_KEY \\
      --dataset workflow-metrics \\
      /path/to/workflow/state

    # Optional environment
    python3 bin/send_to_honeycomb.py \\
      --honeycomb-key YOUR_API_KEY \\
      --dataset workflow-metrics \\
      --env us \\  # or 'eu'
      /path/to/workflow/state
"""

import json
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any
import urllib.request
import urllib.error

class HoneycombClient:
    """Simple Honeycomb API client."""

    def __init__(self, api_key: str, dataset: str, env: str = "us"):
        self.api_key = api_key
        self.dataset = dataset
        self.env = env
        self.endpoint = f"https://api.honeycomb.io/1/events/{dataset}"
        self.sent = 0
        self.failed = 0

    def send_event(self, event: Dict[str, Any]) -> bool:
        """Send a single event to Honeycomb."""
        try:
            data = json.dumps(event).encode("utf-8")
            req = urllib.request.Request(
                self.endpoint,
                data=data,
                headers={
                    "X-Honeycomb-Team": self.api_key,
                    "Content-Type": "application/json",
                },
            )

            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    self.sent += 1
                    return True
                else:
                    print(f"❌ HTTP {response.status}: {response.read().decode()}")
                    self.failed += 1
                    return False

        except urllib.error.HTTPError as e:
            print(f"❌ HTTP Error {e.code}: {e.read().decode()}")
            self.failed += 1
            return False
        except Exception as e:
            print(f"❌ Error: {e}")
            self.failed += 1
            return False

    def send_batch(self, events: List[Dict[str, Any]]) -> int:
        """Send multiple events."""
        success = 0
        for event in events:
            if self.send_event(event):
                success += 1
        return success


def load_metrics(state_root: Path) -> List[Dict[str, Any]]:
    """Load all metrics.jsonl files from issues directories."""
    metrics = []
    for metrics_file in state_root.glob("issues/*/metrics.jsonl"):
        with open(metrics_file) as f:
            for line in f:
                if line.strip():
                    try:
                        metrics.append(json.loads(line))
                    except json.JSONDecodeError as e:
                        print(f"⚠️  Invalid JSON in {metrics_file}: {e}")
    return metrics


def enrich_events(events: List[Dict[str, Any]], repo: str = None) -> List[Dict[str, Any]]:
    """Enrich events with additional fields for Honeycomb."""
    enriched = []

    for event in events:
        # Calculate derived fields for easier querying
        if event.get("event") == "close_completed":
            dispositions = event.get("dispositions", [])
            total = len(dispositions)
            if total > 0:
                addressed = sum(1 for d in dispositions if d["disposition"] == "addressed")
                event["human_addressed_pct"] = round((addressed / total) * 100, 1)
            else:
                event["human_addressed_pct"] = 0

        if event.get("event") == "review_completed":
            total_findings = (
                event.get("critical_count", 0)
                + event.get("minor_count", 0)
                + event.get("notes_count", 0)
            )
            event["findings_total"] = total_findings

        if repo:
            event["repository"] = repo

        enriched.append(event)

    return enriched


def main():
    parser = argparse.ArgumentParser(
        description="Send workflow metrics to Honeycomb"
    )
    parser.add_argument(
        "--honeycomb-key",
        required=True,
        help="Honeycomb API key",
    )
    parser.add_argument(
        "--dataset",
        required=True,
        help="Honeycomb dataset name",
    )
    parser.add_argument(
        "--env",
        default="us",
        choices=["us", "eu"],
        help="Honeycomb environment",
    )
    parser.add_argument(
        "--repo",
        help="Repository name to tag events",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Events per batch (default: 50)",
    )
    parser.add_argument(
        "state_root",
        help="Path to workflow/state branch root",
    )

    args = parser.parse_args()

    state_root = Path(args.state_root)
    if not state_root.exists():
        print(f"❌ Path not found: {state_root}")
        sys.exit(1)

    print(f"📊 Loading metrics from {state_root}...")
    metrics = load_metrics(state_root)

    if not metrics:
        print("❌ No metrics found")
        sys.exit(1)

    print(f"✅ Loaded {len(metrics)} events")

    print(f"🔧 Enriching events...")
    enriched = enrich_events(metrics, repo=args.repo)

    print(f"📤 Sending to Honeycomb ({args.env})...")
    print(f"   Dataset: {args.dataset}")
    print(f"   Batch size: {args.batch_size}")

    client = HoneycombClient(args.honeycomb_key, args.dataset, args.env)

    # Send in batches for rate limiting
    for i in range(0, len(enriched), args.batch_size):
        batch = enriched[i : i + args.batch_size]
        print(f"   Batch {i//args.batch_size + 1}: ", end="", flush=True)
        success = client.send_batch(batch)
        print(f"{success}/{len(batch)} ✓")

    print()
    print("=" * 50)
    print(f"📈 Results:")
    print(f"   Sent:   {client.sent}")
    print(f"   Failed: {client.failed}")

    if client.failed > 0:
        print(f"\n⚠️  Some events failed to send. Check:")
        print(f"   - API key is valid")
        print(f"   - Dataset exists in Honeycomb")
        print(f"   - Network connectivity")
        sys.exit(1)
    else:
        print(f"\n✨ All events sent successfully!")
        print(f"\nNext steps:")
        print(f"  1. Go to honeycomb.io")
        print(f"  2. Open dataset: {args.dataset}")
        print(f"  3. Build queries and dashboards!")

if __name__ == "__main__":
    main()
