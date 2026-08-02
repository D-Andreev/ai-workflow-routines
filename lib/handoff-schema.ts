import * as fs from 'fs';
import * as path from 'path';
import { validatePhase, validateStatus, validateVerdict, validateDisposition, validateSeverity, Status, Phase, Verdict, Disposition, Severity } from './validators';

export interface WorkflowState {
  issue_number: number;
  status?: Status;
  phase?: Phase;
  created_at?: string;
  updated_at?: string;
  requirements_approved?: boolean;
  base_branch: string;
  work_branch?: string;
  pr_number?: number;
  review_verdict?: Verdict;
  review_head_sha?: string;
  workflow_label?: string;
}

export interface ReviewFinding {
  id: string;
  severity: Severity;
  summary: string;
  paths: string[];
  required: boolean;
}

export interface ReviewFindingsJson {
  schema_version: number;
  issue_number: number;
  pr_number?: number | null;
  review_head_sha: string;
  verdict: Verdict;
  created_at: string;
  findings: ReviewFinding[];
}

export interface FindingsGradeJson {
  schema_version: number;
  issue_number: number;
  method: 'llm' | 'path_heuristic';
  suggestions_applicable: boolean;
  findings_total: number;
  findings_addressed: number;
  findings_partial: number;
  findings_ignored: number;
  findings_unknown: number;
  critical_total: number;
  critical_addressed: number;
  minor_total: number;
  minor_addressed: number;
  notes_total: number;
  notes_addressed: number;
  commits_since_review: number;
  dispositions: Array<{
    id: string;
    severity: Severity;
    summary: string;
    required: boolean;
    disposition: Disposition;
    paths_touched: number;
    paths_total: number;
    method: 'llm' | 'path_heuristic';
  }>;
}

export function validateStateJson(state: unknown): asserts state is WorkflowState {
  if (typeof state !== 'object' || state === null) throw new Error('State must be an object');
  const s = state as Record<string, unknown>;

  if (!Number.isInteger(s.issue_number) || (s.issue_number as number) < 1) throw new Error('state.issue_number must be positive integer');
  if (s.status && typeof s.status === 'string') validateStatus(s.status);
  if (s.phase && typeof s.phase === 'string') validatePhase(s.phase);
  if (s.requirements_approved !== undefined && typeof s.requirements_approved !== 'boolean') {
    throw new Error('state.requirements_approved must be boolean');
  }
  if (!s.base_branch || typeof s.base_branch !== 'string') throw new Error('state.base_branch required');
}

export function validateFinding(finding: unknown): asserts finding is ReviewFinding {
  if (typeof finding !== 'object' || finding === null) throw new Error('Finding must be an object');
  const f = finding as Record<string, unknown>;

  if (!f.id || typeof f.id !== 'string') throw new Error('finding.id required');
  if (!f.summary || typeof f.summary !== 'string') throw new Error('finding.summary required');
  if (!Array.isArray(f.paths)) throw new Error('finding.paths must be array');
  if (typeof f.required !== 'boolean') throw new Error('finding.required must be boolean');
  validateSeverity(f.severity);
}

export function validateReviewFindingsJson(findings: unknown): asserts findings is ReviewFindingsJson {
  if (typeof findings !== 'object' || findings === null) throw new Error('Findings must be an object');
  const f = findings as Record<string, unknown>;

  if (!Number.isInteger(f.issue_number) || (f.issue_number as number) < 1) throw new Error('issue_number required');
  if (!f.review_head_sha || typeof f.review_head_sha !== 'string') throw new Error('review_head_sha required');
  if (!f.verdict || typeof f.verdict !== 'string') throw new Error('verdict required');
  validateVerdict(f.verdict);
  if (!Array.isArray(f.findings)) throw new Error('findings.findings must be array');
  (f.findings as unknown[]).forEach(f => validateFinding(f));
}

export function validateFindingsGradeJson(grade: unknown): asserts grade is FindingsGradeJson {
  if (typeof grade !== 'object' || grade === null) throw new Error('Grade must be an object');
  const g = grade as Record<string, unknown>;

  if (!Number.isInteger(g.issue_number) || (g.issue_number as number) < 1) throw new Error('issue_number required');
  if (!['llm', 'path_heuristic'].includes(g.method as string)) throw new Error(`Invalid method: ${g.method}`);
  if (typeof g.suggestions_applicable !== 'boolean') throw new Error('suggestions_applicable must be boolean');
  if (!Array.isArray(g.dispositions)) throw new Error('dispositions must be array');

  (g.dispositions as unknown[]).forEach(d => {
    const disp = d as Record<string, unknown>;
    if (!disp.id || !disp.disposition || !disp.severity) throw new Error('disposition missing id, disposition, or severity');
    validateDisposition(disp.disposition);
    validateSeverity(disp.severity);
  });
}

export function createInitialState(issueNumber: number, baseBranch: string = 'main'): WorkflowState {
  return {
    issue_number: issueNumber,
    status: 'awaiting_human',
    phase: 'clarify',
    created_at: new Date().toISOString(),
    requirements_approved: false,
    base_branch: baseBranch
  };
}

export function createInitialHandoff(issueDir: string, issueNumber: number, issueTitle: string): void {
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
