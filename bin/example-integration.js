#!/usr/bin/env node
/**
 * Example: How a skill would use the deterministic library
 * This shows the pattern for integrating code into workflow-clarify
 *
 * Usage: node bin/example-integration.js --issue 42 --phase clarify
 */

const fs = require('fs');
const path = require('path');
const { createInitialHandoff, validateStateJson } = require('../lib/handoff-schema');
const { appendClarifyTurn } = require('../lib/metrics-logger');
const { getNextLabel, getLabelSwap } = require('../lib/label-manager');
const { updateState } = require('../lib/state-manager');
const { commit, push, getCurrentBranch } = require('../lib/git-client');

const args = require('minimist')(process.argv.slice(2));

async function runClarifySetup() {
  const issueNumber = args.issue || 1;
  const baseDir = 'workflow/state';
  const issueDir = path.join(baseDir, `issues/${issueNumber}`);

  console.log(`🔧 Setting up clarify phase for issue #${issueNumber}`);

  // 1. Create initial handoff (deterministic)
  console.log('  → Creating handoff files...');
  createInitialHandoff(issueDir, issueNumber, 'Issue title (from GitHub)');

  // 2. Read and update state.json
  console.log('  → Updating state...');
  let stateFile = path.join(issueDir, 'state.json');
  let state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));

  // Validate and update
  state = updateState(state, {
    phase: 'clarify',
    status: 'awaiting_human'
  });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

  // 3. Commit to workflow/state
  console.log('  → Committing to workflow/state...');
  try {
    commit(
      [
        path.join(issueDir, 'state.json'),
        path.join(issueDir, 'task.md'),
        path.join(issueDir, 'requirements.md'),
        path.join(issueDir, 'language.md'),
        path.join(issueDir, 'metrics.jsonl')
      ],
      `Clarify: init issue-${issueNumber}`
    );
    push('workflow/state');
    console.log('  ✓ Pushed to workflow/state');
  } catch (e) {
    console.error('  ✗ Git push failed:', e.message);
    return;
  }

  // 4. Log first metric event
  console.log('  → Logging metrics...');
  try {
    // (AI would ask Q1 and user answers, then this would be called)
    // appendClarifyTurn(path.join(issueDir, 'metrics.jsonl'), {
    //   qIndex: 1,
    //   issueNumber,
    //   category: 'scope',
    //   outcome: 'accepted_recommendation',
    //   question: 'Should this be in MVP?'
    // });
    console.log('  ✓ Metrics ready to append');
  } catch (e) {
    console.error('  ✗ Metrics validation failed:', e.message);
  }

  // 5. Show label swap that should happen
  console.log('  → Label transition needed:');
  const swap = getLabelSwap('workflow:start');
  console.log(`    Remove: ${swap.remove}`);
  console.log(`    Add: ${swap.add}`);

  console.log('\n✅ Clarify setup complete (deterministic phase)');
  console.log('   AI now takes over: ask Q1 in session...');
}

async function recordClarifyTurn() {
  const issueNumber = args.issue || 1;
  const qIndex = parseInt(args['q-index'] || '1');
  const issueDir = path.join('workflow/state', `issues/${issueNumber}`);
  const metricsFile = path.join(issueDir, 'metrics.jsonl');

  console.log(`📝 Recording Q&A turn #${qIndex}`);

  try {
    // Deterministic: validate and append
    appendClarifyTurn(metricsFile, {
      qIndex,
      issueNumber,
      category: args.category || 'scope',
      outcome: args.outcome || 'accepted_recommendation',
      question: args.question || 'Sample question'
    });

    // Deterministic: commit
    commit([metricsFile], `Clarify Q${qIndex}`);
    push('workflow/state');

    console.log(`✅ Q${qIndex} recorded and pushed`);
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
  }
}

// Main
if (args.setup) {
  runClarifySetup().catch(console.error);
} else if (args.record) {
  recordClarifyTurn().catch(console.error);
} else {
  console.log(`
Usage:
  node bin/example-integration.js --issue 42 --setup
    Initialize clarify handoff

  node bin/example-integration.js --issue 42 --record --q-index 1 --category scope --outcome accepted_recommendation --question "..."
    Record Q&A turn
  `);
}
