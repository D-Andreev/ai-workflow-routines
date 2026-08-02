import test from 'node:test';
import assert from 'node:assert';
import { validatePhase, validateStatus, validateVerdict, validateDisposition, validateCategory, validateOutcome } from '../lib/validators';

test('validators - validatePhase', () => {
  assert.doesNotThrow(() => validatePhase('clarify'));
  assert.doesNotThrow(() => validatePhase('implement'));
  assert.doesNotThrow(() => validatePhase('review'));
  assert.doesNotThrow(() => validatePhase('close'));
  assert.throws(() => validatePhase('invalid' as any), /Invalid phase/);
});

test('validators - validateStatus', () => {
  assert.doesNotThrow(() => validateStatus('awaiting_human'));
  assert.doesNotThrow(() => validateStatus('ai_running'));
  assert.doesNotThrow(() => validateStatus('done'));
  assert.throws(() => validateStatus('pending' as any), /Invalid status/);
});

test('validators - validateVerdict', () => {
  assert.doesNotThrow(() => validateVerdict('APPROVE'));
  assert.doesNotThrow(() => validateVerdict('APPROVE WITH NOTES'));
  assert.doesNotThrow(() => validateVerdict('REQUEST CHANGES'));
  assert.throws(() => validateVerdict('REJECT' as any), /Invalid verdict/);
});

test('validators - validateDisposition', () => {
  assert.doesNotThrow(() => validateDisposition('addressed'));
  assert.doesNotThrow(() => validateDisposition('partial'));
  assert.doesNotThrow(() => validateDisposition('ignored'));
  assert.doesNotThrow(() => validateDisposition('unknown'));
  assert.throws(() => validateDisposition('fixed' as any), /Invalid disposition/);
});

test('validators - validateCategory', () => {
  assert.doesNotThrow(() => validateCategory('scope'));
  assert.doesNotThrow(() => validateCategory('edge_case'));
  assert.doesNotThrow(() => validateCategory('security'));
  assert.throws(() => validateCategory('unknown_cat' as any), /Invalid category/);
});

test('validators - validateOutcome', () => {
  assert.doesNotThrow(() => validateOutcome('accepted_recommendation'));
  assert.doesNotThrow(() => validateOutcome('skipped'));
  assert.throws(() => validateOutcome('maybe' as any), /Invalid outcome/);
});
