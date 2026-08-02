const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { appendClarifyTurn, appendReviewCompleted, appendCloseCompleted } = require('../lib/metrics-logger');

const testDir = path.join(__dirname, '..', '.test-temp');

function setup() {
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
}

function cleanup(file) {
  try { fs.unlinkSync(file); } catch {}
}

test('metrics-logger - appendClarifyTurn', () => {
  setup();
  const metricsFile = path.join(testDir, 'test-clarify.jsonl');
  cleanup(metricsFile);

  appendClarifyTurn(metricsFile, {
    qIndex: 1,
    issueNumber: 42,
    category: 'scope',
    outcome: 'accepted_recommendation',
    question: 'Should this be in MVP?'
  });

  const content = fs.readFileSync(metricsFile, 'utf-8');
  const event = JSON.parse(content.trim());

  assert.equal(event.q_index, 1);
  assert.equal(event.issue_number, 42);
  assert.equal(event.category, 'scope');
  assert.equal(event.phase, 'clarify');
  assert.equal(event.event, 'clarify_turn');
});

test('metrics-logger - appendClarifyTurn validates q_index', () => {
  setup();
  const metricsFile = path.join(testDir, 'test-clarify-bad.jsonl');
  cleanup(metricsFile);

  assert.throws(() => appendClarifyTurn(metricsFile, {
    qIndex: -1, issueNumber: 42, category: 'scope', outcome: 'skipped', question: 'test'
  }), /Invalid q_index/);

  assert.throws(() => appendClarifyTurn(metricsFile, {
    qIndex: 1.5, issueNumber: 42, category: 'scope', outcome: 'skipped', question: 'test'
  }), /Invalid q_index/);
});

test('metrics-logger - appendClarifyTurn validates category', () => {
  setup();
  const metricsFile = path.join(testDir, 'test-clarify-cat.jsonl');
  cleanup(metricsFile);

  assert.throws(() => appendClarifyTurn(metricsFile, {
    qIndex: 1, issueNumber: 42, category: 'invalid', outcome: 'skipped', question: 'test'
  }), /Invalid category/);
});

test('metrics-logger - appendReviewCompleted', () => {
  setup();
  const metricsFile = path.join(testDir, 'test-review.jsonl');
  cleanup(metricsFile);

  appendReviewCompleted(metricsFile, {
    issueNumber: 42,
    verdict: 'APPROVE WITH NOTES',
    criticalCount: 0,
    minorCount: 1,
    notesCount: 2
  });

  const content = fs.readFileSync(metricsFile, 'utf-8');
  const event = JSON.parse(content.trim());

  assert.equal(event.verdict, 'APPROVE WITH NOTES');
  assert.equal(event.critical_count, 0);
  assert.equal(event.minor_count, 1);
  assert.equal(event.notes_count, 2);
  assert.equal(event.phase, 'review');
});

test('metrics-logger - appendReviewCompleted validates verdict', () => {
  setup();
  const metricsFile = path.join(testDir, 'test-review-bad.jsonl');
  cleanup(metricsFile);

  assert.throws(() => appendReviewCompleted(metricsFile, {
    issueNumber: 42, verdict: 'MAYBE', criticalCount: 0, minorCount: 0, notesCount: 0
  }), /Invalid verdict/);
});

test('metrics-logger - appendCloseCompleted', () => {
  setup();
  const metricsFile = path.join(testDir, 'test-close.jsonl');
  cleanup(metricsFile);

  appendCloseCompleted(metricsFile, {
    issueNumber: 42,
    method: 'llm',
    suggestionsApplicable: true,
    findingsData: {
      dispositions: [
        { id: 'F1', disposition: 'addressed', severity: 'minor' },
        { id: 'F2', disposition: 'ignored', severity: 'critical' }
      ],
      critical_total: 1,
      critical_addressed: 0,
      minor_total: 1,
      minor_addressed: 1,
      notes_total: 0,
      notes_addressed: 0,
      commits_since_review: 2
    }
  });

  const content = fs.readFileSync(metricsFile, 'utf-8');
  const event = JSON.parse(content.trim());

  assert.equal(event.phase, 'close');
  assert.equal(event.method, 'llm');
  assert.equal(event.findings_addressed, 1);
  assert.equal(event.findings_ignored, 1);
});

test('cleanup', () => {
  try { fs.rmSync(testDir, { recursive: true }); } catch {}
});
