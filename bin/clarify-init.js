#!/usr/bin/env node
/**
 * Initialize clarify handoff: create state.json, task.md, requirements.md, language.md, metrics.jsonl
 * Usage: node bin/clarify-init.js "workflow/state/issues/42" "42" "Issue title"
 */

const { createInitialHandoff } = require('../lib/handoff-schema');

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
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
