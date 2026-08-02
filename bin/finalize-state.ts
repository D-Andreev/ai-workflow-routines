#!/usr/bin/env node
/**
 * Finalize state.json: update phase, status, requirements_approved, etc.
 * Usage: node dist/bin/finalize-state.js --file workflow/state/issues/42/state.json --requirements-approved true --status done
 */

import fs from 'fs';
import minimist from 'minimist';
import { updateState } from '../lib/state-manager';
import { validateStateJson, WorkflowState } from '../lib/handoff-schema';

const args = minimist(process.argv.slice(2));

try {
  const file = args.file as string;
  if (!file) throw new Error('--file required');

  // Read current state
  const state = JSON.parse(fs.readFileSync(file, 'utf-8')) as unknown;
  validateStateJson(state);

  // Build updates (flexible for different phases)
  const updates: Partial<WorkflowState> = {};
  if (args.phase) updates.phase = args.phase as any;
  if (args.status) updates.status = args.status as any;
  if (args['requirements-approved'] !== undefined) {
    updates.requirements_approved = args['requirements-approved'] === 'true';
  }
  if (args['work-branch']) updates.work_branch = args['work-branch'];
  if (args['pr-number']) updates.pr_number = parseInt(args['pr-number']);
  if (args['review-verdict']) updates.review_verdict = args['review-verdict'] as any;
  if (args['review-head-sha']) updates.review_head_sha = args['review-head-sha'];
  if (args['workflow-label']) updates.workflow_label = args['workflow-label'] as any;

  // Update and validate transitions
  const newState = updateState(state as WorkflowState, updates);
  validateStateJson(newState);

  // Write back
  fs.writeFileSync(file, JSON.stringify(newState, null, 2));
  console.log(`✅ Updated ${file}`);
} catch (e) {
  const error = e as Error;
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
