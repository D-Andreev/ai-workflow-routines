const fs = require('fs');
const path = require('path');
const { validatePhase, validateStatus, validateVerdict, validateDisposition, validateSeverity } = require('./validators');

function validateStateJson(state) {
  if (!Number.isInteger(state.issue_number) || state.issue_number < 1) throw new Error('state.issue_number must be positive integer');
  if (state.status) validateStatus(state.status);
  if (state.phase) validatePhase(state.phase);
  if (state.requirements_approved !== undefined && typeof state.requirements_approved !== 'boolean') {
    throw new Error('state.requirements_approved must be boolean');
  }
  if (!state.base_branch || typeof state.base_branch !== 'string') throw new Error('state.base_branch required');
}

function validateFinding(finding) {
  if (!finding.id || typeof finding.id !== 'string') throw new Error('finding.id required');
  if (!finding.summary || typeof finding.summary !== 'string') throw new Error('finding.summary required');
  if (!Array.isArray(finding.paths)) throw new Error('finding.paths must be array');
  if (typeof finding.required !== 'boolean') throw new Error('finding.required must be boolean');
  validateSeverity(finding.severity);
}

function validateReviewFindingsJson(findings) {
  if (!Number.isInteger(findings.issue_number) || findings.issue_number < 1) throw new Error('issue_number required');
  if (!findings.review_head_sha || typeof findings.review_head_sha !== 'string') throw new Error('review_head_sha required');
  if (!findings.verdict || typeof findings.verdict !== 'string') throw new Error('verdict required');
  validateVerdict(findings.verdict);
  if (!Array.isArray(findings.findings)) throw new Error('findings.findings must be array');
  findings.findings.forEach(f => validateFinding(f));
}

function validateFindingsGradeJson(grade) {
  if (!Number.isInteger(grade.issue_number) || grade.issue_number < 1) throw new Error('issue_number required');
  if (!['llm', 'path_heuristic'].includes(grade.method)) throw new Error(`Invalid method: ${grade.method}`);
  if (typeof grade.suggestions_applicable !== 'boolean') throw new Error('suggestions_applicable must be boolean');
  if (!Array.isArray(grade.dispositions)) throw new Error('dispositions must be array');

  grade.dispositions.forEach(d => {
    if (!d.id || !d.disposition || !d.severity) throw new Error('disposition missing id, disposition, or severity');
    validateDisposition(d.disposition);
    validateSeverity(d.severity);
  });
}

function createInitialState(issueNumber, baseBranch = 'main') {
  return {
    issue_number: issueNumber,
    status: 'awaiting_human',
    phase: 'clarify',
    created_at: new Date().toISOString(),
    requirements_approved: false,
    base_branch: baseBranch
  };
}

function createInitialHandoff(issueDir, issueNumber, issueTitle) {
  if (!fs.existsSync(issueDir)) {
    fs.mkdirSync(issueDir, { recursive: true });
  }

  const stateJson = createInitialState(issueNumber);
  fs.writeFileSync(path.join(issueDir, 'state.json'), JSON.stringify(stateJson, null, 2));

  const taskMd = `# Task: issue-${issueNumber}\n\n${issueTitle}\n\n(Populated during clarify)\n`;
  fs.writeFileSync(path.join(issueDir, 'task.md'), taskMd);

  const reqMd = `# Requirements: issue-${issueNumber}\n\n## Original ask\n(From task.md)\n\n## Clarifications\n| # | Question | Answer | Recommended |\n|---|----------|--------|-------------|\n\n## Acceptance criteria\n- [ ] (Pending clarification)\n\n## Approved by human\n- [ ] Pending\n`;
  fs.writeFileSync(path.join(issueDir, 'requirements.md'), reqMd);

  fs.writeFileSync(path.join(issueDir, 'language.md'), '# Domain language\n\n(Populated during clarify)\n');
  fs.writeFileSync(path.join(issueDir, 'metrics.jsonl'), '');
}

module.exports = {
  validateStateJson, validateFinding, validateReviewFindingsJson, validateFindingsGradeJson,
  createInitialState, createInitialHandoff
};
