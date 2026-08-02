const { validatePhase, validateStatus, PHASES, STATUSES } = require('./validators');

// Valid phase transitions
const TRANSITIONS = {
  clarify: ['implement'],
  implement: ['review'],
  review: ['close'],
  close: []
};

// Valid status transitions within a phase
const STATUS_TRANSITIONS = {
  awaiting_human: ['ai_running', 'awaiting_human'],
  ai_running: ['done', 'ai_running'],
  done: []
};

function validateTransition(fromPhase, toPhase) {
  validatePhase(fromPhase);
  validatePhase(toPhase);
  if (!TRANSITIONS[fromPhase].includes(toPhase)) {
    throw new Error(`Invalid phase transition: ${fromPhase} → ${toPhase}`);
  }
}

function validateStatusTransition(fromStatus, toStatus) {
  validateStatus(fromStatus);
  validateStatus(toStatus);
  if (!STATUS_TRANSITIONS[fromStatus].includes(toStatus)) {
    throw new Error(`Invalid status transition: ${fromStatus} → ${toStatus}`);
  }
}

function getNextPhase(currentPhase) {
  validatePhase(currentPhase);
  const next = TRANSITIONS[currentPhase];
  if (next.length === 0) throw new Error(`No next phase from ${currentPhase}`);
  return next[0];
}

function updateState(state, updates) {
  const newState = { ...state, ...updates };

  if (updates.phase) {
    if (state.phase && updates.phase !== state.phase) {
      validateTransition(state.phase, updates.phase);
    }
  }

  if (updates.status) {
    if (state.status && updates.status !== state.status) {
      validateStatusTransition(state.status, updates.status);
    }
  }

  newState.updated_at = new Date().toISOString();
  return newState;
}

module.exports = { validateTransition, validateStatusTransition, getNextPhase, updateState, TRANSITIONS };
