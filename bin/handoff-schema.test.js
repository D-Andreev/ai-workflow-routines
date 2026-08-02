const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { validateStateJson, validateFinding, validateReviewFindingsJson, validateFindingsGradeJson, createInitialState, createInitialHandoff } = require('../lib/handoff-schema');

const testDir = path.join(__dirname, '..', '.test-temp');

function setup() {
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
}

test('handoff-schema - validateStateJson', () => {
  assert.doesNotThrow(() => validateStateJson({
    issue_number: 42,
    status: 'awaiting_human',
    phase: 'clarify',
    base_branch: 'main'
  }));

  assert.throws(() => validateStateJson({ issue_number: -1, base_branch: 'main' }), /positive integer/);
  assert.throws(() => validateStateJson({ issue_number: 42 }), /base_branch required/);
});

test('handoff-schema - validateFinding', () => {
  assert.doesNotThrow(() => validateFinding({
    id: 'F1',
    summary: 'Missing error handling',
    paths: ['src/api.js'],
    severity: 'critical',
    required: true
  }));

  assert.throws(() => validateFinding({ id: 'F1', summary: 'test', paths: [], required: true }), /severity/);
  assert.throws(() => validateFinding({ id: 'F1', summary: 'test', paths: ['src/'], severity: 'critical', required: 'yes' }), /boolean/);
});

test('handoff-schema - validateReviewFindingsJson', () => {
  assert.doesNotThrow(() => validateReviewFindingsJson({
    issue_number: 42,
    review_head_sha: 'abc123def456',
    verdict: 'APPROVE WITH NOTES',
    findings: []
  }));

  assert.throws(() => validateReviewFindingsJson({ issue_number: 42, review_head_sha: 'abc', verdict: 'MAYBE', findings: [] }), /Invalid verdict/);
  assert.throws(() => validateReviewFindingsJson({ issue_number: 42, findings: [] }), /review_head_sha required/);
});

test('handoff-schema - validateFindingsGradeJson', () => {
  assert.doesNotThrow(() => validateFindingsGradeJson({
    issue_number: 42,
    method: 'llm',
    suggestions_applicable: true,
    dispositions: []
  }));

  assert.throws(() => validateFindingsGradeJson({
    issue_number: 42, method: 'invalid', suggestions_applicable: true, dispositions: []
  }), /Invalid method/);
});

test('handoff-schema - createInitialState', () => {
  const state = createInitialState(42);
  assert.equal(state.issue_number, 42);
  assert.equal(state.status, 'awaiting_human');
  assert.equal(state.phase, 'clarify');
  assert.equal(state.requirements_approved, false);
  assert.equal(state.base_branch, 'main');
});

test('handoff-schema - createInitialHandoff', () => {
  setup();
  const issueDir = path.join(testDir, 'issue-42');
  if (fs.existsSync(issueDir)) fs.rmSync(issueDir, { recursive: true });

  createInitialHandoff(issueDir, 42, 'Add dark mode');

  assert.ok(fs.existsSync(path.join(issueDir, 'state.json')));
  assert.ok(fs.existsSync(path.join(issueDir, 'task.md')));
  assert.ok(fs.existsSync(path.join(issueDir, 'requirements.md')));
  assert.ok(fs.existsSync(path.join(issueDir, 'language.md')));
  assert.ok(fs.existsSync(path.join(issueDir, 'metrics.jsonl')));

  const state = JSON.parse(fs.readFileSync(path.join(issueDir, 'state.json'), 'utf-8'));
  assert.equal(state.issue_number, 42);
});

test('cleanup', () => {
  try { fs.rmSync(testDir, { recursive: true }); } catch {}
});
