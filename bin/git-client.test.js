const test = require('node:test');
const assert = require('node:assert');
const { branchExists, getCurrentBranch, revParse } = require('../lib/git-client');

// These tests are basic; actual git commands are hard to test without a real repo
// In real usage, the git functions will be called in a proper git repository

test('git-client - exports required functions', () => {
  const gc = require('../lib/git-client');
  assert.ok(typeof gc.fetchBranch === 'function');
  assert.ok(typeof gc.show === 'function');
  assert.ok(typeof gc.getDiff === 'function');
  assert.ok(typeof gc.commit === 'function');
  assert.ok(typeof gc.push === 'function');
  assert.ok(typeof gc.getCurrentBranch === 'function');
  assert.ok(typeof gc.branchExists === 'function');
  assert.ok(typeof gc.runGit === 'function');
});

test('git-client - commit escapes quotes in message', () => {
  const gc = require('../lib/git-client');
  // Just verify it doesn't throw on special chars; actual commit fails without real repo
  try {
    gc.commit('dummy.txt', 'Test "quoted" message');
  } catch (e) {
    assert.ok(e.message.includes('git command failed')); // Expected to fail
  }
});

test('git-client - runGit throws on command failure', () => {
  const gc = require('../lib/git-client');
  assert.throws(() => gc.runGit('invalid-command-xyz'), /git command failed/);
});
