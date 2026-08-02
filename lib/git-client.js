const { execSync } = require('child_process');

function runGit(cmd, options = {}) {
  try {
    const result = execSync(cmd, { encoding: 'utf-8', ...options });
    return result.trim();
  } catch (e) {
    throw new Error(`git command failed: ${cmd}\n${e.message}`);
  }
}

function fetchBranch(branch) {
  runGit(`git fetch origin ${branch}`);
}

function fetchShas(...shas) {
  runGit(`git fetch origin ${shas.join(' ')}`);
}

function show(path, branch) {
  return runGit(`git show origin/${branch}:${path}`);
}

function getDiff(fromSha, toSha) {
  return runGit(`git diff ${fromSha}...${toSha}`);
}

function getDiffNameOnly(fromSha, toSha) {
  return runGit(`git diff --name-only ${fromSha}...${toSha}`);
}

function revParse(ref = 'HEAD') {
  return runGit(`git rev-parse ${ref}`);
}

function commit(files, message) {
  if (!Array.isArray(files)) files = [files];
  files.forEach(f => runGit(`git add ${f}`));
  runGit(`git commit -m "${message.replace(/"/g, '\\"')}"`);
}

function push(branch) {
  runGit(`git push -u origin ${branch}`);
}

function getCurrentBranch() {
  return runGit('git rev-parse --abbrev-ref HEAD');
}

function branchExists(branch) {
  try {
    runGit(`git rev-parse --verify origin/${branch}`);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  fetchBranch, fetchShas, show, getDiff, getDiffNameOnly, revParse,
  commit, push, getCurrentBranch, branchExists, runGit
};
