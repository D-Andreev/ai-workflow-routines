import { validatePhase, validateStatus, Phase, Status } from './validators';

const TRANSITIONS: Record<Phase, Phase[]> = {
  clarify: ['implement'],
  implement: ['review'],
  review: ['close'],
  close: []
};

const STATUS_TRANSITIONS: Record<Status, Status[]> = {
  awaiting_human: ['ai_running', 'awaiting_human'],
  ai_running: ['done', 'ai_running'],
  done: []
};

export function validateTransition(fromPhase: unknown, toPhase: unknown): void {
  validatePhase(fromPhase);
  validatePhase(toPhase);
  if (!TRANSITIONS[fromPhase as Phase].includes(toPhase as Phase)) {
    throw new Error(`Invalid phase transition: ${fromPhase} → ${toPhase}`);
  }
}

export function validateStatusTransition(fromStatus: unknown, toStatus: unknown): void {
  validateStatus(fromStatus);
  validateStatus(toStatus);
  if (!STATUS_TRANSITIONS[fromStatus as Status].includes(toStatus as Status)) {
    throw new Error(`Invalid status transition: ${fromStatus} → ${toStatus}`);
  }
}

export function getNextPhase(currentPhase: unknown): Phase {
  validatePhase(currentPhase);
  const next = TRANSITIONS[currentPhase as Phase];
  if (next.length === 0) throw new Error(`No next phase from ${currentPhase}`);
  return next[0];
}

export function updateState<T extends { phase?: Phase; status?: Status }>(state: T, updates: Partial<T>): T & { updated_at: string } {
  const newState = { ...state, ...updates };

  if (updates.phase && state.phase && updates.phase !== state.phase) {
    validateTransition(state.phase, updates.phase);
  }

  if (updates.status && state.status && updates.status !== state.status) {
    validateStatusTransition(state.status, updates.status);
  }

  return {
    ...newState,
    updated_at: new Date().toISOString()
  };
}

export { TRANSITIONS };
