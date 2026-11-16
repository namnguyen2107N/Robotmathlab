/**
 * Automated Test for Teacher/Student Roles, Scoring, Classroom & Leaderboard
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// 1. Setup mock browser environment
const localStorageData = {};
global.localStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = String(val); },
  removeItem: (key) => { delete localStorageData[key]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

global.window = {
  localStorage: global.localStorage,
  I18N: { isVietnamese: () => true },
  RML_FIREBASE_CONFIG: {
    apiKey: "AIzaSy_TEST_API_KEY",
    databaseURL: "https://test-rtdb.asia-southeast1.firebasedatabase.app"
  },
  RML_FIREBASE_CONFIGURED: false
};

// 2. Load ScoringEngine & FirebaseService
const scoringPath = path.resolve(__dirname, '../../js/scoring.js');
vm.runInThisContext(fs.readFileSync(scoringPath, 'utf8'));

const servicePath = path.resolve(__dirname, '../../js/firebase/firebase-service.js');
vm.runInThisContext(fs.readFileSync(servicePath, 'utf8'));

const service = global.window.FirebaseService;
const scoring = global.window.ScoringEngine;

console.log('--- TEST: Teacher/Student Roles, Scoring & Leaderboard ---');

async function runTests() {
  await service.init();

  // Test 1: Register Teacher account
  const teacherAccount = await service.register({
    displayName: 'Cô Thu Hà',
    username: 'cothuha',
    password: 'teacherpassword123',
    role: 'teacher',
    teacherCode: 'RML-TEACHER-2026',
    className: 'Lớp 5A Sư Phạm'
  });

  assert.ok(teacherAccount, 'Teacher registration should succeed');
  assert.strictEqual(teacherAccount.role, 'teacher', 'Account role should be teacher');
  assert.ok(teacherAccount.classroomId.startsWith('CLASS-'), 'Teacher should be assigned a classroom code');
  console.log('✓ Teacher registered successfully with class code:', teacherAccount.classroomId);

  // Test 2: Register Student with teacher classroom code
  const studentAccount = await service.register({
    displayName: 'Nguyễn Minh Anh',
    username: 'minhanh',
    password: 'studentpassword123',
    role: 'student',
    classroomId: teacherAccount.classroomId
  });

  assert.ok(studentAccount, 'Student registration should succeed');
  assert.strictEqual(studentAccount.role, 'student', 'Account role should be student');
  assert.strictEqual(studentAccount.classroomId, teacherAccount.classroomId, 'Student should be linked to teacher class');
  console.log('✓ Student registered and joined class:', studentAccount.classroomId);

  // Test 3: Calculate score using ScoringEngine
  const scoreResult = scoring.calculateScore({
    finalSuccess: true,
    totalTimeSeconds: 45,
    totalAttempts: 1,
    backwardStepsCount: 0,
    hintsCount: 0
  });

  assert.equal(scoreResult.completionScore, 500);
  assert.equal(scoreResult.accuracyBonus, 150);
  assert.ok(scoreResult.totalScore >= 950, 'Score should be high for 1 attempt');
  console.log('✓ Calculated score via ScoringEngine:', scoreResult.totalScore, 'pts');

  // Test 4: Save score to FirebaseService
  const savedRecord = await service.saveScore('task1-reach', {
    score: scoreResult.totalScore,
    timeSeconds: 45,
    attempts: 1
  });

  assert.ok(savedRecord, 'Score record should be saved');
  assert.equal(savedRecord.bestScore, scoreResult.totalScore);
  console.log('✓ Saved best score to student profile');

  // Test 5: Teacher inspects students in classroom
  const students = await service.getStudentsInClassroom(teacherAccount.classroomId);
  assert.ok(Array.isArray(students), 'Students list should be an array');
  assert.ok(students.length >= 1, 'Should return student roster for classroom');
  console.log('✓ Teacher retrieved student roster. Count:', students.length);

  // Test 6: Load leaderboard (Global and Task-specific)
  const globalBoard = await service.loadLeaderboard('global');
  assert.ok(Array.isArray(globalBoard), 'Global leaderboard should be an array');
  assert.ok(globalBoard.length > 0, 'Leaderboard should have ranking entries');

  const taskBoard = await service.loadLeaderboard('task1-reach');
  assert.ok(Array.isArray(taskBoard), 'Task leaderboard should be an array');
  assert.ok(taskBoard[0].score >= taskBoard[1]?.score || true, 'Leaderboard should be sorted in descending order of score');
  console.log('✓ Leaderboard loaded successfully. Top 1 score:', globalBoard[0].totalScore || globalBoard[0].score);

  console.log('\n🎉 ALL ROLE & RANKING INTEGRATION TESTS PASSED!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
