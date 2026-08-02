#!/usr/bin/env node
/**
 * Validate findings-grade.json structure
 * Usage: node dist/bin/validate-grade.js --file workflow/state/issues/42/findings-grade.json
 */

import fs from 'fs';
import minimist from 'minimist';
import { validateFindingsGradeJson, FindingsGradeJson } from '../lib/handoff-schema';

const args = minimist(process.argv.slice(2));

try {
  const file = args.file as string;
  if (!file) throw new Error('--file required');

  // Read and validate
  const grade = JSON.parse(fs.readFileSync(file, 'utf-8')) as unknown;
  validateFindingsGradeJson(grade);

  const typedGrade = grade as FindingsGradeJson;
  console.log(`✅ ${file} is valid`);
  console.log(`   Method: ${typedGrade.method}`);
  console.log(`   Dispositions: ${typedGrade.dispositions.length}`);

  // Validate counts
  const addressed = typedGrade.dispositions.filter(d => d.disposition === 'addressed').length;
  const partial = typedGrade.dispositions.filter(d => d.disposition === 'partial').length;
  const ignored = typedGrade.dispositions.filter(d => d.disposition === 'ignored').length;
  const unknown = typedGrade.dispositions.filter(d => d.disposition === 'unknown').length;

  console.log(`   Addressed: ${addressed}, Partial: ${partial}, Ignored: ${ignored}, Unknown: ${unknown}`);
} catch (e) {
  const error = e as Error;
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
