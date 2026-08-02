#!/usr/bin/env node
/**
 * Validate findings-grade.json structure
 * Usage: node bin/validate-grade.js --file workflow/state/issues/42/findings-grade.json
 */

const fs = require('fs');
const { validateFindingsGradeJson } = require('../lib/handoff-schema');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

try {
  const file = args.file;
  if (!file) throw new Error('--file required');

  // Read and validate
  const grade = JSON.parse(fs.readFileSync(file, 'utf-8'));
  validateFindingsGradeJson(grade);

  console.log(`✅ ${file} is valid`);
  console.log(`   Method: ${grade.method}`);
  console.log(`   Dispositions: ${grade.dispositions.length}`);

  // Validate counts
  const addressed = grade.dispositions.filter(d => d.disposition === 'addressed').length;
  const partial = grade.dispositions.filter(d => d.disposition === 'partial').length;
  const ignored = grade.dispositions.filter(d => d.disposition === 'ignored').length;
  const unknown = grade.dispositions.filter(d => d.disposition === 'unknown').length;

  console.log(`   Addressed: ${addressed}, Partial: ${partial}, Ignored: ${ignored}, Unknown: ${unknown}`);
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
