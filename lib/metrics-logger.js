const fs = require('fs');
const { validatePhase, validateCategory, validateOutcome, validateDisposition, validateSeverity, validateVerdict } = require('./validators');

function appendClarifyTurn(metricsFile, { qIndex, issueNumber, category, outcome, question, sessionId }) {
  if (!Number.isInteger(qIndex) || qIndex < 1) throw new Error(`Invalid q_index: ${qIndex}`);
  if (!Number.isInteger(issueNumber) || issueNumber < 1) throw new Error(`Invalid issue_number: ${issueNumber}`);
  if (!question || typeof question !== 'string') throw new Error('Missing question text');

  validateCategory(category);
  validateOutcome(outcome);

  const event = {
    schema_version: 1,
    ts: new Date().toISOString(),
    issue_number: issueNumber,
    phase: 'clarify',
    event: 'clarify_turn',
    session_id: sessionId || null,
    q_index: qIndex,
    category,
    recommendation_outcome: outcome,
    question
  };

  const line = JSON.stringify(event);
  if (line.includes('\n')) throw new Error('Event must be single line');

  fs.appendFileSync(metricsFile, line + '\n');
}

function appendReviewCompleted(metricsFile, { issueNumber, verdict, criticalCount, minorCount, notesCount, sessionId }) {
  if (!Number.isInteger(issueNumber) || issueNumber < 1) throw new Error(`Invalid issue_number: ${issueNumber}`);
  if (typeof criticalCount !== 'number' || criticalCount < 0) throw new Error('criticalCount must be >= 0');
  if (typeof minorCount !== 'number' || minorCount < 0) throw new Error('minorCount must be >= 0');
  if (typeof notesCount !== 'number' || notesCount < 0) throw new Error('notesCount must be >= 0');

  validateVerdict(verdict);

  const event = {
    schema_version: 1,
    ts: new Date().toISOString(),
    issue_number: issueNumber,
    phase: 'review',
    event: 'review_completed',
    session_id: sessionId || null,
    verdict,
    critical_count: criticalCount,
    minor_count: minorCount,
    notes_count: notesCount
  };

  const line = JSON.stringify(event);
  if (line.includes('\n')) throw new Error('Event must be single line');

  fs.appendFileSync(metricsFile, line + '\n');
}

function appendCloseCompleted(metricsFile, { issueNumber, method, suggestionsApplicable, findingsData, sessionId }) {
  if (!Number.isInteger(issueNumber) || issueNumber < 1) throw new Error(`Invalid issue_number: ${issueNumber}`);
  if (!['llm', 'path_heuristic'].includes(method)) throw new Error(`Invalid method: ${method}`);
  if (typeof suggestionsApplicable !== 'boolean') throw new Error('suggestionsApplicable must be boolean');

  const dispositions = findingsData.dispositions || [];
  const addressed = dispositions.filter(d => d.disposition === 'addressed' || d.disposition === 'partial').length;
  const partial = dispositions.filter(d => d.disposition === 'partial').length;
  const ignored = dispositions.filter(d => d.disposition === 'ignored').length;
  const unknown = dispositions.filter(d => d.disposition === 'unknown').length;

  const event = {
    schema_version: 1,
    ts: new Date().toISOString(),
    issue_number: issueNumber,
    phase: 'close',
    event: 'close_completed',
    session_id: sessionId || null,
    method,
    suggestions_applicable: suggestionsApplicable,
    findings_total: dispositions.length,
    findings_addressed: addressed,
    findings_partial: partial,
    findings_ignored: ignored,
    findings_unknown: unknown,
    critical_total: findingsData.critical_total || 0,
    critical_addressed: findingsData.critical_addressed || 0,
    minor_total: findingsData.minor_total || 0,
    minor_addressed: findingsData.minor_addressed || 0,
    notes_total: findingsData.notes_total || 0,
    notes_addressed: findingsData.notes_addressed || 0,
    commits_since_review: findingsData.commits_since_review || 0,
    dispositions
  };

  const line = JSON.stringify(event);
  if (line.includes('\n')) throw new Error('Event must be single line');

  fs.appendFileSync(metricsFile, line + '\n');
}

module.exports = { appendClarifyTurn, appendReviewCompleted, appendCloseCompleted };
