import test from 'node:test';
import assert from 'node:assert';
import { getWorkflowLabel, validateWorkflowLabel, getNextLabel, getLabelSwap } from '../lib/label-manager';

test('label-manager - getWorkflowLabel', () => {
  assert.equal(getWorkflowLabel(['workflow:start', 'type:bug']), 'workflow:start');
  assert.equal(getWorkflowLabel(['type:bug', 'workflow:implement']), 'workflow:implement');
  assert.equal(getWorkflowLabel(['type:bug', 'priority:high']), null);

  assert.throws(() => getWorkflowLabel(['workflow:start', 'workflow:clarify']), /Multiple workflow labels/);
});

test('label-manager - validateWorkflowLabel', () => {
  assert.doesNotThrow(() => validateWorkflowLabel('workflow:start'));
  assert.doesNotThrow(() => validateWorkflowLabel('workflow:done'));
  assert.doesNotThrow(() => validateWorkflowLabel(null));

  assert.throws(() => validateWorkflowLabel('workflow:invalid' as any), /Invalid workflow label/);
});

test('label-manager - getNextLabel', () => {
  assert.equal(getNextLabel('workflow:start'), 'workflow:clarify');
  assert.equal(getNextLabel('workflow:clarify'), 'workflow:implement');
  assert.equal(getNextLabel('workflow:implement'), 'workflow:review');
  assert.equal(getNextLabel('workflow:review'), 'workflow:human-review');
  assert.equal(getNextLabel('workflow:human-review'), 'workflow:done');
  assert.equal(getNextLabel(null), 'workflow:clarify');
});

test('label-manager - getNextLabel rejects terminal', () => {
  assert.throws(() => getNextLabel('workflow:done'), /No next label/);
});

test('label-manager - getLabelSwap', () => {
  const swap = getLabelSwap('workflow:start');
  assert.equal(swap.remove, 'workflow:start');
  assert.equal(swap.add, 'workflow:clarify');

  const swap2 = getLabelSwap('workflow:clarify');
  assert.equal(swap2.remove, 'workflow:clarify');
  assert.equal(swap2.add, 'workflow:implement');
});
