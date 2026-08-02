#!/usr/bin/env node
/**
 * Initialize clarify handoff: create state.json, task.md, requirements.md, language.md, metrics.jsonl
 * Usage: node dist/bin/clarify-init.js "workflow/state/issues/42" "42" "Issue title"
 */

import { createInitialHandoff } from '../lib/handoff-schema';

const issueDir = process.argv[2];
const issueNumber = parseInt(process.argv[3]);
const issueTitle = process.argv[4] || 'Untitled';

if (!issueDir || !issueNumber) {
  console.error('Usage: node bin/clarify-init.js <issue-dir> <issue-number> <issue-title>');
  process.exit(1);
}

try {
  createInitialHandoff(issueDir, issueNumber, issueTitle);
  console.log(`✅ Initialized ${issueDir}`);
} catch (e) {
  const error = e as Error;
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
