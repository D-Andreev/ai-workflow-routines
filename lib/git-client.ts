import { execSync, ExecSyncOptions } from 'child_process';

function runGit(cmd: string, options: ExecSyncOptions = {}): string {
  try {
    const result = execSync(cmd, { encoding: 'utf-8', ...options }) as string;
    return result.trim();
  } catch (e) {
    const error = e as Error;
    throw new Error(`git command failed: ${cmd}\n${error.message}`);
  }
}

export function fetchBranch(branch: string): void {
  runGit(`git fetch origin ${branch}`);
}

export function fetchShas(...shas: string[]): void {
  runGit(`git fetch origin ${shas.join(' ')}`);
}

export function show(filepath: string, branch: string): string {
  return runGit(`git show origin/${branch}:${filepath}`);
}

export function getDiff(fromSha: string, toSha: string): string {
  return runGit(`git diff ${fromSha}...${toSha}`);
}

export function getDiffNameOnly(fromSha: string, toSha: string): string {
  return runGit(`git diff --name-only ${fromSha}...${toSha}`);
}

export function revParse(ref: string = 'HEAD'): string {
  return runGit(`git rev-parse ${ref}`);
}

export function commit(files: string | string[], message: string): void {
  const fileList = Array.isArray(files) ? files : [files];
  fileList.forEach(f => runGit(`git add ${f}`));
  runGit(`git commit -m "${message.replace(/"/g, '\\"')}"`);
}

export function push(branch: string): void {
  runGit(`git push -u origin ${branch}`);
}

export function getCurrentBranch(): string {
  return runGit('git rev-parse --abbrev-ref HEAD');
}

export function branchExists(branch: string): boolean {
  try {
    runGit(`git rev-parse --verify origin/${branch}`);
    return true;
  } catch {
    return false;
  }
}

export { runGit };
