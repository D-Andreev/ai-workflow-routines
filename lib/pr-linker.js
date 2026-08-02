const { execSync } = require('child_process');

function runGh(cmd, options = {}) {
  try {
    const result = execSync(`gh ${cmd}`, { encoding: 'utf-8', ...options });
    return result.trim();
  } catch (e) {
    throw new Error(`gh command failed: ${cmd}\n${e.message}`);
  }
}

function createPR(headBranch, baseBranch, title, body = '') {
  const bodyArg = body ? `--body "${body.replace(/"/g, '\\"')}"` : '--body ""';
  const result = runGh(`pr create --draft --head ${headBranch} --base ${baseBranch} --title "${title.replace(/"/g, '\\"')}" ${bodyArg} --json number,url`);
  const parsed = JSON.parse(result);
  return { prNumber: parsed.number, prUrl: parsed.url };
}

function getPR(prNumber) {
  const result = runGh(`pr view ${prNumber} --json number,url,headRefName,baseRefName`);
  return JSON.parse(result);
}

function getPRByHeadBranch(headBranch) {
  const result = runGh(`pr list --head ${headBranch} --state merged --json number,url,headRefOid`);
  const prs = JSON.parse(result);
  if (prs.length === 0) return null;
  return prs[0]; // Most recent merged PR
}

function commentPR(prNumber, body) {
  runGh(`pr comment ${prNumber} --body "${body.replace(/"/g, '\\"')}"`);
}

function mergePR(prNumber) {
  runGh(`pr merge ${prNumber} --merge`);
}

function readyForReview(prNumber) {
  runGh(`pr ready ${prNumber}`);
}

module.exports = { createPR, getPR, getPRByHeadBranch, commentPR, mergePR, readyForReview, runGh };
