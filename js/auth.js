/**
 * ROBOT MATH LAB - AUTH & FIREBASE GATE
 * Quản lý xác thực người dùng qua Firebase Authentication & Realtime Database.
 * Hỗ trợ tạo tài khoản, đăng nhập, chế độ học sinh khách (Guest Mode) và dự phòng Offline.
 */
(function () {
  'use strict';

  const overlayId = 'rml-auth-overlay';
  const langKey = 'rml_language';
  const langKeyAlt = 'rml_ui_language';

  const state = {
    account: null,
    authenticated: false,
    overlay: null,
    mode: 'login',
    readyResolved: false,
    booting: false,
  };

  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  const lang = (() => {
    const stored = localStorage.getItem(langKey) || localStorage.getItem(langKeyAlt);
    if (stored === 'vi' || stored === 'en') return stored;
    if (window.I18N && (window.I18N.currentLang === 'vi' || window.I18N.currentLang === 'en')) {
      return window.I18N.currentLang;
    }
    return 'vi';
  })();

  const TEXT = {
    vi: {
      loading: 'Đang kết nối phòng thí nghiệm...',
      kicker: 'TOÁN CHUYỂN ĐỘNG & ROBOT',
      title: 'Chào mừng em đến với Robot Math Lab!',
      subtitle: 'Đăng nhập để lưu tiến độ và đồng bộ dữ liệu bài học trên Firebase Realtime Database.',
      loginTab: 'Đăng nhập',
      registerTab: 'Tạo tài khoản',
      username: 'Tên đăng nhập hoặc Email',
      usernameHint: 'Ví dụ: minhanh01 hoặc em@gmail.com',
      password: 'Mật khẩu',
      passwordHint: 'Ít nhất 6 ký tự',
      confirm: 'Nhập lại mật khẩu',
      displayName: 'Tên hiển thị của em',
      displayNameHint: 'Tên em muốn robot Sparky gọi trong bài học',
      consent: 'Em đồng ý để hệ thống lưu tiến độ và dữ liệu học tập trên nền tảng Firebase.',
      loginBtn: 'Vào phòng học',
      registerBtn: 'Tạo tài khoản và vào học',
      guestBtn: '🚀 Trải nghiệm ngay (Chế độ Khách)',
      guestNote: 'Thử nghiệm nhanh mà không cần tạo tài khoản',
      orDivider: 'hoặc',
      forgot: 'Quên mật khẩu? Hãy nhờ thầy cô hoặc phụ huynh hỗ trợ đặt lại.',
      privacy: 'Dữ liệu học tập được lưu trữ an toàn trên Google Firebase Cloud Database.',
      logout: 'Đăng xuất',
      retry: 'Thử lại',
      maintenance: 'Hệ thống đang bảo trì hoặc chưa kết nối được máy chủ. Vui lòng thử lại.',
      network: 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.',
      required: 'Vui lòng điền đầy đủ thông tin.',
      passwordMismatch: 'Mật khẩu nhập lại không khớp.',
      usernameInvalid: 'Tên đăng nhập từ 3-24 ký tự hoặc email hợp lệ.',
      passwordShort: 'Mật khẩu phải có ít nhất 6 ký tự.',
      displayNameMissing: 'Vui lòng nhập tên hiển thị của em.',
      consentMissing: 'Em cần đồng ý lưu dữ liệu học tập.',
      accountPanel: 'Tài khoản học sinh',
      noClass: 'Chưa có lớp',
      logoutConfirm: 'Em có chắc muốn đăng xuất khỏi tài khoản này?',
      logoutFailed: 'Không đăng xuất được. Vui lòng thử lại.',
      langButton: 'EN',
      firebaseConnected: '🔥 Firebase Realtime: Đã kết nối',
      firebaseOffline: '⚡ Chế độ Cục bộ (Local Demo)',
    },
    en: {
      loading: 'Connecting to Robot Math Lab...',
      kicker: 'MATH & ROBOTICS LEARNING LAB',
      title: 'Welcome to Robot Math Lab!',
      subtitle: 'Sign in to save your progress and sync learning logs on Firebase Realtime Database.',
      loginTab: 'Sign in',
      registerTab: 'Create account',
      username: 'Username or Email',
      usernameHint: 'e.g. alex2026 or you@example.com',
      password: 'Password',
      passwordHint: 'At least 6 characters',
      confirm: 'Confirm password',
      displayName: 'Your display name',
      displayNameHint: 'The nickname Sparky calls you during missions',
      consent: 'I agree to have my learning progress safely recorded on Firebase Cloud.',
      loginBtn: 'Enter the lab',
      registerBtn: 'Create account and start',
      guestBtn: '🚀 Quick Explore (Guest Mode)',
      guestNote: 'Try the lab immediately without creating an account',
      orDivider: 'or',
      forgot: 'Forgot your password? Ask your teacher or parent to help reset it.',
      privacy: 'Your learning process is protected on Google Firebase Cloud Database.',
      logout: 'Sign out',
      retry: 'Retry',
      maintenance: 'The system is under maintenance. Please try again.',
      network: 'Cannot reach the server. Check your connection and try again.',
      required: 'Please fill in all fields.',
      passwordMismatch: 'The passwords do not match.',
      usernameInvalid: 'Username must be 3-24 characters or a valid email.',
      passwordShort: 'Password must be at least 6 characters.',
      displayNameMissing: 'Please enter your display name.',
      consentMissing: 'Please agree to the learning data notice.',
      accountPanel: 'Student Account',
      noClass: 'No class',
      logoutConfirm: 'Are you sure you want to sign out?',
      logoutFailed: 'Could not sign out. Please try again.',
      langButton: 'VIE',
      firebaseConnected: '🔥 Firebase Realtime: Connected',
      firebaseOffline: '⚡ Local Demo Mode',
    },
  };

  const t = TEXT[lang] || TEXT.vi;

  function activeText() {
    const active = (window.I18N && window.I18N.currentLang) || lang;
    return TEXT[active] || t;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function setBackgroundInert(inert) {
    for (const el of document.body.children) {
      if (el.id === overlayId) continue;
      if (['SCRIPT', 'STYLE', 'LINK', 'META'].includes(el.tagName)) continue;
      if (inert) {
        el.setAttribute('aria-hidden', 'true');
        el.inert = true;
      } else {
        el.removeAttribute('aria-hidden');
        el.inert = false;
      }
    }
  }

  function ensureOverlay() {
    if (state.overlay && document.body.contains(state.overlay)) return state.overlay;
    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'rml-auth-overlay';
    document.body.appendChild(overlay);
    state.overlay = overlay;
    document.documentElement.classList.add('rml-auth-pending');
    document.body.classList.add('rml-auth-locked');
    setBackgroundInert(true);
    return overlay;
  }

  function removeOverlay() {
    if (state.overlay) {
      state.overlay.remove();
      state.overlay = null;
    }
    setBackgroundInert(false);
    document.documentElement.classList.remove('rml-auth-pending');
    document.body.classList.remove('rml-auth-locked');
  }

  function renderLoading() {
    const overlay = ensureOverlay();
    overlay.innerHTML = `
      <div class="rml-auth-card rml-auth-loading" role="status" aria-live="polite">
        <div class="rml-auth-spinner" aria-hidden="true"></div>
        <p>${escapeHtml(t.loading)}</p>
      </div>
    `;
  }

  function field(id, name, label, hint, type = 'text', autocomplete = '') {
    return `
      <div class="rml-auth-field">
        <label for="${id}">${escapeHtml(label)}</label>
        <input id="${id}" name="${name}" type="${type}" autocomplete="${autocomplete}" />
        ${hint ? `<small>${escapeHtml(hint)}</small>` : ''}
      </div>
    `;
  }

  function renderGate() {
    const overlay = ensureOverlay();
    const isOnline = window.FirebaseService?.isOnline;
    const statusClass = isOnline ? 'status-online' : 'status-local';
    const statusText = isOnline ? t.firebaseConnected : t.firebaseOffline;

    overlay.innerHTML = `
      <div class="rml-auth-card" role="dialog" aria-modal="true" aria-labelledby="rml-auth-title">
        <div class="rml-auth-top">
          <div class="rml-auth-brand">
            <span class="rml-auth-robot" aria-hidden="true">🤖</span>
            <div>
              <span class="rml-auth-kicker">${escapeHtml(t.kicker)}</span>
              <strong>Robot Math Lab</strong>
            </div>
          </div>
          <button type="button" class="rml-auth-lang" id="rml-auth-lang">${escapeHtml(t.langButton)}</button>
        </div>

        <div class="rml-db-badge-wrap">
          <span class="rml-db-badge ${statusClass}">${escapeHtml(statusText)}</span>
        </div>

        <h1 id="rml-auth-title">${escapeHtml(t.title)}</h1>
        <p class="rml-auth-subtitle">${escapeHtml(t.subtitle)}</p>

        <div class="rml-auth-tabs" role="tablist" aria-label="Login or register">
          <button type="button" class="rml-auth-tab active" data-tab="login" role="tab" aria-selected="true">${escapeHtml(t.loginTab)}</button>
          <button type="button" class="rml-auth-tab" data-tab="register" role="tab" aria-selected="false">${escapeHtml(t.registerTab)}</button>
        </div>

        <!-- FORM ĐĂNG NHẬP -->
        <form id="rml-login-form" class="rml-auth-form" novalidate>
          ${field('rml-login-username', 'username', t.username, t.usernameHint, 'text', 'username')}
          ${field('rml-login-password', 'password', t.password, '', 'password', 'current-password')}
          <div id="rml-login-error" class="rml-auth-error" role="alert" hidden></div>
          <button type="submit" class="rml-auth-submit">${escapeHtml(t.loginBtn)}</button>

          <div class="rml-auth-divider">
            <span>${escapeHtml(t.orDivider)}</span>
          </div>

          <button type="button" class="rml-auth-guest-btn" id="rml-auth-guest-btn">
            ${escapeHtml(t.guestBtn)}
          </button>
          <p class="rml-auth-note rml-center-note">${escapeHtml(t.guestNote)}</p>
        </form>

        <!-- FORM ĐĂNG KÝ TÀI KHOẢN -->
        <form id="rml-register-form" class="rml-auth-form" hidden novalidate>
          ${field('rml-register-name', 'display_name', t.displayName, t.displayNameHint, 'text', 'nickname')}
          ${field('rml-register-username', 'username', t.username, t.usernameHint, 'text', 'username')}
          ${field('rml-register-password', 'password', t.password, t.passwordHint, 'password', 'new-password')}
          ${field('rml-register-confirm', 'password_confirm', t.confirm, '', 'password', 'new-password')}
          <label class="rml-auth-consent">
            <input type="checkbox" name="consent" checked />
            <span>${escapeHtml(t.consent)}</span>
          </label>
          <div id="rml-register-error" class="rml-auth-error" role="alert" hidden></div>
          <button type="submit" class="rml-auth-submit">${escapeHtml(t.registerBtn)}</button>
        </form>

        <p class="rml-auth-privacy">${escapeHtml(t.privacy)}</p>
      </div>
    `;

    // Nút chuyển ngôn ngữ
    const languageButton = overlay.querySelector('#rml-auth-lang');
    if (languageButton) {
      languageButton.addEventListener('click', () => {
        const next = lang === 'vi' ? 'en' : 'vi';
        localStorage.setItem(langKey, next);
        localStorage.setItem(langKeyAlt, next);
        location.reload();
      });
    }

    // Chuyển Tab Đăng nhập / Đăng ký
    overlay.querySelectorAll('[data-tab]').forEach((button) => {
      button.addEventListener('click', () => showTab(button.dataset.tab));
    });

    const loginForm = overlay.querySelector('#rml-login-form');
    const registerForm = overlay.querySelector('#rml-register-form');
    const guestBtn = overlay.querySelector('#rml-auth-guest-btn');
    const loginUsername = overlay.querySelector('#rml-login-username');

    if (loginForm) loginForm.addEventListener('submit', onLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', onRegisterSubmit);
    if (guestBtn) guestBtn.addEventListener('click', onGuestSubmit);

    showTab('login');
    if (loginUsername) loginUsername.focus();
  }

  function showTab(mode) {
    state.mode = mode === 'register' ? 'register' : 'login';
    const overlay = state.overlay;
    if (!overlay) return;

    overlay.querySelectorAll('[data-tab]').forEach((button) => {
      const active = button.dataset.tab === state.mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });

    const loginForm = overlay.querySelector('#rml-login-form');
    const registerForm = overlay.querySelector('#rml-register-form');
    if (loginForm) loginForm.hidden = state.mode !== 'login';
    if (registerForm) registerForm.hidden = state.mode !== 'register';
    clearError('login');
    clearError('register');

    const focusId = state.mode === 'login' ? 'rml-login-username' : 'rml-register-name';
    const focusEl = overlay.querySelector(`#${focusId}`);
    if (focusEl) focusEl.focus();
  }

  function setBusy(form, busy) {
    if (!form) return;
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    if (busy) {
      button.dataset.originalLabel = button.textContent;
      button.textContent = '...';
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
    } else {
      if (button.dataset.originalLabel) button.textContent = button.dataset.originalLabel;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  }

  function clearError(mode) {
    const el = state.overlay?.querySelector(`#rml-${mode}-error`);
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  function showError(mode, message) {
    const el = state.overlay?.querySelector(`#rml-${mode}-error`);
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
  }

  // =========================================================================
  // XỬ LÝ SUBMIT AUTH VỚI FIREBASE
  // =========================================================================

  async function onLoginSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    clearError('login');
    const data = new FormData(form);
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');

    if (!username || !password) {
      showError('login', t.required);
      return;
    }

    setBusy(form, true);
    try {
      if (window.FirebaseService) {
        const account = await window.FirebaseService.login({ username, password });
        if (account) {
          finish(account);
          return;
        }
      }
      showError('login', t.network);
    } catch (err) {
      showError('login', err.message || t.network);
    } finally {
      setBusy(form, false);
    }
  }

  async function onRegisterSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    clearError('register');
    const data = new FormData(form);
    const displayName = String(data.get('display_name') || '').trim();
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');
    const confirm = String(data.get('password_confirm') || '');
    const consent = data.get('consent') === 'on';

    if (!displayName) return showError('register', t.displayNameMissing);
    if (!username || username.length < 3) return showError('register', t.usernameInvalid);
    if (password.length < 6) return showError('register', t.passwordShort);
    if (password !== confirm) return showError('register', t.passwordMismatch);
    if (!consent) return showError('register', t.consentMissing);

    setBusy(form, true);
    try {
      if (window.FirebaseService) {
        const account = await window.FirebaseService.register({
          displayName,
          username,
          password
        });
        if (account) {
          finish(account);
          return;
        }
      }
      showError('register', t.network);
    } catch (err) {
      showError('register', err.message || t.network);
    } finally {
      setBusy(form, false);
    }
  }

  async function onGuestSubmit(event) {
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = '...';

    try {
      if (window.FirebaseService) {
        const account = await window.FirebaseService.loginAsGuest();
        if (account) {
          finish(account);
          return;
        }
      }
    } catch (err) {
      showError('login', err.message || t.network);
      button.disabled = false;
      button.textContent = activeText().guestBtn;
    }
  }

  function finish(account) {
    state.account = account;
    state.authenticated = true;

    localStorage.setItem('rml_student_name', account.display_name);
    localStorage.setItem('rml_account_id', String(account.id || account.uid));

    removeOverlay();

    if (!state.readyResolved) {
      state.readyResolved = true;
      resolveReady();
    }

    installAccountUI();

    if (window.App && typeof window.App.setStudentName === 'function') {
      window.App.setStudentName(account.display_name);
    }
  }

  function installAccountUI() {
    const body = document.querySelector('.settings-modal-body');
    if (!body) return;
    const text = activeText();

    let panel = document.getElementById('rml-account-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'rml-account-panel';
      panel.className = 'settings-row rml-account-panel';

      const labelWrap = document.createElement('div');
      labelWrap.className = 'settings-label-wrap';

      const icon = document.createElement('span');
      icon.className = 'settings-icon-bubble';
      icon.textContent = '👤';

      const textWrap = document.createElement('div');
      const label = document.createElement('span');
      label.className = 'settings-label';
      label.textContent = text.accountPanel;
      const hint = document.createElement('div');
      hint.className = 'settings-hint';
      hint.id = 'rml-account-meta';
      textWrap.appendChild(label);
      textWrap.appendChild(hint);

      labelWrap.appendChild(icon);
      labelWrap.appendChild(textWrap);

      const actions = document.createElement('div');
      actions.className = 'rml-account-actions';

      const logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'btn-settings-action-pill';
      logout.dataset.action = 'logout';
      logout.textContent = text.logout;
      logout.addEventListener('click', onLogoutClick);

      const error = document.createElement('div');
      error.id = 'rml-account-error';
      error.className = 'rml-auth-error';
      error.setAttribute('role', 'alert');
      error.hidden = true;

      actions.appendChild(logout);
      panel.appendChild(labelWrap);
      panel.appendChild(actions);
      panel.appendChild(error);
      body.appendChild(panel);
    }

    const label = panel.querySelector('.settings-label');
    if (label) label.textContent = text.accountPanel;
    const logoutButton = panel.querySelector('[data-action="logout"]');
    if (logoutButton) logoutButton.textContent = text.logout;

    const meta = panel.querySelector('#rml-account-meta');
    if (meta && state.account) {
      const modeIndicator = window.FirebaseService?.isOnline ? '🔥 Cloud' : '⚡ Local';
      meta.textContent = `${state.account.username || 'student'} · ${state.account.display_name} (${modeIndicator})`;
    }

    // Name input synchronization
    const nameInput = document.getElementById('settings-input-name');
    if (nameInput) {
      nameInput.readOnly = false;
      nameInput.value = state.account?.display_name || '';
    }
  }

  async function onLogoutClick(event) {
    const text = activeText();
    if (!window.confirm(text.logoutConfirm)) return;

    if (window.FirebaseService) {
      await window.FirebaseService.logout();
    }

    state.account = null;
    state.authenticated = false;
    localStorage.removeItem('rml_student_name');
    localStorage.removeItem('rml_account_id');
    location.reload();
  }

  async function updateDisplayName(displayName) {
    if (window.FirebaseService) {
      const updated = await window.FirebaseService.updateDisplayName(displayName);
      state.account = updated;
      localStorage.setItem('rml_student_name', updated.display_name);
      return updated;
    }
    return state.account;
  }

  async function bootstrap() {
    if (state.booting) return;
    state.booting = true;
    renderLoading();

    try {
      // 1. Chờ khởi tạo Firebase Service
      if (window.FirebaseService) {
        await window.FirebaseService.init();

        // 2. Nếu đã có tài khoản đang đăng nhập
        if (window.FirebaseService.account) {
          finish(window.FirebaseService.account);
          return;
        }
      }

      // 3. Nếu chưa đăng nhập, hiển thị màn hình cổng vào (Login/Register)
      renderGate();
    } catch (err) {
      console.warn('[RMLAuth] Bootstrap warning:', err);
      renderGate();
    } finally {
      state.booting = false;
    }
  }

  window.RMLAuth = {
    ready,
    get account() { return state.account; },
    get authenticated() { return state.authenticated; },
    updateDisplayName,
    logout: onLogoutClick,
    refresh: bootstrap,
    get firebaseService() { return window.FirebaseService; }
  };

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  window.addEventListener('languageChanged', () => {
    if (state.authenticated && state.account) installAccountUI();
  });

  // Che phủ ngay khi tải trang để bảo vệ trạng thái học tập
  if (document.body) {
    ensureOverlay();
    renderLoading();
  }

  onReady(bootstrap);
})();
