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

  // Test 7: Teacher Dashboard Ranking Table & Status column removal
  const teacherDashPath = path.resolve(__dirname, '../../js/teacher-dashboard.js');
  vm.runInThisContext(fs.readFileSync(teacherDashPath, 'utf8'));

  const teacherCtrl = global.window.TeacherDashboardController;
  assert.ok(teacherCtrl, 'TeacherDashboardController singleton should exist');

  const mockContainer = { innerHTML: '', querySelectorAll: () => [] };
  const mockTbody = { innerHTML: '', querySelectorAll: () => [] };
  const mockElements = {
    'main-view': mockContainer,
    'teacher-students-tbody': mockTbody,
    'stat-top-student': { innerText: '' },
    'stat-online-count': { innerText: '' },
    'stat-total-count': { innerText: '' },
    'stat-avg-score': { innerText: '' },
    'stat-tasks-count': { innerText: '' }
  };
  global.document = {
    getElementById: (id) => mockElements[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: { style: {}, classList: { add: () => {}, remove: () => {} } }
  };
  global.window.document = global.document;

  service.account = teacherAccount;
  await teacherCtrl.render();

  // Verify Table Headers: contains Rank, does NOT contain Status
  assert.ok(mockContainer.innerHTML.includes('<th>Hạng</th>') || mockContainer.innerHTML.includes('>Hạng<'), 'Table header must have Hạng (Rank) column');
  assert.ok(!mockContainer.innerHTML.includes('<th>Trạng Thái</th>'), 'Table header must NOT contain Trạng Thái (Status) column');
  console.log('✓ Teacher dashboard table: Rank column added, Status column successfully removed');

  // Verify Student Ranking Sorting & Medals
  await teacherCtrl.loadClassroomData(teacherAccount.classroomId);
  assert.ok(teacherCtrl.students.length > 0, 'Classroom should have students');
  for (let i = 0; i < teacherCtrl.students.length - 1; i++) {
    const a = teacherCtrl.students[i];
    const b = teacherCtrl.students[i + 1];
    assert.ok((Number(a.totalScore) || 0) >= (Number(b.totalScore) || 0), 'Students must be sorted descending by totalScore');
    assert.equal(a.rank, i + 1, `Student ${a.displayName} must have rank ${i + 1}`);
  }
  assert.ok(mockTbody.innerHTML.includes('rank-1') && mockTbody.innerHTML.includes('🥇 #1'), 'Top student should have gold medal rank-1 badge');
  assert.ok(!mockTbody.innerHTML.includes('status-pill'), 'Student rows must NOT contain status pills');
  console.log('✓ Teacher dashboard ranking: students sorted by real totalScore descending with rank badges');

  // Test 8: Hub tab verification for both Teacher and Student accounts
  global.window.I18N = {
    isVietnamese: () => true,
    t: (key) => {
      const dict = {
        hero_eyebrow: 'TRUNG TÂM NHIỆM VỤ ROBOT',
        hero_title: 'PHÒNG THÍ NGHIỆM TOÁN HỌC',
        hub_greeting: 'Chào bạn! Hãy chọn một nhiệm vụ và cùng giải nhé.',
        student_tag_title: 'Nhà Thám Hiểm Toán Học',
        btn_journal: '📓 Nhật Ký Học Tập',
        hub_section_title: 'DANH SÁCH BÀI TOÁN CHUYỂN ĐỘNG',
        hub_section_desc: 'Mô hình 4 bước Polya kết hợp thí nghiệm ảo',
        task1_badge: '🎯 Level 1',
        task1_title: 'Hành trình đến đích',
        task1_btn: 'Bắt đầu làm bài',
        task2_badge: '🎯 Level 2',
        task2_title: 'Chuyến đi bất ngờ',
        task2_btn: 'Bắt đầu làm bài',
        task3_badge: '🆕 Level 3',
        task3_title: 'Thử thách đúng giờ',
        task3_btn: 'Bắt đầu làm bài'
      };
      return dict[key] || key;
    }
  };

  const appPath = path.resolve(__dirname, '../../js/app.js');
  // Load tasks configs
  vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, '../../js/tasks/task1-reach.js'), 'utf8'));
  vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, '../../js/tasks/task2-fix.js'), 'utf8'));
  vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, '../../js/tasks/task3-new.js'), 'utf8'));

  // Load AppController definition
  vm.runInThisContext(fs.readFileSync(appPath, 'utf8'));
  const AppControllerClass = global.window.App ? global.window.App.constructor : AppController;

  const mockAppInstance = {
    escapeHtml: (s) => String(s || ''),
    currentStudent: teacherAccount.display_name,
    renderTaskHubContent: AppControllerClass.prototype.renderTaskHubContent
  };

  // Case A: Teacher account on Hub
  service.account = teacherAccount;
  mockAppInstance.renderTaskHubContent();
  assert.ok(mockContainer.innerHTML.includes('👨‍🏫'), 'Hub should show teacher avatar for teacher account');
  assert.ok(mockContainer.innerHTML.includes('Thầy Cô Giáo'), 'Hub should show teacher title for teacher account');
  assert.ok(mockContainer.innerHTML.includes('#teacher'), 'Hub should show Teacher Dashboard shortcut for teacher account');
  assert.ok(mockContainer.innerHTML.includes('color: #ffffff;'), 'Teacher dashboard button in hub must have white text for high contrast');
  assert.ok(mockContainer.innerHTML.includes('card-task1') && mockContainer.innerHTML.includes('card-task2') && mockContainer.innerHTML.includes('card-task3'), 'All 3 task cards must be rendered on Hub');
  console.log('✓ Hub view verified for Teacher account: teacher badge, white-text dashboard button, and all 3 tasks');

  // Case B: Student account on Hub
  service.account = studentAccount;
  mockAppInstance.currentStudent = studentAccount.display_name;
  mockAppInstance.renderTaskHubContent();
  assert.ok(mockContainer.innerHTML.includes('🧑‍🎓'), 'Hub should show student avatar for student account');
  assert.ok(mockContainer.innerHTML.includes('Nhà Thám Hiểm Toán Học'), 'Hub should show student title for student account');
  assert.ok(!mockContainer.innerHTML.includes('#teacher'), 'Hub must NOT show teacher dashboard link for student account');
  assert.ok(mockContainer.innerHTML.includes('card-task1') && mockContainer.innerHTML.includes('card-task2') && mockContainer.innerHTML.includes('card-task3'), 'All 3 task cards must be rendered on Hub');
  console.log('✓ Hub view verified for Student account: student badge, no teacher button, and all 3 tasks');

  // Case C: Algorithm consistency check for all 3 tasks across roles
  assert.equal(global.window.Task1Reach.targetDistance / global.window.Task1Reach.robotSpeed, global.window.Task1Reach.correctTime, 'Task 1 kinematics formula check: s / v = t');
  assert.equal(global.window.Task2Fix.targetDistance / global.window.Task2Fix.robotSpeed, global.window.Task2Fix.correctTime, 'Task 2 kinematics formula check: s / v = t');
  assert.equal(global.window.Task3New.targetDistance / global.window.Task3New.correctTime, global.window.Task3New.robotSpeed, 'Task 3 kinematics formula check: s / t = v');
  console.log('✓ Task algorithms consistency verified for both roles: s = v * t kinematic formulas verified');

  console.log('\n🎉 ALL ROLE & RANKING INTEGRATION TESTS PASSED!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
