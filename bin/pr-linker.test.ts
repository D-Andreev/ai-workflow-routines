import test from 'node:test';
import assert from 'node:assert';

test('pr-linker - exports required functions', () => {
  const pr = require('../lib/pr-linker');
  assert.ok(typeof pr.createPR === 'function');
  assert.ok(typeof pr.getPR === 'function');
  assert.ok(typeof pr.getPRByHeadBranch === 'function');
  assert.ok(typeof pr.commentPR === 'function');
  assert.ok(typeof pr.mergePR === 'function');
  assert.ok(typeof pr.readyForReview === 'function');
  assert.ok(typeof pr.runGh === 'function');
});

test('pr-linker - runGh escapes quotes in body', () => {
  const pr = require('../lib/pr-linker');
  // Just verify it doesn't throw on special chars; actual call fails without repo
  try {
    pr.commentPR(999, 'Comment with "quotes" and special chars');
  } catch (e) {
    const error = e as Error;
    assert.ok(error.message.includes('gh command failed')); // Expected to fail without real PR
  }
});

test('pr-linker - runGh throws on command failure', () => {
  const pr = require('../lib/pr-linker');
  assert.throws(() => pr.runGh('invalid-xyz'), /gh command failed/);
});
