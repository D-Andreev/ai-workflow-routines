// Enum validators for workflow phases, statuses, verdicts, dispositions

export const PHASES = ['clarify', 'implement', 'review', 'close'] as const;
export type Phase = typeof PHASES[number];

export const STATUSES = ['awaiting_human', 'ai_running', 'done'] as const;
export type Status = typeof STATUSES[number];

export const VERDICTS = ['APPROVE', 'APPROVE WITH NOTES', 'REQUEST CHANGES'] as const;
export type Verdict = typeof VERDICTS[number];

export const DISPOSITIONS = ['addressed', 'partial', 'ignored', 'unknown'] as const;
export type Disposition = typeof DISPOSITIONS[number];

export const SEVERITIES = ['critical', 'minor', 'note'] as const;
export type Severity = typeof SEVERITIES[number];

export const QUESTION_CATEGORIES = [
  'scope', 'behavior', 'edge_case', 'data_model', 'api_contract',
  'error_handling', 'security', 'performance', 'testing', 'ops',
  'domain_language', 'dependency'
] as const;
export type QuestionCategory = typeof QUESTION_CATEGORIES[number];

export const OUTCOMES = ['skipped', 'accepted_recommendation', 'accepted_with_adjustment', 'rejected_recommendation'] as const;
export type RecommendationOutcome = typeof OUTCOMES[number];

export function validatePhase(phase: unknown): asserts phase is Phase {
  if (!PHASES.includes(phase as Phase)) throw new Error(`Invalid phase: ${phase}`);
}

export function validateStatus(status: unknown): asserts status is Status {
  if (!STATUSES.includes(status as Status)) throw new Error(`Invalid status: ${status}`);
}

export function validateVerdict(verdict: unknown): asserts verdict is Verdict {
  if (!VERDICTS.includes(verdict as Verdict)) throw new Error(`Invalid verdict: ${verdict}`);
}

export function validateDisposition(disposition: unknown): asserts disposition is Disposition {
  if (!DISPOSITIONS.includes(disposition as Disposition)) throw new Error(`Invalid disposition: ${disposition}`);
}

export function validateSeverity(severity: unknown): asserts severity is Severity {
  if (!SEVERITIES.includes(severity as Severity)) throw new Error(`Invalid severity: ${severity}`);
}

export function validateCategory(category: unknown): asserts category is QuestionCategory {
  if (!QUESTION_CATEGORIES.includes(category as QuestionCategory)) throw new Error(`Invalid category: ${category}`);
}

export function validateOutcome(outcome: unknown): asserts outcome is RecommendationOutcome {
  if (!OUTCOMES.includes(outcome as RecommendationOutcome)) throw new Error(`Invalid outcome: ${outcome}`);
}
