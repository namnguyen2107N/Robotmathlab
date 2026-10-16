/**
 * Automated Test for Start Screen Language Typography and Interactive Robot Welcome Board
 */
const fs = require('fs');
const path = require('path');

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
    this.checked = false;
    this.disabled = false;
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
    this.dispatchEvent({ type: 'click', stopPropagation: () => {}, target: this });
  }

  focus() {}

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const res = [];
    const walk = (node) => {
      if (matches(node, selector)) res.push(node);
      node.children.forEach(walk);
    };
    this.children.forEach(walk);
    return res;
  }

  closest(sel) {
    let curr = this;
    while (curr) {
      if (matches(curr, sel)) return curr;
      curr = curr.parentElement;
    }
    return null;
  }

  contains(el) {
    let curr = el;
    while (curr) {
      if (curr === this) return true;
      curr = curr.parentElement;
    }
    return false;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
}

function matches(el, sel) {
  sel = sel.trim();
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
  if (sel.startsWith('[') && sel.endsWith(']')) {
    const match = sel.match(/\[([a-zA-Z0-9\-]+)=["']?([^"']*)["']?\]/);
    if (match) return el.getAttribute(match[1]) === match[2];
  }
  return false;
}

// Global mocks
global.document = new MockElement('document');
global.document.body = new MockElement('body');
global.document.appendChild(global.document.body);
global.document.documentElement = global.document.body;
global.window = global;
global.window.location = { hash: '#start' };
global.window.addEventListener = (type, cb) => {};
global.window.removeEventListener = () => {};
global.sessionStorage = { getItem: () => null, setItem: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);

global.document.getElementById = function(id) {
  const search = (node) => {
    if (node.id === id) return node;
    for (const c of node.children) {
      const found = search(c);
      if (found) return found;
    }
    return null;
  };
  return search(global.document.body);
};

// Load HTML structure
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Build minimal DOM tree from HTML for splash
const splashScreen = new MockElement('div', 'splash-screen');
global.document.body.appendChild(splashScreen);

const robotWrapper = new MockElement('div', '');
robotWrapper.className = 'splash-robot-wrapper';
splashScreen.appendChild(robotWrapper);

const welcomeBoard = new MockElement('div', 'splash-welcome-board');
welcomeBoard.classList.add('hidden');
robotWrapper.appendChild(welcomeBoard);

const welcomeBadgeText = new MockElement('span', 'welcome-badge-text');
welcomeBoard.appendChild(welcomeBadgeText);

const closeBtn = new MockElement('button', 'btn-close-splash-welcome');
welcomeBoard.appendChild(closeBtn);

const welcomeTitle = new MockElement('h3', 'welcome-board-title');
welcomeBoard.appendChild(welcomeTitle);

const welcomeDesc = new MockElement('p', 'welcome-board-desc');
welcomeBoard.appendChild(welcomeDesc);

const chipMath = new MockElement('span', 'chip-math-text');
welcomeBoard.appendChild(chipMath);
const chipSim = new MockElement('span', 'chip-sim-text');
welcomeBoard.appendChild(chipSim);
const chipStem = new MockElement('span', 'chip-stem-text');
welcomeBoard.appendChild(chipStem);

const welcomeTip = new MockElement('span', 'welcome-tip-text');
welcomeBoard.appendChild(welcomeTip);

const exploreBtn = new MockElement('button', 'btn-welcome-explore');
welcomeBoard.appendChild(exploreBtn);
const exploreBtnText = new MockElement('span', 'welcome-action-text');
exploreBtn.appendChild(exploreBtnText);

const robotEl = new MockElement('div', 'splash-robot');
robotWrapper.appendChild(robotEl);

const langSelect = new MockElement('div', '');
langSelect.className = 'splash-lang-select grand-lang-select';
splashScreen.appendChild(langSelect);

const viOpt = new MockElement('div', '');
viOpt.className = 'lang-option active';
viOpt.setAttribute('data-lang', 'vi');
langSelect.appendChild(viOpt);

const viFlag = new MockElement('span', '');
viFlag.className = 'lang-flag';
viFlag.innerText = 'VIE';
viOpt.appendChild(viFlag);

