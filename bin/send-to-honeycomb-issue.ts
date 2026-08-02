#!/usr/bin/env node
/**
 * Send metrics for a single issue to Honeycomb (called from close phase)
 * Usage: node dist/bin/send-to-honeycomb-issue.js --issue 42 --honeycomb-key KEY --dataset workflow-metrics
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import minimist from 'minimist';

interface HoneycombEvent {
  [key: string]: unknown;
}

class HoneycombClient {
  apiKey: string;
  dataset: string;
  sent: number = 0;
  failed: number = 0;

  constructor(apiKey: string, dataset: string) {
    this.apiKey = apiKey;
    this.dataset = dataset;
  }

  sendEvent(event: HoneycombEvent): Promise<boolean> {
    return new Promise((resolve) => {
      const data = JSON.stringify(event);
      const options = {
        hostname: 'api.honeycomb.io',
        port: 443,
        path: `/1/events/${this.dataset}`,
        method: 'POST' as const,
        headers: {
          'X-Honeycomb-Team': this.apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
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
        res.on('data', () => {});
      });

      req.on('error', (e) => {
        console.error(`❌ Error: ${e.message}`);
        this.failed++;
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        this.failed++;
        resolve(false);
      });

      req.write(data);
      req.end();
    });
  }

  async sendBatch(events: HoneycombEvent[]): Promise<number> {
    let success = 0;
    for (const event of events) {
      if (await this.sendEvent(event)) success++;
    }
    return success;
  }
}

function loadIssueMetrics(issueNumber: number): HoneycombEvent[] {
  const metricsFile = path.join('workflow/state', `issues/${issueNumber}`, 'metrics.jsonl');
  const gradesFile = path.join('workflow/state', `issues/${issueNumber}`, 'findings-grade.json');
  const stateFile = path.join('workflow/state', `issues/${issueNumber}`, 'state.json');

  const data: HoneycombEvent[] = [];

  // Load metrics.jsonl
  if (fs.existsSync(metricsFile)) {
    const lines = fs.readFileSync(metricsFile, 'utf-8').split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        data.push(JSON.parse(line) as HoneycombEvent);
      } catch (e) {
        const error = e as Error;
        console.error(`⚠️  Invalid JSON in ${metricsFile}: ${error.message}`);
      }
    }
  }

  // Load findings-grade.json
  if (fs.existsSync(gradesFile)) {
    try {
      const grade = JSON.parse(fs.readFileSync(gradesFile, 'utf-8')) as HoneycombEvent;
      grade._type = 'findings_grade';
      data.push(grade);
    } catch (e) {
      const error = e as Error;
      console.error(`⚠️  Invalid JSON in ${gradesFile}: ${error.message}`);
    }
  }

  // Load state.json
  if (fs.existsSync(stateFile)) {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8')) as HoneycombEvent;
      state._type = 'state';
      state._ts = new Date().toISOString();
      data.push(state);
    } catch (e) {
      const error = e as Error;
      console.error(`⚠️  Invalid JSON in ${stateFile}: ${error.message}`);
    }
  }

  return data;
}

function enrichEvents(events: HoneycombEvent[], repo: string | null): HoneycombEvent[] {
  return events.map((event) => {
    // Add derived fields for Honeycomb
    if (event.event === 'close_completed') {
      const dispositions = event.dispositions as any[] | undefined || [];
      const total = dispositions.length;
      if (total > 0) {
        const addressed = dispositions.filter(d => d.disposition === 'addressed').length;
        event.human_addressed_pct = Math.round((addressed / total) * 100 * 10) / 10;
      } else {
        event.human_addressed_pct = 0;
      }
    }

    if (event.event === 'review_completed') {
      const total = (event.critical_count as number | undefined || 0) + (event.minor_count as number | undefined || 0) + (event.notes_count as number | undefined || 0);
      event.findings_total = total;
    }

    if (repo) {
      event.repository = repo;
    }

    return event;
  });
}

async function main(): Promise<void> {
  const args = minimist(process.argv.slice(2));

  const issueNumber = parseInt(args.issue as string);
  const honeycombKey = args['honeycomb-key'] as string;
  const dataset = (args.dataset as string) || 'workflow-metrics';
  const repo = (args.repo as string) || null;

  if (!issueNumber || !honeycombKey) {
    console.error('Usage: node dist/bin/send-to-honeycomb-issue.js --issue N --honeycomb-key KEY [--dataset NAME] [--repo NAME]');
    process.exit(1);
  }

  console.log(`📊 Loading metrics for issue #${issueNumber}...`);
  const data = loadIssueMetrics(issueNumber);

  if (data.length === 0) {
    console.log('ℹ️  No metrics found to send');
    process.exit(0);
  }

  console.log(`✅ Loaded ${data.length} events`);
  console.log(`🔧 Enriching events...`);

  const enriched = enrichEvents(data, repo);

  console.log(`📤 Sending to Honeycomb...`);
  console.log(`   Dataset: ${dataset}`);

  const client = new HoneycombClient(honeycombKey, dataset);
  const success = await client.sendBatch(enriched);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📈 Results:`);
  console.log(`   Sent:   ${client.sent}`);
  console.log(`   Failed: ${client.failed}`);

  if (client.failed > 0) {
    console.error(`\n⚠️  Some events failed. Check:`);
    console.error(`   - API key is valid`);
    console.error(`   - Dataset exists in Honeycomb`);
    console.error(`   - Network connectivity`);
    process.exit(1);
  } else {
    console.log(`\n✨ All metrics sent successfully!`);
  }
}

if (require.main === module) {
  main().catch((e) => {
    const error = e as Error;
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}
