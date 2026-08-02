const test = require('node:test');
const assert = require('node:assert');
const { validateTransition, validateStatusTransition, getNextPhase, updateState } = require('../lib/state-manager');

test('state-manager - validateTransition', () => {
  assert.doesNotThrow(() => validateTransition('clarify', 'implement'));
  assert.doesNotThrow(() => validateTransition('implement', 'review'));
  assert.doesNotThrow(() => validateTransition('review', 'close'));

  assert.throws(() => validateTransition('clarify', 'review'), /Invalid phase/);
  assert.throws(() => validateTransition('implement', 'clarify'), /Invalid phase/);
  assert.throws(() => validateTransition('close', 'anything'), /Invalid phase/);
});

test('state-manager - validateStatusTransition', () => {
  assert.doesNotThrow(() => validateStatusTransition('awaiting_human', 'ai_running'));
  assert.doesNotThrow(() => validateStatusTransition('ai_running', 'done'));
  assert.doesNotThrow(() => validateStatusTransition('awaiting_human', 'awaiting_human')); // same state ok
  assert.doesNotThrow(() => validateStatusTransition('ai_running', 'ai_running'));

  assert.throws(() => validateStatusTransition('done', 'ai_running'), /Invalid status transition/);
  assert.throws(() => validateStatusTransition('ai_running', 'awaiting_human'), /Invalid status transition/);
});

test('state-manager - getNextPhase', () => {
  assert.equal(getNextPhase('clarify'), 'implement');
  assert.equal(getNextPhase('implement'), 'review');
  assert.equal(getNextPhase('review'), 'close');

  assert.throws(() => getNextPhase('close'), /No next phase/);
});

test('state-manager - updateState', () => {
  const state = {
    issue_number: 42,
    phase: 'clarify',
    status: 'awaiting_human'
  };

  const updated = updateState(state, {
    status: 'ai_running'
  });

  assert.equal(updated.status, 'ai_running');
  assert.equal(updated.issue_number, 42);
  assert.ok(updated.updated_at);
});

test('state-manager - updateState enforces phase transitions', () => {
  const state = { issue_number: 42, phase: 'clarify', status: 'done' };

  assert.doesNotThrow(() => updateState(state, { phase: 'implement' }));
  assert.throws(() => updateState(state, { phase: 'review' }), /Invalid phase transition/);
});

test('state-manager - updateState enforces status transitions', () => {
  const state = { issue_number: 42, status: 'done' };

  assert.throws(() => updateState(state, { status: 'awaiting_human' }), /Invalid status transition/);
});
