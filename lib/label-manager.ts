export const WORKFLOW_LABELS = ['workflow:start', 'workflow:clarify', 'workflow:implement', 'workflow:review', 'workflow:human-review', 'workflow:done'] as const;
export type WorkflowLabel = typeof WORKFLOW_LABELS[number];

const TRANSITIONS: Record<string, WorkflowLabel> = {
  'workflow:start': 'workflow:clarify',
  'workflow:clarify': 'workflow:implement',
  'workflow:implement': 'workflow:review',
  'workflow:review': 'workflow:human-review',
  'workflow:human-review': 'workflow:done'
};

export function getWorkflowLabel(labels: string[]): WorkflowLabel | null {
  const found = labels.filter((l): l is WorkflowLabel => WORKFLOW_LABELS.includes(l as WorkflowLabel));
  if (found.length > 1) throw new Error(`Multiple workflow labels found: ${found.join(', ')}`);
  return found[0] || null;
}

export function validateWorkflowLabel(label: unknown): asserts label is WorkflowLabel | null {
  if (label && !WORKFLOW_LABELS.includes(label as WorkflowLabel)) {
    throw new Error(`Invalid workflow label: ${label}`);
  }
}

export function getNextLabel(currentLabel: WorkflowLabel | null): WorkflowLabel {
  if (!currentLabel) return 'workflow:clarify';
  const nextLabel = TRANSITIONS[currentLabel];
  if (!nextLabel) throw new Error(`No next label from ${currentLabel}`);
  return nextLabel;
}

export function getLabelSwap(currentLabel: WorkflowLabel | null): { remove: WorkflowLabel | null; add: WorkflowLabel } {
  const nextLabel = getNextLabel(currentLabel);
  return {
    remove: currentLabel,
    add: nextLabel
  };
}
