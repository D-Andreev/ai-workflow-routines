#!/usr/bin/env node
/**
 * Append metrics event: clarify_turn, review_completed, or close_completed
 * Usage: node dist/bin/append-metric.js --file metrics.jsonl --q-index 1 --issue 42 --category scope --outcome accepted_recommendation --question "..."
 */

import minimist from 'minimist';
import { appendClarifyTurn, appendReviewCompleted, appendCloseCompleted } from '../lib/metrics-logger';
import { QuestionCategory, RecommendationOutcome, Verdict } from '../lib/validators';

const args = minimist(process.argv.slice(2));

try {
  const file = args.file as string;
  if (!file) throw new Error('--file required');

  if (args['q-index'] !== undefined) {
    // Clarify turn
    appendClarifyTurn(file, {
      qIndex: parseInt(args['q-index']),
      issueNumber: parseInt(args.issue),
      category: args.category as QuestionCategory,
      outcome: args.outcome as RecommendationOutcome,
      question: args.question as string,
      sessionId: args['session-id'] || null
    });
    console.log(`✅ Appended clarify_turn Q${args['q-index']}`);
  } else if (args.verdict) {
    // Review completed
    appendReviewCompleted(file, {
      issueNumber: parseInt(args.issue),
      verdict: args.verdict as Verdict,
      criticalCount: parseInt(args['critical-count'] || 0),
      minorCount: parseInt(args['minor-count'] || 0),
      notesCount: parseInt(args['notes-count'] || 0),
      sessionId: args['session-id'] || null
    });
    console.log(`✅ Appended review_completed: ${args.verdict}`);
  } else if (args.method) {
    // Close completed
    appendCloseCompleted(file, {
      issueNumber: parseInt(args.issue),
      method: args.method as 'llm' | 'path_heuristic',
      suggestionsApplicable: args['suggestions-applicable'] !== 'false',
      findingsData: {
        dispositions: [],
        critical_total: 0,
        critical_addressed: 0,
        minor_total: 0,
        minor_addressed: 0,
        notes_total: 0,
        notes_addressed: 0,
        commits_since_review: 0
      },
      sessionId: args['session-id'] || null
    });
    console.log(`✅ Appended close_completed: ${args.method}`);
  } else {
    throw new Error('Must specify --q-index (clarify) or --verdict (review) or --method (close)');
  }
} catch (e) {
  const error = e as Error;
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
