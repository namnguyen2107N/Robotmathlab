import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ScoringEngine = require('../../js/scoring.js');

test('returns 0 score when task is not finished successfully', () => {
  const engine = new ScoringEngine();
  const result = engine.calculateScore({ finalSuccess: false, totalTimeSeconds: 120 });
  assert.equal(result.totalScore, 0);
  assert.equal(result.stars, 0);
});

test('awards full 1000 score for fast, first-attempt, independent solution', () => {
  const engine = new ScoringEngine();
  const result = engine.calculateScore({
    taskId: 'task1-reach', // target 45s
    finalSuccess: true,
    totalTimeSeconds: 30, // <= 45s -> full 300 time bonus
    totalAttempts: 1,     // 1 attempt -> full 150 accuracy bonus
    backwardStepsCount: 0,
    hintsCount: 0         // full 50 self-reliance bonus
  });

  assert.equal(result.completionScore, 500);
  assert.equal(result.timeBonus, 300);
  assert.equal(result.accuracyBonus, 150);
  assert.equal(result.selfRelianceBonus, 50);
  assert.equal(result.totalScore, 1000);
  assert.equal(result.stars, 3);
});

test('calculates duration score based on target benchmark time for Task 1 and Task 2', () => {
  const engine = new ScoringEngine();

  // Task 1 (target 45s): completed in 75s (overtime 30s -> penalty 3 * 15 = 45 -> 300 - 45 = 255)
  const res1 = engine.calculateScore({
    taskId: 'task1-reach',
    finalSuccess: true,
    totalTimeSeconds: 75,
    totalAttempts: 1,
    hintsCount: 0
  });
  assert.equal(res1.targetTimeSeconds, 45);
  assert.equal(res1.timeBonus, 255);

  // Task 2 (target 90s): completed in 85s (<= 90s -> full 300)
  const res2 = engine.calculateScore({
    taskId: 'task2-fix',
    finalSuccess: true,
    totalTimeSeconds: 85,
    totalAttempts: 1,
    hintsCount: 0
  });
  assert.equal(res2.targetTimeSeconds, 90);
  assert.equal(res2.timeBonus, 300);
});

test('duration score respects minimum safety floor of 50 points', () => {
  const engine = new ScoringEngine();
  const result = engine.calculateScore({
    taskId: 'task1-reach',
    finalSuccess: true,
    totalTimeSeconds: 500, // Very long time
    totalAttempts: 1,
    hintsCount: 0
  });
  assert.equal(result.timeBonus, 50); // Clamped to floor
});

test('applies accuracy and self-reliance penalties correctly', () => {
  const engine = new ScoringEngine();
  const result = engine.calculateScore({
    taskId: 'task3-new', // target 60s
    finalSuccess: true,
    totalTimeSeconds: 90, // overtime 30s -> 300 - 45 = 255
    totalAttempts: 3,     // attempt 3 -> 70 pts
    backwardStepsCount: 1,// -10
    hintsCount: 2         // 2 hints * 15 = -30 -> 50 - 40 = 10 pts
  });

  assert.equal(result.completionScore, 500);
  assert.equal(result.timeBonus, 255);
  assert.equal(result.accuracyBonus, 70);
  assert.equal(result.selfRelianceBonus, 10);
  assert.equal(result.totalScore, 835);
  assert.equal(result.stars, 2); // 650 <= 835 < 850 -> 2 stars
});
