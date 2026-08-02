// Label state machine and transitions
const WORKFLOW_LABELS = ['workflow:start', 'workflow:clarify', 'workflow:implement', 'workflow:review', 'workflow:human-review', 'workflow:done'];

const TRANSITIONS = {
  'workflow:start': 'workflow:clarify',
  'workflow:clarify': 'workflow:implement',
  'workflow:implement': 'workflow:review',
  'workflow:review': 'workflow:human-review',
  'workflow:human-review': 'workflow:done'
};

function getWorkflowLabel(labels) {
  const found = labels.filter(l => WORKFLOW_LABELS.includes(l));
  if (found.length > 1) throw new Error(`Multiple workflow labels found: ${found.join(', ')}`);
  return found[0] || null;
}

function validateWorkflowLabel(label) {
  if (label && !WORKFLOW_LABELS.includes(label)) {
    throw new Error(`Invalid workflow label: ${label}`);
  }
}

function getNextLabel(currentLabel) {
  if (!currentLabel) return 'workflow:clarify'; // First step from workflow:start or no label
  if (!TRANSITIONS[currentLabel]) throw new Error(`No next label from ${currentLabel}`);
  return TRANSITIONS[currentLabel];
}

function getLabelSwap(currentLabel) {
  // Returns { remove, add } for GitHub label operations
  const nextLabel = getNextLabel(currentLabel);
  return {
    remove: currentLabel,
    add: nextLabel
  };
}

module.exports = { getWorkflowLabel, validateWorkflowLabel, getNextLabel, getLabelSwap, WORKFLOW_LABELS };
