#!/usr/bin/env node
/**
 * Validate review-findings.json structure
 * Usage: node bin/validate-findings.js --file workflow/state/issues/42/review-findings.json
 */

const fs = require('fs');
const { validateReviewFindingsJson } = require('../lib/handoff-schema');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

try {
  const file = args.file;
  if (!file) throw new Error('--file required');

  // Read and validate
  const findings = JSON.parse(fs.readFileSync(file, 'utf-8'));
  validateReviewFindingsJson(findings);

  console.log(`✅ ${file} is valid`);
  console.log(`   Verdict: ${findings.verdict}`);
  console.log(`   Findings: ${findings.findings.length}`);
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
