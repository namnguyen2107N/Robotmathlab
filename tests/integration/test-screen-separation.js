/**
 * Automated Integration Test for Start Screen & Game Screen Complete Separation
 * Verifies:
 * 1. Initial access / #start renders ONLY Start Screen, hides #main-view
 * 2. Clicking START transitions cleanly to Game Hub (#hub) and hides #splash-screen
 * 3. #main-view contains tasks only on #hub and has a back-to-start mechanism
 * 4. Navigating back to #start restores Start Screen and hides #main-view completely
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;
const vm = require('vm');

class MockClassList {
  constructor() {
    this.classes = new Set();
  }
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
    this.listeners = {};
  }

  get className() { return this.classList.toString(); }
  set className(val) {
    this.classList.classes.clear();
    if (val) val.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
  }

  get innerText() { return this._innerText; }
  set innerText(val) {
    this._innerText = String(val);
    this._innerHTML = String(val);
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
  }

  setAttribute(name, val) { this.attributes[name] = String(val); }
  getAttribute(name) { return this.attributes[name] || null; }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const fns = this.listeners[event.type] || [];
    fns.forEach(fn => fn(event));
    if (this['on' + event.type]) this['on' + event.type](event);
  }

  click() {
    this.dispatchEvent({ type: 'click', stopPropagation: () => {}, target: this });
  }

  focus() {}

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      let isMatch = false;
      if (selector.startsWith('#')) {
        isMatch = node.id === selector.slice(1);
      } else if (selector.startsWith('.')) {
        isMatch = node.classList.contains(selector.slice(1));
      } else if (selector.toUpperCase() === node.tagName) {
        isMatch = true;
      }
      if (isMatch) results.push(node);
      node.children.forEach(walk);
    };
    this.children.forEach(walk);
    return results;
  }
}

// Setup simulated browser environment
const domElements = new Map();
const doc = {
  body: new MockElement('body'),
  documentElement: new MockElement('html'),
  getElementById(id) {
    return domElements.get(id) || null;
  },
  querySelector(sel) {
    if (sel.startsWith('#')) return this.getElementById(sel.slice(1));
    return this.body.querySelector(sel);
  },
  querySelectorAll(sel) {
    return this.body.querySelectorAll(sel);
  },
  addEventListener() {},
  registerElement(id, el) {
    domElements.set(id, el);
    this.body.appendChild(el);
    return el;
  }
};

const win = {
  document: doc,
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  sessionStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  location: {
    hash: '#start'
  },
  scrollTo() {},
  addEventListener(event, fn) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  },
  dispatchEvent(event) {
    if (!this.listeners || !this.listeners[event.type]) return;
    this.listeners[event.type].forEach(fn => fn(event));
  }
};

global.window = win;
global.document = doc;
global.localStorage = win.localStorage;
global.sessionStorage = win.sessionStorage;

// Register DOM elements
const splashScreen = doc.registerElement('splash-screen', new MockElement('div', 'splash-screen'));
const mainView = doc.registerElement('main-view', new MockElement('main', 'main-view'));
const splashBtn = doc.registerElement('btn-splash-start', new MockElement('button', 'btn-splash-start'));
const nameInput = doc.registerElement('splash-student-name', new MockElement('input', 'splash-student-name'));
const headerStudent = doc.registerElement('header-student-name', new MockElement('span', 'header-student-name'));
const headerStudentTag = doc.registerElement('header-student-tag', new MockElement('button', 'header-student-tag'));
const btnTeacher = doc.registerElement('btn-header-teacher', new MockElement('a', 'btn-header-teacher'));
const brandLink = doc.registerElement('brand-home-link', new MockElement('a', 'brand-home-link'));
const soundBtn = doc.registerElement('btn-toggle-sound', new MockElement('button', 'btn-toggle-sound'));
const soundIcon = doc.registerElement('sound-icon', new MockElement('span', 'sound-icon'));
soundBtn.appendChild(soundIcon);
const btnStartHeader = doc.registerElement('btn-header-start', new MockElement('a', 'btn-header-start'));

// Mock TaskEngine & I18N
global.TaskEngine = class MockTaskEngine {
  constructor() {}
  loadTask() {}
};
global.I18N = {
  currentLang: 'vi',
  isVietnamese() { return this.currentLang === 'vi'; },
  t(key) { return key; },
  setLang(l) { this.currentLang = l; }
};

// Load AppController
const appCode = fs.readFileSync(path.resolve(__dirname, '../../js/app.js'), 'utf-8');
vm.runInThisContext(appCode);

console.log('--- TEST: Complete Separation of Start Screen & Game Screen ---');

const app = new AppController();

// 1. Initial access check
assert.equal(doc.body.classList.contains('view-start-screen'), true, 'Body should have view-start-screen on start');
assert.equal(splashScreen.classList.contains('hidden'), false, 'Splash screen should be visible on start');
assert.equal(mainView.style.display, 'none', 'Main view must be hidden on start');
assert.equal(mainView.innerHTML, '', 'Main view must be empty on start');
console.log('✓ Initial access: Only Start Screen is visible, Game Screen is hidden and empty');

// 2. Click START -> completeStartScreen()
app.completeStartScreen();
assert.equal(win.location.hash, '#hub', 'Hash should be #hub after completing start screen');
assert.equal(doc.body.classList.contains('view-start-screen'), false, 'view-start-screen should be removed from body');
assert.equal(splashScreen.classList.contains('hidden'), true, 'Splash screen must be hidden on #hub');
assert.equal(mainView.style.display, 'block', 'Main view must be visible on #hub');
assert.ok(mainView.innerHTML.includes('hub-container'), 'Main view must contain the hub container');
console.log('✓ Start Game action: Transitions cleanly to Game Hub, Splash Screen is completely hidden');

// 3. Test: Unauthenticated guest accessing #start
win.localStorage.removeItem('rml_account_id');
win.location.hash = '#start';
app.handleRoute();
assert.equal(doc.body.classList.contains('view-start-screen'), true, 'Body should have view-start-screen for guest on #start');
assert.equal(splashScreen.classList.contains('hidden'), false, 'Splash screen must be visible for guest on #start');
assert.equal(mainView.style.display, 'none', 'Main view must be hidden when guest is on #start');
assert.equal(mainView.innerHTML, '', 'Main view must be cleared when guest is on #start');
console.log('✓ Guest Start: Guest on #start sees Start Screen and Game Screen is hidden');

// 4. Test: Authenticated user accessing #start automatically bypasses #start and redirects to #hub
win.localStorage.setItem('rml_account_id', 'test_student_01');
win.location.hash = '#start';
app.handleRoute();
assert.equal(win.location.hash, '#hub', 'Authenticated user navigating to #start must be redirected to #hub');
assert.equal(splashScreen.classList.contains('hidden'), true, 'Splash screen must remain hidden for authenticated user');
assert.equal(mainView.style.display, 'block', 'Main view must be displayed for authenticated user on #hub');
assert.ok(mainView.innerHTML.includes('tasks-grid'), 'Tasks grid must be rendered in main-view');
console.log('✓ Authenticated Bypass: Logged-in user accessing #start is redirected directly to #hub');

// 5. Test: Sound Toggle feature
app.syncSoundUI(true);
assert.equal(soundIcon.innerText, '🔇', 'Sound icon should be 🔇 when muted');
app.syncSoundUI(false);
assert.equal(soundIcon.innerText, '🔊', 'Sound icon should be 🔊 when unmuted');
console.log('✓ Sound Toggle: Sound muting and unmuting verified and synchronized across UI');

console.log('\n🎉 ALL SCREEN SEPARATION TESTS PASSED SUCCESSFULLY! 🎉');
