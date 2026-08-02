#!/usr/bin/env node
/**
 * Validate review-findings.json structure
 * Usage: node dist/bin/validate-findings.js --file workflow/state/issues/42/review-findings.json
 */

import fs from 'fs';
import minimist from 'minimist';
import { validateReviewFindingsJson, ReviewFindingsJson } from '../lib/handoff-schema';

const args = minimist(process.argv.slice(2));

try {
  const file = args.file as string;
  if (!file) throw new Error('--file required');

  // Read and validate
  const findings = JSON.parse(fs.readFileSync(file, 'utf-8')) as unknown;
  validateReviewFindingsJson(findings);

  const typedFindings = findings as ReviewFindingsJson;
  console.log(`✅ ${file} is valid`);
  console.log(`   Verdict: ${typedFindings.verdict}`);
  console.log(`   Findings: ${typedFindings.findings.length}`);
} catch (e) {
  const error = e as Error;
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
