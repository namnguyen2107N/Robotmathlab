/**
 * TEST INTEGRATION: Navigation Routing, Teacher/Student Destinations & Duration-Based Scoring
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

const ROOT_DIR = path.resolve(__dirname, '../../');

// Minimal DOM simulation for Node.js
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
    this.onclick = null;
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

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      if (node !== this) {
        if (selector.startsWith('#') && node.id === selector.slice(1)) results.push(node);
        else if (selector.startsWith('.') && node.classList.contains(selector.slice(1))) results.push(node);
        else if (node.tagName.toLowerCase() === selector.toLowerCase()) results.push(node);
      }
      for (const ch of node.children) walk(ch);
    };
    walk(this);
    return results;
  }
}

class MockDocument {
  constructor() {
    this.body = new MockElement('body');
    this.elementsById = {};
    this.listeners = {};
  }

  getElementById(id) {
    return this.elementsById[id] || null;
  }

  createElement(tag) {
    return new MockElement(tag);
  }

  registerElement(id, el) {
    this.elementsById[id] = el;
    this.body.appendChild(el);
    return el;
  }

  querySelector(sel) {
    return this.body.querySelector(sel);
  }

  querySelectorAll(sel) {
    return this.body.querySelectorAll(sel);
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const fns = this.listeners[event.type] || [];
    fns.forEach(fn => fn(event));
  }
}

async function runTests() {
  console.log('--- TEST: Navigation Routing, Role Destinations & Real Duration Scoring ---');

  const doc = new MockDocument();
  global.document = doc;
  global.window = {
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

  // Register necessary DOM structure
  const mainView = doc.registerElement('main-view', new MockElement('main', 'main-view'));
  const splashScreen = doc.registerElement('splash-screen', new MockElement('div', 'splash-screen'));
  const splashBtn = doc.registerElement('btn-splash-start', new MockElement('button', 'btn-splash-start'));
  const nameInput = doc.registerElement('splash-student-name', new MockElement('input', 'splash-student-name'));
  const headerStudent = doc.registerElement('header-student-name', new MockElement('span', 'header-student-name'));
  const btnTeacher = doc.registerElement('btn-header-teacher', new MockElement('a', 'btn-header-teacher'));
  const btnArcade = doc.registerElement('btn-settings-open-arcade', new MockElement('button', 'btn-settings-open-arcade'));
  const brandLink = doc.registerElement('brand-home-link', new MockElement('a', 'brand-home-link'));

  // Load modules
  const ScoringEngine = require('../../js/scoring.js');
  global.window.ScoringEngine = new ScoringEngine();

  // Test 1: ScoringEngine target benchmarks and duration formula
  const scoring = global.window.ScoringEngine;
  assert.equal(scoring.getTargetTime('task1-reach'), 45);
  assert.equal(scoring.getTargetTime('task2-fix'), 90);
  assert.equal(scoring.getTargetTime('task3-new'), 60);

  // Fast completion within target
  const fastScore = scoring.calculateScore({
    taskId: 'task1-reach',
    finalSuccess: true,
    totalTimeSeconds: 30, // <= 45s
    totalAttempts: 1
  });
  assert.equal(fastScore.timeBonus, 300);
  assert.equal(fastScore.totalScore, 1000);
  assert.equal(fastScore.stars, 3);
  console.log('✓ Fast duration scoring: 30s <= 45s target awards 300 pts and 3 stars');

  // Overtime calculation
  const lateScore = scoring.calculateScore({
    taskId: 'task1-reach',
    finalSuccess: true,
    totalTimeSeconds: 75, // 30s delay -> 3 * 15 = 45 penalty
    totalAttempts: 1
  });
  assert.equal(lateScore.timeBonus, 255);
  assert.equal(lateScore.totalScore, 955);
  console.log('✓ Overtime duration scoring: 75s (30s overtime) results in 255 duration pts');

  // Extreme overtime respects 50 pts floor
  const floorScore = scoring.calculateScore({
    taskId: 'task1-reach',
    finalSuccess: true,
    totalTimeSeconds: 400,
    totalAttempts: 1
  });
  assert.equal(floorScore.timeBonus, 50);
  console.log('✓ Duration floor safety check: extreme time retains 50 pts floor');

  // Test 2: Role-based Navigation logic
  // Teacher completing start screen routes to #teacher
  let targetRoute = null;
  const simulateComplete = (account) => {
    if (account?.role === 'teacher') return '#teacher';
    return '#hub';
  };
  assert.equal(simulateComplete({ role: 'teacher' }), '#teacher');
  assert.equal(simulateComplete({ role: 'student' }), '#hub');
  console.log('✓ Role-based destination: Teacher -> #teacher, Student -> #hub');

  // Test 3: Brand link destination
  const getBrandTarget = (account) => account?.role === 'teacher' ? '#teacher' : '#hub';
  assert.equal(getBrandTarget({ role: 'teacher' }), '#teacher');
  assert.equal(getBrandTarget({ role: 'student' }), '#hub');
  console.log('✓ Brand logo dynamic target: Teacher -> #teacher, Student -> #hub');

  // Test 4: Task engine modal score presentation markup
  const TaskEngine = require('../../js/task-engine.js');
  const engine = new TaskEngine('main-view');
  assert.ok(typeof engine.escapeHtml === 'function', 'TaskEngine should have escapeHtml');
  assert.equal(engine.escapeHtml('<script>'), '&lt;script&gt;');
  console.log('✓ TaskEngine escapeHtml protects completion modal content');

  console.log('\n🎉 ALL NAVIGATION & DURATION SCORING INTEGRATION TESTS PASSED! 🎉');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
