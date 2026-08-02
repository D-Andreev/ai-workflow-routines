const test = require('node:test');
const assert = require('node:assert');
const { validatePhase, validateStatus, validateVerdict, validateDisposition, validateSeverity, validateCategory, validateOutcome } = require('../lib/validators');

test('validators - validatePhase', () => {
  assert.doesNotThrow(() => validatePhase('clarify'));
  assert.doesNotThrow(() => validatePhase('implement'));
  assert.doesNotThrow(() => validatePhase('review'));
  assert.doesNotThrow(() => validatePhase('close'));
  assert.throws(() => validatePhase('invalid'), /Invalid phase/);
});

test('validators - validateStatus', () => {
  assert.doesNotThrow(() => validateStatus('awaiting_human'));
  assert.doesNotThrow(() => validateStatus('ai_running'));
  assert.doesNotThrow(() => validateStatus('done'));
  assert.throws(() => validateStatus('pending'), /Invalid status/);
});

test('validators - validateVerdict', () => {
  assert.doesNotThrow(() => validateVerdict('APPROVE'));
  assert.doesNotThrow(() => validateVerdict('APPROVE WITH NOTES'));
  assert.doesNotThrow(() => validateVerdict('REQUEST CHANGES'));
  assert.throws(() => validateVerdict('REJECT'), /Invalid verdict/);
});

test('validators - validateDisposition', () => {
  assert.doesNotThrow(() => validateDisposition('addressed'));
  assert.doesNotThrow(() => validateDisposition('partial'));
  assert.doesNotThrow(() => validateDisposition('ignored'));
  assert.doesNotThrow(() => validateDisposition('unknown'));
  assert.throws(() => validateDisposition('fixed'), /Invalid disposition/);
});

test('validators - validateCategory', () => {
  assert.doesNotThrow(() => validateCategory('scope'));
  assert.doesNotThrow(() => validateCategory('edge_case'));
  assert.doesNotThrow(() => validateCategory('security'));
  assert.throws(() => validateCategory('unknown_cat'), /Invalid category/);
});

test('validators - validateOutcome', () => {
  assert.doesNotThrow(() => validateOutcome('skipped'));
  assert.doesNotThrow(() => validateOutcome('accepted_recommendation'));
  assert.throws(() => validateOutcome('pending'), /Invalid outcome/);
});
