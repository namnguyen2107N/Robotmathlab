/**
 * Automated Integration Test for Start Screen Integrated Auth & Registration Requirements
 * - Direct Start Screen mounting (No blocking full-screen overlay)
 * - Required School Name & Class Name inputs for both Student and Teacher
 * - Authenticated Welcome Profile Card with START button & Switch Account
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// 1. Mock DOM Environment
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(...names) { names.forEach(n => n && this.classes.add(n)); }
  remove(...names) { names.forEach(n => n && this.classes.delete(n)); }
  toggle(name, force) {
    if (force === undefined) {
      if (this.classes.has(name)) this.classes.delete(name);
      else this.classes.add(name);
    } else if (force) this.classes.add(name);
    else this.classes.delete(name);
  }
  contains(name) { return this.classes.has(name); }
  toString() { return Array.from(this.classes).join(' '); }
}

class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new MockClassList();
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.style = {};
    this._innerHTML = '';
    this._innerText = '';
    this.value = '';
    this.checked = true;
    this.disabled = false;
    this.hidden = false;
    this.listeners = {};
    this.dataset = {};
  }

  get className() { return this.classList.toString(); }
  set className(val) {
    this.classList.classes.clear();
    if (val) val.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
  }

  get innerText() { return this._innerText || this._innerHTML.replace(/<[^>]+>/g, '').trim(); }
  set innerText(val) {
    this._innerText = String(val);
    this._innerHTML = String(val);
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    this.parseSimpleChildren(html);
  }

  parseSimpleChildren(html) {
    // Basic regex parser for IDs, classes, buttons, forms, and inputs in mock
    const tagMatches = html.matchAll(/<([a-z0-9]+)([^>]*)>/gi);
    for (const match of tagMatches) {
      const tag = match[1];
      const attrs = match[2];
      const idMatch = attrs.match(/id=["']([^"']+)["']/i);
      const classMatch = attrs.match(/class=["']([^"']+)["']/i);
      const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
      const nameMatch = attrs.match(/name=["']([^"']+)["']/i);
      const dataTabMatch = attrs.match(/data-tab=["']([^"']+)["']/i);
      const dataRoleMatch = attrs.match(/data-role=["']([^"']+)["']/i);

      const child = new MockElement(tag, idMatch ? idMatch[1] : '');
      if (child.id) domElements.set(child.id, child);
      if (classMatch) child.className = classMatch[1];
      if (typeMatch) child.attributes.type = typeMatch[1];
      if (nameMatch) child.attributes.name = nameMatch[1];
      if (dataTabMatch) child.dataset.tab = dataTabMatch[1];
      if (dataRoleMatch) child.dataset.role = dataRoleMatch[1];
      child.parentElement = this;
      this.children.push(child);
    }
  }

  appendChild(child) {
    if (child) {
      child.parentElement = this;
      this.children.push(child);
      if (child.id) domElements.set(child.id, child);
    }
    return child;
  }

  closest(sel) {
    let curr = this;
    while (curr) {
      if (sel.startsWith('.') && curr.classList.contains(sel.slice(1))) return curr;
      if (sel.startsWith('#') && curr.id === sel.slice(1)) return curr;
      if (sel.includes(',')) {
        const parts = sel.split(',').map(s => s.trim());
        for (const p of parts) {
          if (p.startsWith('.') && curr.classList.contains(p.slice(1))) return curr;
          if (p.startsWith('#') && curr.id === p.slice(1)) return curr;
        }
      }
      curr = curr.parentElement;
    }
    return null;
  }

  setAttribute(name, val) { this.attributes[name] = String(val); }
  getAttribute(name) { return this.attributes[name] || null; }
  removeAttribute(name) { delete this.attributes[name]; }

  addEventListener(type, cb) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(cb => cb(event));
    if (this['on' + event.type]) this['on' + event.type](event);
  }

  click() {
    this.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {}, currentTarget: this, target: this });
  }

  focus() {}

  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }

  querySelectorAll(sel) {
    const results = [];
    const check = (node) => {
      let isMatch = false;
      if (sel.startsWith('#') && node.id === sel.slice(1)) isMatch = true;
      else if (sel.startsWith('.') && node.classList.contains(sel.slice(1))) isMatch = true;
      else if (sel.startsWith('[data-tab')) {
        const valMatch = sel.match(/\[data-tab=["']?([^"'\]]+)["']?\]/);
        if (valMatch) isMatch = node.dataset?.tab === valMatch[1];
        else isMatch = !!node.dataset?.tab;
      }
      else if (sel.startsWith('[data-role')) {
        const valMatch = sel.match(/\[data-role=["']?([^"'\]]+)["']?\]/);
        if (valMatch) isMatch = node.dataset?.role === valMatch[1];
        else isMatch = !!node.dataset?.role;
      }
      else if (sel.startsWith('[data-social') && node.getAttribute('data-social')) isMatch = true;
      else if (node.tagName === sel.toUpperCase()) isMatch = true;
      if (isMatch) results.push(node);
      node.children.forEach(check);
    };
    this.children.forEach(check);
    return results;
  }

  remove() {
    if (this.id) domElements.delete(this.id);
    const unregister = (node) => {
      if (node.id) domElements.delete(node.id);
      node.children.forEach(unregister);
    };
    this.children.forEach(unregister);
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
      this.parentElement = null;
    }
  }
}

// Setup browser globals
const localStorageData = {};
global.localStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = String(val); },
  removeItem: (key) => { delete localStorageData[key]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

const domElements = new Map();
global.document = {
  readyState: 'complete',
  body: new MockElement('body', 'body'),
  documentElement: new MockElement('html', 'html'),
  getElementById: (id) => domElements.get(id) || null,
  querySelector: (sel) => global.document.body.querySelector(sel),
  querySelectorAll: (sel) => global.document.body.querySelectorAll(sel),
  createElement: (tag) => new MockElement(tag),
  addEventListener: () => {}
};

// Register #splash-auth-mount on the start screen
const splashMount = new MockElement('div', 'splash-auth-mount');
global.document.body.children.push(splashMount);
domElements.set('splash-auth-mount', splashMount);

global.window = {
  localStorage: global.localStorage,
  document: global.document,
  location: { hash: '#start', reload: () => {} },
  I18N: {
    isVietnamese: () => global.window.I18N.currentLang === 'vi',
    currentLang: 'vi',
    setLang: function(l) { this.currentLang = l; }
  },
  RML_FIREBASE_CONFIG: { apiKey: "TEST", databaseURL: "https://test.firebase.io" },
  RML_FIREBASE_CONFIGURED: false,
  confirm: () => true,
  addEventListener: () => {}
};
global.location = global.window.location;

// Load FirebaseService & Auth
const firebaseServiceCode = fs.readFileSync(path.resolve(__dirname, '../../js/firebase/firebase-service.js'), 'utf8');
vm.runInThisContext(firebaseServiceCode);

console.log('--- TEST: Start Screen Integrated Auth & Registration (School & Class) ---');

async function testStartScreenAuth() {
  const service = global.window.FirebaseService;
  await service.init();

  // Test 1: Register Student with School & Class
  const student = await service.register({
    displayName: 'Bé Hải Đăng',
    username: 'haidang2026',
    password: 'password123',
    role: 'student',
    schoolName: 'Tiểu học Chu Văn An',
    className: 'Lớp 4A1'
  });

  assert.ok(student, 'Student account should be registered');
  assert.strictEqual(student.schoolName, 'Tiểu học Chu Văn An', 'School name must be preserved');
  assert.strictEqual(student.className, 'Lớp 4A1', 'Class name must be preserved');
  console.log('✓ Student registration includes School ("Tiểu học Chu Văn An") and Class ("Lớp 4A1")');

  // Test 2: Register Teacher with School & Assigned Grade
  const teacher = await service.register({
    displayName: 'Thầy Trần Văn Nam',
    username: 'thaynam',
    password: 'password123',
    role: 'teacher',
    teacherCode: 'RML-TEACHER-2026',
    schoolName: 'TH Sư Phạm Hà Nội',
    className: 'Khối 4 & 5'
  });

  assert.ok(teacher, 'Teacher account should be registered');
  assert.strictEqual(teacher.schoolName, 'TH Sư Phạm Hà Nội');
  assert.strictEqual(teacher.className, 'Khối 4 & 5');
  assert.ok(teacher.classroomId.startsWith('CLASS-'));
  console.log('✓ Teacher registration includes School ("TH Sư Phạm Hà Nội") and Grade ("Khối 4 & 5")');

  // Test 3: Load auth.js and verify direct Start Screen integration
  const authCode = fs.readFileSync(path.resolve(__dirname, '../../js/auth.js'), 'utf8');
  vm.runInThisContext(authCode);

  assert.ok(global.window.RMLAuth, 'RMLAuth module should be available');
  await global.window.RMLAuth.refresh();

  // Verify that auth mounts into #splash-auth-mount rather than creating an overlay
  const mountEl = global.document.getElementById('splash-auth-mount');
  assert.ok(mountEl, 'Mount container #splash-auth-mount must exist');
  assert.ok(mountEl.innerHTML.length > 0, 'Mount container should have rendered content');

  // Verify that #rml-auth-overlay was NOT added to document.body
  const overlay = global.document.body.children.find(c => c.id === 'rml-auth-overlay');
  assert.strictEqual(overlay, undefined, 'Blocking modal overlay #rml-auth-overlay should NOT exist when integrated into Start screen');
  console.log('✓ Verified: Auth gate renders directly inside #splash-auth-mount without blocking overlay');

  // Test 4: Authenticated user renders Profile Card with School, Class & START button
  assert.ok(mountEl.innerHTML.includes('splash-welcome-card'), 'Authenticated view should render .splash-welcome-card');
  assert.ok(mountEl.innerHTML.includes('Tiểu học Chu Văn An') || mountEl.innerHTML.includes('TH Sư Phạm Hà Nội'), 'Welcome card must display school name');
  assert.ok(mountEl.innerHTML.includes('btn-splash-start'), 'Welcome card must contain the 3D START button (#btn-splash-start)');
  assert.ok(mountEl.innerHTML.includes('btn-splash-switch-account'), 'Welcome card must contain switch account / logout button');
  console.log('✓ Verified: Authenticated Welcome Card contains School, Class, and START button');

  // Test 5: Switch account / logout restores Login/Register form into #splash-auth-mount
  await global.window.RMLAuth.logout();
  assert.strictEqual(global.window.RMLAuth.authenticated, false, 'Should be unauthenticated after logout');
  assert.ok(mountEl.innerHTML.includes('rml-auth-tabs'), 'Mount should now display login and register tabs');
  assert.ok(mountEl.innerHTML.includes('rml-register-school'), 'Registration form must include school input field');
  assert.ok(mountEl.innerHTML.includes('rml-register-class'), 'Registration form must include class input field');
  assert.ok(mountEl.innerHTML.includes('rml-social-google'), 'Should include Google social login button');
  assert.strictEqual(mountEl.innerHTML.includes('rml-social-github'), false, 'GitHub login button should be removed');
  console.log('✓ Verified: Logout smoothly restores Login & Register forms with School & Class fields');
  console.log('✓ Verified: Only Google social login is active (GitHub removed as requested)');

  // Test 6: In-place language switching without page reload
  let reloadCalled = false;
  const originalReload = global.location.reload;
  global.location.reload = () => { reloadCalled = true; };

  const langBtn = mountEl.querySelector('#rml-auth-lang');
  assert.ok(langBtn, 'Language button #rml-auth-lang should exist');
  langBtn.click();

  assert.strictEqual(reloadCalled, false, 'Language toggle must NOT trigger location.reload()');
  assert.strictEqual(global.window.I18N.currentLang, 'en', 'Language should have switched to English in-place');
  console.log('✓ Verified: Language switches in-place smoothly without page reload');

  // Test 7: Post-logout Login Modal Overlay & Registration flow
  global.window.RMLAuth.openLoginOverlay('login');
  const modalOverlay = global.document.getElementById('rml-auth-modal-overlay');
  assert.ok(modalOverlay, 'Modal overlay #rml-auth-modal-overlay must be created in document body');
  const modalMount = modalOverlay.querySelector('#rml-modal-auth-mount');
  assert.ok(modalMount, '#rml-modal-auth-mount must exist inside modal overlay');
  assert.ok(modalMount.innerHTML.includes('rml-login-form'), 'Modal should contain login form');

  // Switch to register tab inside modal
  const registerTabBtn = modalMount.querySelector('[data-tab="register"]');
  assert.ok(registerTabBtn, 'Register tab button should exist inside modal');
  registerTabBtn.click();

  const modalRegForm = modalMount.querySelector('#rml-register-form');
  assert.ok(modalRegForm, 'Register form must exist in modal');
  assert.strictEqual(modalRegForm.style.display, 'grid', 'Register form should be displayed in grid');

  // Switch to teacher role inside modal
  const teacherRoleBtn = modalMount.querySelector('[data-role="teacher"]');
  assert.ok(teacherRoleBtn, 'Teacher role button should exist in modal');
  teacherRoleBtn.click();

  const hiddenRoleInput = modalMount.querySelector('#rml-register-role');
  assert.strictEqual(hiddenRoleInput.value, 'teacher', 'Hidden role input in modal should be teacher');
  console.log('✓ Verified: Post-logout Login Modal accurately toggles register tab and teacher role without errors');

  // Close modal
  global.window.RMLAuth.closeLoginOverlay();
  assert.strictEqual(global.document.getElementById('rml-auth-modal-overlay'), null, 'Modal overlay should be cleanly removed');
  console.log('✓ Verified: Login Modal closes cleanly');

  console.log('\n🎉 ALL START SCREEN AUTH INTEGRATION TESTS PASSED! 🎉\n');
}

testStartScreenAuth().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
