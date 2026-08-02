// Enum validators for workflow phases, statuses, verdicts, dispositions

const PHASES = ['clarify', 'implement', 'review', 'close'];
const STATUSES = ['awaiting_human', 'ai_running', 'done'];
const VERDICTS = ['APPROVE', 'APPROVE WITH NOTES', 'REQUEST CHANGES'];
const DISPOSITIONS = ['addressed', 'partial', 'ignored', 'unknown'];
const SEVERITIES = ['critical', 'minor', 'note'];
const QUESTION_CATEGORIES = [
  'scope', 'behavior', 'edge_case', 'data_model', 'api_contract',
  'error_handling', 'security', 'performance', 'testing', 'ops',
  'domain_language', 'dependency'
];
const OUTCOMES = ['skipped', 'accepted_recommendation', 'accepted_with_adjustment', 'rejected_recommendation'];

function validatePhase(phase) {
  if (!PHASES.includes(phase)) throw new Error(`Invalid phase: ${phase}`);
}

function validateStatus(status) {
  if (!STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);
}

function validateVerdict(verdict) {
  if (!VERDICTS.includes(verdict)) throw new Error(`Invalid verdict: ${verdict}`);
}

function validateDisposition(disposition) {
  if (!DISPOSITIONS.includes(disposition)) throw new Error(`Invalid disposition: ${disposition}`);
}

function validateSeverity(severity) {
  if (!SEVERITIES.includes(severity)) throw new Error(`Invalid severity: ${severity}`);
}

function validateCategory(category) {
  if (!QUESTION_CATEGORIES.includes(category)) throw new Error(`Invalid category: ${category}`);
}

function validateOutcome(outcome) {
  if (!OUTCOMES.includes(outcome)) throw new Error(`Invalid outcome: ${outcome}`);
}

module.exports = {
  PHASES, STATUSES, VERDICTS, DISPOSITIONS, SEVERITIES, QUESTION_CATEGORIES, OUTCOMES,
  validatePhase, validateStatus, validateVerdict, validateDisposition, validateSeverity, validateCategory, validateOutcome
};
