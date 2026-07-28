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

function loadData(stateRoot) {
  const data = [];
  const issuesDir = path.join(stateRoot, "issues");

  if (!fs.existsSync(issuesDir)) {
    return data;
  }

  const issues = fs.readdirSync(issuesDir);
  for (const issue of issues) {
    const issueDir = path.join(issuesDir, issue);

    // Load metrics.jsonl
    const metricsFile = path.join(issueDir, "metrics.jsonl");
    if (fs.existsSync(metricsFile)) {
      const lines = fs
        .readFileSync(metricsFile, "utf-8")
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        try {
          data.push(JSON.parse(line));
        } catch (e) {
          console.error(`⚠️  Invalid JSON in ${metricsFile}: ${e.message}`);
        }
      }
    }

    // Load findings-grade.json
    const gradesFile = path.join(issueDir, "findings-grade.json");
    if (fs.existsSync(gradesFile)) {
      try {
        const grade = JSON.parse(fs.readFileSync(gradesFile, "utf-8"));
        grade._type = "findings_grade";
        data.push(grade);
      } catch (e) {
        console.error(`⚠️  Invalid JSON in ${gradesFile}: ${e.message}`);
      }
    }

    // Load state.json
    const stateFile = path.join(issueDir, "state.json");
    if (fs.existsSync(stateFile)) {
      try {
        const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
        state._type = "state";
        state._ts = new Date().toISOString();
        data.push(state);
      } catch (e) {
        console.error(`⚠️  Invalid JSON in ${stateFile}: ${e.message}`);
      }
    }
  }

  return data;
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

function parseArgs(argv) {
  const opts = {
    apiKey: null,
    dataset: null,
    env: "us",
    repo: null,
    batchSize: 50,
    stateRoot: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--honeycomb-key") {
      opts.apiKey = next;
      i++;
    } else if (arg === "--dataset") {
      opts.dataset = next;
      i++;
    } else if (arg === "--env") {
      opts.env = next;
      i++;
    } else if (arg === "--repo") {
      opts.repo = next;
      i++;
    } else if (arg === "--batch-size") {
      opts.batchSize = parseInt(next);
      i++;
    } else if (!arg.startsWith("--")) {
      opts.stateRoot = arg;
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);

  if (!opts.apiKey || !opts.dataset || !opts.stateRoot) {
    console.error("Usage:");
    console.error(
      "  node send-to-honeycomb.js --honeycomb-key KEY --dataset DATASET [--repo NAME] /path/to/workflow/state"
    );
    process.exit(1);
  }

  if (!fs.existsSync(opts.stateRoot)) {
    console.error(`❌ Path not found: ${opts.stateRoot}`);
    process.exit(1);
  }

  console.log(`📊 Loading data from ${opts.stateRoot}...`);
  const data = loadData(opts.stateRoot);

  if (data.length === 0) {
    console.log("ℹ️  No data found");
    process.exit(0);
  }

  console.log(`✅ Loaded ${data.length} events`);
  console.log(`🔧 Enriching events...`);

  const enriched = enrichEvents(data, opts.repo);

  console.log(`📤 Sending to Honeycomb (${opts.env})...`);
  console.log(`   Dataset: ${opts.dataset}`);
  console.log(`   Batch size: ${opts.batchSize}`);

  const client = new HoneycombClient(opts.apiKey, opts.dataset, opts.env);

  for (let i = 0; i < enriched.length; i += opts.batchSize) {
    const batch = enriched.slice(i, i + opts.batchSize);
    process.stdout.write(
      `   Batch ${Math.floor(i / opts.batchSize) + 1}: `,
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

if (require.main === module) {
  main().catch((e) => {
    console.error(`Fatal error: ${e.message}`);
    process.exit(1);
  });
}

module.exports = { parseArgs, loadData, enrichEvents, HoneycombClient };