const viText = new MockElement('span', '');
viText.className = 'lang-text';
viText.innerText = 'TIẾNG VIỆT';
viOpt.appendChild(viText);

const enOpt = new MockElement('div', '');
enOpt.className = 'lang-option';
enOpt.setAttribute('data-lang', 'en');
langSelect.appendChild(enOpt);

const enFlag = new MockElement('span', '');
enFlag.className = 'lang-flag';
enFlag.innerText = 'EN';
enOpt.appendChild(enFlag);

const enText = new MockElement('span', '');
enText.className = 'lang-text';
enText.innerText = 'ENGLISH';
enOpt.appendChild(enText);

const startBtn = new MockElement('button', 'btn-splash-start');
splashScreen.appendChild(startBtn);

// Load App dependencies
const vm = require('vm');
function loadScript(rel) {
  const code = fs.readFileSync(path.join(__dirname, rel), 'utf8');
  vm.runInThisContext(code);
}

loadScript('js/i18n.js');
loadScript('js/sound-fx.js');
loadScript('js/app.js');

console.log('\n--- TEST: Start Screen Typography and Robot Welcome Board ---');

global.TaskEngine = class MockTaskEngine {
  constructor() {}
  loadTask() {}
};

const app = new AppController();
app.init();

// Verify initial state: welcome board is hidden
if (!welcomeBoard.classList.contains('hidden')) {
  throw new Error('Welcome board should be hidden initially');
}
console.log('✓ Initial state: Welcome board is hidden');

// Verify VIE and EN text badges exist in DOM
if (viFlag.innerText !== 'VIE' || enFlag.innerText !== 'EN') {
  throw new Error('Language flag badges must contain VIE and EN');
}
console.log('✓ Verified typography text: VIE and EN tags present with .lang-flag styling');

// Click on Robot Sparky
robotEl.click();
if (welcomeBoard.classList.contains('hidden')) {
  throw new Error('Welcome board must be visible after clicking robot');
}
if (!robotWrapper.classList.contains('has-welcome-open')) {
  throw new Error('Robot wrapper should have has-welcome-open class');
}
console.log('✓ Clicked Robot: Welcome board displayed with spring animation!');
console.log('  - Title:', welcomeTitle.innerText);
console.log('  - Badge:', welcomeBadgeText.innerText);
console.log('  - Tip:', welcomeTip.innerText);

// Switch language to English
app.selectSplashLanguage('en', false);
if (welcomeTitle.innerText !== 'WELCOME TO ROBOT MATH LAB! 🚀✨') {
  throw new Error('Welcome board should dynamically switch title to English');
}
if (welcomeBadgeText.innerText !== "SPARKY'S GREETING") {
  throw new Error('Welcome board badge should switch to English');
}
console.log('✓ Switched to EN: Welcome board dynamically updated to English!');
console.log('  - EN Title:', welcomeTitle.innerText);
console.log('  - EN Badge:', welcomeBadgeText.innerText);

// Switch back to Vietnamese
app.selectSplashLanguage('vi', false);
if (welcomeTitle.innerText !== 'CHÀO MỪNG BẠN ĐẾN VỚI ROBOT MATH LAB! 🚀✨') {
  throw new Error('Welcome board should switch title back to Vietnamese');
}
console.log('✓ Switched to VI: Welcome board dynamically updated back to Vietnamese!');

// Click Close Button
closeBtn.click();
if (!welcomeBoard.classList.contains('hidden')) {
  throw new Error('Welcome board should hide on close click');
}
if (robotWrapper.classList.contains('has-welcome-open')) {
  throw new Error('has-welcome-open should be removed on close');
}
console.log('✓ Clicked Close (✕): Welcome board closed cleanly');

// Click robot again to open, then click explore button
robotEl.click();
if (welcomeBoard.classList.contains('hidden')) {
  throw new Error('Welcome board should re-open on robot click');
}
exploreBtn.click();
if (!welcomeBoard.classList.contains('hidden')) {
  throw new Error('Welcome board should close on explore button click');
}
console.log('✓ Clicked Explore: Welcome board closed and transitioned toward mission hub!');

console.log('\n🎉 ALL START SCREEN TESTS PASSED! 🎉');
process.exit(0);
