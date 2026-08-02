import { execSync, ExecSyncOptions } from 'child_process';

export interface PRInfo {
  number: number;
  url: string;
  headRefName?: string;
  baseRefName?: string;
  headRefOid?: string;
}

function runGh(cmd: string, options: ExecSyncOptions = {}): string {
  try {
    const result = execSync(`gh ${cmd}`, { encoding: 'utf-8', ...options }) as string;
    return result.trim();
  } catch (e) {
    const error = e as Error;
    throw new Error(`gh command failed: ${cmd}\n${error.message}`);
  }
}

export function createPR(headBranch: string, baseBranch: string, title: string, body: string = ''): { prNumber: number; prUrl: string } {
  const bodyArg = body ? `--body "${body.replace(/"/g, '\\"')}"` : '--body ""';
  const result = runGh(`pr create --draft --head ${headBranch} --base ${baseBranch} --title "${title.replace(/"/g, '\\"')}" ${bodyArg} --json number,url`);
  const parsed = JSON.parse(result) as { number: number; url: string };
  return { prNumber: parsed.number, prUrl: parsed.url };
}

export function getPR(prNumber: number): PRInfo {
  const result = runGh(`pr view ${prNumber} --json number,url,headRefName,baseRefName`);
  return JSON.parse(result) as PRInfo;
}

export function getPRByHeadBranch(headBranch: string): PRInfo | null {
  const result = runGh(`pr list --head ${headBranch} --state merged --json number,url,headRefOid`);
  const prs = JSON.parse(result) as PRInfo[];
  if (prs.length === 0) return null;
  return prs[0];
}

export function commentPR(prNumber: number, body: string): void {
  runGh(`pr comment ${prNumber} --body "${body.replace(/"/g, '\\"')}"`);
}

export function mergePR(prNumber: number): void {
  runGh(`pr merge ${prNumber} --merge`);
}

export function readyForReview(prNumber: number): void {
  runGh(`pr ready ${prNumber}`);
}

export { runGh };
