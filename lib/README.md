# Deterministic Workflow Library

7 modules that codify deterministic logic for the workflow phases. Each module handles one core concern, with zero dependencies beyond Node.js built-ins.

## Modules

### 1. **validators.js**
Enum validation for all phase-specific values. Use to catch schema violations before they're committed.

```javascript
const { validateVerdict, validateDisposition } = require('./lib/validators');
validateVerdict('APPROVE'); // OK
validateDisposition('addressed'); // OK
validateDisposition('maybe'); // throws
```

### 2. **metrics-logger.js**
Validated, append-only metrics logging. Enforces schema and prevents duplicates.

```javascript
const { appendClarifyTurn, appendReviewCompleted, appendCloseCompleted } = require('./lib/metrics-logger');

// Append with validation—catches errors before they're written
appendClarifyTurn('issues/42/metrics.jsonl', {
  qIndex: 1,
  issueNumber: 42,
  category: 'scope',
  outcome: 'accepted_recommendation',
  question: 'Should this be in MVP?'
});
```

### 3. **handoff-schema.js**
Read/write/validate handoff files (state.json, findings.json, etc.). Auto-generate templates.

```javascript
const { createInitialHandoff, validateStateJson } = require('./lib/handoff-schema');

createInitialHandoff('issues/42', 42, 'Add dark mode');
// Creates: state.json, task.md, requirements.md, language.md, metrics.jsonl
```

### 4. **state-manager.js**
State machine for phase/status transitions. Prevents invalid moves.

```javascript
const { updateState, validateTransition } = require('./lib/state-manager');

validateTransition('clarify', 'implement'); // OK
validateTransition('clarify', 'review'); // throws

const newState = updateState(state, { status: 'done' });
```

### 5. **label-manager.js**
Deterministic label transitions: start → clarify → implement → review → human-review → done.

```javascript
const { getNextLabel, getLabelSwap } = require('./lib/label-manager');

getNextLabel('workflow:start'); // 'workflow:clarify'
getLabelSwap('workflow:clarify'); // { remove: 'workflow:clarify', add: 'workflow:implement' }
```

### 6. **git-client.js**
Thin wrapper around git commands. Read-only operations + deterministic commits.

```javascript
const { show, getDiff, commit, push } = require('./lib/git-client');

const projectMd = show('workflow/PROJECT.md', 'main');
const diff = getDiff(fromSha, toSha);
commit('state.json', 'Clarify Q1');
push('workflow/state');
```

### 7. **pr-linker.js**
Deterministic PR creation, lookup, and commenting via `gh`.

```javascript
const { createPR, commentPR, getPRByHeadBranch } = require('./lib/pr-linker');

const { prNumber, prUrl } = createPR('workflow/issue-42', 'main', 'Add dark mode');
commentPR(prNumber, 'AI review: APPROVE WITH NOTES');
```

## Usage in Skills

In any skill, replace AI-driven logic with these calls:

**Before:**
```markdown
AI reads state.json, decides if labels are OK, updates metrics ad-hoc
```

**After:**
```bash
# Skill calls deterministic code
node bin/ensure-label.js workflow:clarify workflow:implement
node bin/append-metric.js --file metrics.jsonl --q-index 1 --category scope --outcome accepted_recommendation --question "..."
git add issues/$N/metrics.jsonl state.json
git commit -m "Clarify Q1"
git push origin workflow/state
```

## Testing

```bash
npm test
```

All 50 tests pass. No external dependencies (no jest, no mocha, just Node's `test` module).

## Integration

Each module is independent. Use one, all, or a subset based on what you're codifying:

- **Early phase:** use label-manager, handoff-schema, metrics-logger
- **Mid phase:** add state-manager, git-client
- **Late phase:** add pr-linker
