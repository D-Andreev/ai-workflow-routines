#!/usr/bin/env node
/**
 * Finalize state.json: update phase, status, requirements_approved, etc.
 * Usage: node bin/finalize-state.js --file workflow/state/issues/42/state.json --requirements-approved true --status done
 */

const fs = require('fs');
const { updateState, validatePhase, validateStatus } = require('../lib/state-manager');
const { validateStateJson } = require('../lib/handoff-schema');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

try {
  const file = args.file;
  if (!file) throw new Error('--file required');

  // Read current state
  const state = JSON.parse(fs.readFileSync(file, 'utf-8'));
  validateStateJson(state);

  // Build updates
  const updates = {};
  if (args.phase) updates.phase = args.phase;
  if (args.status) updates.status = args.status;
  if (args['requirements-approved'] !== undefined) {
    updates.requirements_approved = args['requirements-approved'] === 'true';
  }

  // Update and validate transitions
  const newState = updateState(state, updates);
  validateStateJson(newState);

  // Write back
  fs.writeFileSync(file, JSON.stringify(newState, null, 2));
  console.log(`✅ Updated ${file}`);
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
