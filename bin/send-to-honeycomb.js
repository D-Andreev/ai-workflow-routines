#!/usr/bin/env node
/**
 * Send workflow metrics.jsonl to Honeycomb
 *
 * Usage:
 *   node bin/send-to-honeycomb.js \
 *     --honeycomb-key YOUR_API_KEY \
 *     --dataset workflow-metrics \
 *     /path/to/workflow/state
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

class HoneycombClient {
  constructor(apiKey, dataset, env = "us") {
    this.apiKey = apiKey;
    this.dataset = dataset;
    this.env = env;
    this.endpoint = `api.honeycomb.io`;
    this.sent = 0;
    this.failed = 0;
  }

  sendEvent(event) {
    return new Promise((resolve) => {
      const data = JSON.stringify(event);
      const options = {
        hostname: this.endpoint,
        port: 443,
        path: `/1/events/${this.dataset}`,
        method: "POST",
        headers: {
          "X-Honeycomb-Team": this.apiKey,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          this.sent++;
          resolve(true);
        } else {
          console.error(`❌ HTTP ${res.statusCode}`);
          this.failed++;
          resolve(false);
        }
        res.on("data", () => {}); // consume response
      });

      req.on("error", (e) => {
        console.error(`❌ Error: ${e.message}`);
        this.failed++;
        resolve(false);
      });

      req.on("timeout", () => {
        req.destroy();
        this.failed++;
        resolve(false);
      });

      req.write(data);
      req.end();
    });
  }

  async sendBatch(events) {
    let success = 0;
    for (const event of events) {
      if (await this.sendEvent(event)) {
        success++;
      }
    }
    return success;
  }
}

function loadMetrics(stateRoot) {
  const metrics = [];
  const issuesDir = path.join(stateRoot, "issues");

  if (!fs.existsSync(issuesDir)) {
    return metrics;
  }

  const issues = fs.readdirSync(issuesDir);
  for (const issue of issues) {
    const metricsFile = path.join(issuesDir, issue, "metrics.jsonl");
    if (fs.existsSync(metricsFile)) {
      const lines = fs
        .readFileSync(metricsFile, "utf-8")
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        try {
          metrics.push(JSON.parse(line));
        } catch (e) {
          console.error(`⚠️  Invalid JSON in ${metricsFile}: ${e.message}`);
        }
      }
    }
  }

  return metrics;
}

function enrichEvents(events, repo) {
  return events.map((event) => {
    // Add derived fields for Honeycomb
    if (event.event === "close_completed") {
      const dispositions = event.dispositions || [];
      const total = dispositions.length;
      if (total > 0) {
        const addressed = dispositions.filter(
          (d) => d.disposition === "addressed"
        ).length;
        event.human_addressed_pct = Math.round((addressed / total) * 100 * 10) / 10;
      } else {
        event.human_addressed_pct = 0;
      }
    }

    if (event.event === "review_completed") {
      const total =
        (event.critical_count || 0) +
        (event.minor_count || 0) +
        (event.notes_count || 0);
      event.findings_total = total;
    }

    if (repo) {
      event.repository = repo;
    }

    return event;
  });
}

async function main() {
  const args = process.argv.slice(2);

  let apiKey;
  let dataset;
  let env = "us";
  let repo;
  let batchSize = 50;
  let stateRoot;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--honeycomb-key") {
      apiKey = args[++i];
    } else if (args[i] === "--dataset") {
      dataset = args[++i];
    } else if (args[i] === "--env") {
      env = args[++i];
    } else if (args[i] === "--repo") {
      repo = args[++i];
    } else if (args[i] === "--batch-size") {
      batchSize = parseInt(args[++i]);
    } else if (!args[i].startsWith("--")) {
      stateRoot = args[i];
    }
  }

  if (!apiKey || !dataset || !stateRoot) {
    console.error("Usage:");
    console.error(
      "  node send-to-honeycomb.js --honeycomb-key KEY --dataset DATASET [--repo NAME] /path/to/workflow/state"
    );
    process.exit(1);
  }

  if (!fs.existsSync(stateRoot)) {
    console.error(`❌ Path not found: ${stateRoot}`);
    process.exit(1);
  }

  console.log(`📊 Loading metrics from ${stateRoot}...`);
  const metrics = loadMetrics(stateRoot);

  if (metrics.length === 0) {
    console.log("ℹ️  No metrics found");
    process.exit(0);
  }

  console.log(`✅ Loaded ${metrics.length} events`);
  console.log(`🔧 Enriching events...`);

  const enriched = enrichEvents(metrics, repo);

  console.log(`📤 Sending to Honeycomb (${env})...`);
  console.log(`   Dataset: ${dataset}`);
  console.log(`   Batch size: ${batchSize}`);

  const client = new HoneycombClient(apiKey, dataset, env);

  for (let i = 0; i < enriched.length; i += batchSize) {
    const batch = enriched.slice(i, i + batchSize);
    process.stdout.write(
      `   Batch ${Math.floor(i / batchSize) + 1}: `,
      "utf-8"
    );
    const success = await client.sendBatch(batch);
    console.log(`${success}/${batch.length} ✓`);
  }

  console.log("");
  console.log("=".repeat(50));
  console.log(`📈 Results:`);
  console.log(`   Sent:   ${client.sent}`);
  console.log(`   Failed: ${client.failed}`);

  if (client.failed > 0) {
    console.error(`\n⚠️  Some events failed to send. Check:`);
    console.error(`   - API key is valid`);
    console.error(`   - Dataset exists in Honeycomb`);
    console.error(`   - Network connectivity`);
    process.exit(1);
  } else {
    console.log(`\n✨ All events sent successfully!`);
  }
}

main().catch((e) => {
  console.error(`Fatal error: ${e.message}`);
  process.exit(1);
});
