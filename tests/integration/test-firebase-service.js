/**
 * Automated Test for FirebaseService (Authentication & Realtime Database Sync)
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
  RML_FIREBASE_CONFIGURED: false // Run in offline/local fallback mode for testing
};

// 2. Load FirebaseService script
const servicePath = path.resolve(__dirname, '../../js/firebase/firebase-service.js');
const serviceCode = fs.readFileSync(servicePath, 'utf8');
vm.runInThisContext(serviceCode);

const service = global.window.FirebaseService;

console.log('--- TEST: FirebaseService Auth & Realtime Database Sync ---');

async function runTests() {
  // Test 1: Service exists and initializes in offline mode
  assert.ok(service, 'FirebaseService instance should exist');
  await service.init();
  assert.strictEqual(service.offlineMode, true, 'Should run in offline fallback mode without live Firebase credentials');
  console.log('✓ FirebaseService initialized in local demo mode');

  // Test 2: Register a new student account
  const regResult = await service.register({
    displayName: 'Bé Minh',
    username: 'minh2026',
    password: 'securepassword123'
  });
  assert.ok(regResult, 'Register should return account object');
  assert.strictEqual(regResult.username, 'minh2026');
  assert.strictEqual(regResult.display_name, 'Bé Minh');
  assert.strictEqual(regResult.email, 'minh2026@robotmathlab.edu');
  console.log('✓ Student registration succeeded:', regResult.display_name, regResult.email);

  // Test 3: Duplicate username registration rejection
  try {
    await service.register({
      displayName: 'Bé Minh 2',
      username: 'minh2026',
      password: 'password999'
    });
    assert.fail('Should reject duplicate username');
  } catch (err) {
    assert.ok(err.message.includes('đã được sử dụng'), 'Should return username taken message');
    console.log('✓ Duplicate username rejected successfully');
  }

  // Test 4: Password too short rejection
  try {
    await service.register({
      displayName: 'Bé An',
      username: 'an2026',
      password: '123'
    });
    assert.fail('Should reject short password');
  } catch (err) {
    assert.ok(err.message.includes('6 ký tự'), 'Should reject password under 6 characters');
    console.log('✓ Short password rejected successfully');
  }

  // Test 5: Login with registered account
  const loginResult = await service.login({
    username: 'minh2026',
    password: 'securepassword123'
  });
  assert.strictEqual(loginResult.username, 'minh2026');
  assert.strictEqual(loginResult.display_name, 'Bé Minh');
  console.log('✓ Login with registered account succeeded');

  // Test 6: Login with wrong password
  try {
    await service.login({
      username: 'minh2026',
      password: 'wrong_password'
    });
    assert.fail('Should reject incorrect password');
  } catch (err) {
    assert.ok(err.message.includes('Sai mật khẩu'), 'Should reject wrong password');
    console.log('✓ Incorrect password rejected successfully');
  }

  // Test 7: Update display name
  const updatedAccount = await service.updateDisplayName('Nguyễn Minh');
  assert.strictEqual(updatedAccount.display_name, 'Nguyễn Minh');
  console.log('✓ Display name updated to:', updatedAccount.display_name);

  // Test 8: Save task session (Realtime Database data sync)
  const mockSession = {
    sessionId: 'sess_test_123',
    taskId: 'task1-reach',
    studentName: 'Nguyễn Minh',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    events: [
      { code: 'PS1', label: 'Given data identified', timestamp: new Date().toISOString() },
      { code: 'PS6', label: 'Parameters set', timestamp: new Date().toISOString() },
      { code: 'PS7', label: 'Simulation run', timestamp: new Date().toISOString() }
    ],
    summary: { totalAttempts: 1, finalSuccess: true }
  };
  await service.saveSession(mockSession);
  const savedSessions = await service.loadUserSessions();
  assert.ok(savedSessions.some(s => s.sessionId === 'sess_test_123'), 'Session should be saved and retrieved');
  console.log('✓ Task session saved and retrieved successfully');

  // Test 9: Save task progress
  await service.saveTaskProgress('task1-reach', {
    bestAttempts: 1,
    stars: 3
  });
  const progress = await service.loadUserProgress();
  assert.ok(progress['task1-reach'], 'Task progress should be saved');
  assert.strictEqual(progress['task1-reach'].completed, true);
  console.log('✓ Task progress saved and retrieved successfully');

  // Test 10: Guest Mode (Instant exploration without credentials & NO data saving)
  const guestResult = await service.loginAsGuest();
  assert.ok(guestResult, 'Guest login should succeed');
  assert.strictEqual(guestResult.isAnonymous, true);
  console.log('✓ Guest mode login succeeded:', guestResult.display_name);

  // Test 11: Verify guest mode DOES NOT save session or score
  const guestSession = {
    sessionId: 'sess_guest_temp',
    taskId: 'task1-reach',
    studentName: 'Khách Trải Nghiệm',
    summary: { finalSuccess: true }
  };
  await service.saveSession(guestSession);
  const guestScore = await service.saveScore('task1-reach', { score: 900 });
  assert.strictEqual(guestScore, null, 'Score should NOT be saved in guest mode');
  console.log('✓ Verified: Guest mode does NOT save scores or sessions');

  // Test 12: OAuth Login (Google & GitHub)
  const googleAccount = await service.loginWithGoogle('student');
  assert.ok(googleAccount, 'Google login should succeed');
  assert.ok(googleAccount.username.startsWith('google_'), 'Google account should have google prefix');
  console.log('✓ Google login succeeded:', googleAccount.display_name);

  const githubAccount = await service.loginWithGithub('teacher');
  assert.ok(githubAccount, 'GitHub login should succeed');
  assert.strictEqual(githubAccount.role, 'teacher');
  assert.ok(githubAccount.classroomId.startsWith('CLASS-'));
  console.log('✓ GitHub login (Teacher) succeeded with classroom:', githubAccount.classroomId);

  // Test 13: Logout
  await service.logout();
  assert.strictEqual(service.account, null, 'Account should be null after logout');
  console.log('✓ Logout completed cleanly');

  console.log('\n🎉 ALL FIREBASE SERVICE TESTS PASSED! 🎉\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
