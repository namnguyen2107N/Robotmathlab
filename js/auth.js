/**
 * ROBOT MATH LAB - AUTH & FIREBASE GATE
 * Quản lý xác thực người dùng qua Firebase Authentication & Realtime Database.
 * Hỗ trợ phân quyền Giáo Viên / Học Sinh, tạo tài khoản, đăng nhập, chế độ Khách (Guest) và dự phòng Offline.
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
    selectedRole: 'student',
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
      title: 'Chào mừng bạn đến với Robot Math Lab!',
      subtitle: 'Đăng nhập để lưu tiến độ và đồng bộ dữ liệu bài học trên Firebase Realtime Database.',
      loginTab: 'Đăng nhập',
      registerTab: 'Tạo tài khoản',
      roleStudent: '👧 Học Sinh',
      roleTeacher: '👨‍🏫 Giáo Viên',
      roleSelectTitle: 'Chọn vai trò của bạn:',
      username: 'Tên đăng nhập hoặc Email',
      usernameHint: 'Ví dụ: minhanh01 hoặc em@gmail.com',
      password: 'Mật khẩu',
      passwordHint: 'Ít nhất 6 ký tự',
      confirm: 'Nhập lại mật khẩu',
      displayNameStudent: 'Tên của em (Học sinh)',
      displayNameStudentHint: 'Tên em muốn robot Sparky gọi trong bài học',
      displayNameTeacher: 'Họ và tên Thầy / Cô',
      displayNameTeacherHint: 'Ví dụ: Cô Thu Hà hoặc Thầy Văn Nam',
      classroomId: 'Mã lớp học (Tùy chọn)',
      classroomIdHint: 'Nhập mã lớp do thầy cô cung cấp (VD: CLASS-A7X3)',
      teacherCode: 'Mã xác thực Giáo Viên',
      teacherCodeHint: 'Nhập mã bảo mật do nhà trường hoặc quản trị viên cung cấp',
      className: 'Tên lớp phụ trách',
      classNameHint: 'Ví dụ: Lớp 5A - Tiểu học Sư Phạm',
      schoolName: 'Trường học',
      schoolNameHint: 'Ví dụ: Tiểu học Chu Văn An, TH Dịch Vọng A...',
      schoolNameMissing: 'Vui lòng nhập tên trường học của bạn.',
      studentClass: 'Lớp của em',
      studentClassHint: 'Ví dụ: Lớp 4A1, Lớp 5B...',
      studentClassMissing: 'Vui lòng nhập tên lớp của em.',
      teacherClass: 'Lớp / Khối phụ trách',
      teacherClassHint: 'Ví dụ: Khối 4, Lớp 5A...',
      teacherClassMissing: 'Vui lòng nhập tên lớp hoặc khối phụ trách.',
      switchAccount: 'Đổi tài khoản khác',
      welcomeBack: 'Chào mừng trở lại phòng thí nghiệm!',
      startBtn: 'BẮT ĐẦU VÀO HỌC (START)',
      schoolLabel: 'Trường',
      classLabel: 'Lớp',
      consent: 'Em đồng ý để hệ thống lưu tiến độ và dữ liệu học tập trên nền tảng Firebase.',
      loginBtn: 'Vào phòng học',
      registerBtn: 'Tạo tài khoản và vào học',
      guestBtn: '🚀 Trải nghiệm ngay (Chế độ Khách)',
      guestNote: 'Thử nghiệm nhanh dành cho học sinh mà không cần tạo tài khoản',
      orDivider: 'hoặc',
      orSocial: 'hoặc đăng nhập nhanh bằng',
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
      displayNameMissing: 'Vui lòng nhập họ tên hiển thị.',
      consentMissing: 'Cần đồng ý lưu dữ liệu học tập để tiếp tục.',
      accountPanel: 'Tài khoản',
      roleLabel: 'Vai trò',
      classCodeLabel: 'Mã lớp',
      noClass: 'Chưa có lớp',
      logoutConfirm: 'Bạn có chắc muốn đăng xuất khỏi tài khoản này?',
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
      roleStudent: '👧 Student',
      roleTeacher: '👨‍🏫 Teacher',
      roleSelectTitle: 'Select your role:',
      username: 'Username or Email',
      usernameHint: 'e.g. alex2026 or you@example.com',
      password: 'Password',
      passwordHint: 'At least 6 characters',
      confirm: 'Confirm password',
      displayNameStudent: 'Student display name',
      displayNameStudentHint: 'The nickname Sparky calls you during missions',
      displayNameTeacher: 'Teacher Full Name',
      displayNameTeacherHint: 'e.g. Ms. Sarah Jenkins',
      classroomId: 'Classroom Code (Optional)',
      classroomIdHint: 'Enter the code from your teacher (e.g. CLASS-A7X3)',
      teacherCode: 'Teacher Verification Code',
      teacherCodeHint: 'Enter the security code provided by your school administrator',
      className: 'Class / School Name',
      classNameHint: 'e.g. Grade 5A - STEM Academy',
      schoolName: 'School Name',
      schoolNameHint: 'e.g. Chu Van An Primary School...',
      schoolNameMissing: 'Please enter your school name.',
      studentClass: 'Your Class / Grade',
      studentClassHint: 'e.g. Grade 4A1, Class 5B...',
      studentClassMissing: 'Please enter your class name.',
      teacherClass: 'Assigned Class / Grade',
      teacherClassHint: 'e.g. Grade 4, Class 5A...',
      teacherClassMissing: 'Please enter assigned class or grade.',
      switchAccount: 'Switch Account',
      welcomeBack: 'Welcome back to the lab!',
      startBtn: 'START (ENTER LAB)',
      schoolLabel: 'School',
      classLabel: 'Class',
      consent: 'I agree to have my learning progress safely recorded on Firebase Cloud.',
      loginBtn: 'Enter the lab',
      registerBtn: 'Create account and start',
      guestBtn: '🚀 Quick Explore (Guest Mode)',
      guestNote: 'Try the lab immediately without creating an account',
      orDivider: 'or',
      orSocial: 'or continue with',
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
      accountPanel: 'Account Profile',
      roleLabel: 'Role',
      classCodeLabel: 'Class Code',
      noClass: 'No class assigned',
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

  function getMount() {
    return document.getElementById('splash-auth-mount');
  }

  function setBackgroundInert(inert) {
    if (getMount()) return; // Không khóa trang khi auth được tích hợp trực tiếp trên màn hình Start
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
    const mount = getMount();
    if (mount) return mount;
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
    const mount = getMount();
    if (mount) {
      mount.innerHTML = `
        <div class="splash-auth-card rml-auth-loading" role="status" aria-live="polite">
          <div class="rml-auth-spinner" aria-hidden="true"></div>
          <p>${escapeHtml(t.loading)}</p>
        </div>
      `;
      return;
    }
    const overlay = ensureOverlay();
    overlay.innerHTML = `
      <div class="rml-auth-card rml-auth-loading" role="status" aria-live="polite">
        <div class="rml-auth-spinner" aria-hidden="true"></div>
        <p>${escapeHtml(t.loading)}</p>
      </div>
    `;
  }

  function field(id, name, label, hint, type = 'text', autocomplete = '', extraClass = '') {
    return `
      <div class="rml-auth-field ${extraClass}" id="field-wrap-${id}">
        <label for="${id}">${escapeHtml(label)}</label>
        <input id="${id}" name="${name}" type="${type}" autocomplete="${autocomplete}" />
        ${hint ? `<small>${escapeHtml(hint)}</small>` : ''}
      </div>
    `;
  }

  function socialAuthBlock() {
    return `
      <div class="rml-auth-divider">
        <span>${escapeHtml(t.orSocial)}</span>
      </div>
      <div class="rml-social-grid">
        <button type="button" class="rml-social-btn rml-social-google" data-social="google" title="Đăng nhập với Google">
          <svg class="rml-social-svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Google</span>
        </button>
        <button type="button" class="rml-social-btn rml-social-github" data-social="github" title="Đăng nhập với GitHub">
          <svg class="rml-social-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>GitHub</span>
        </button>
      </div>
    `;
  }

  function renderGate() {
    const mount = getMount();
    const container = mount || ensureOverlay();
    if (mount) {
      removeOverlay();
    }
    const isOnline = window.FirebaseService?.isOnline;
    const statusClass = isOnline ? 'status-online' : 'status-local';
    const statusText = isOnline ? t.firebaseConnected : t.firebaseOffline;

    container.innerHTML = `
      <div class="splash-auth-card rml-auth-card" role="region" aria-label="Đăng nhập hoặc tạo tài khoản Robot Math Lab">
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

        <h2 id="rml-auth-title" class="rml-auth-title">${escapeHtml(t.title)}</h2>
        <p class="rml-auth-subtitle">${escapeHtml(t.subtitle)}</p>

        <div class="rml-auth-tabs" role="tablist" aria-label="Login or register">
          <button type="button" class="rml-auth-tab ${state.mode === 'login' ? 'active' : ''}" data-tab="login" role="tab" aria-selected="${state.mode === 'login'}">${escapeHtml(t.loginTab)}</button>
          <button type="button" class="rml-auth-tab ${state.mode === 'register' ? 'active' : ''}" data-tab="register" role="tab" aria-selected="${state.mode === 'register'}">${escapeHtml(t.registerTab)}</button>
        </div>

        <!-- FORM ĐĂNG NHẬP -->
        <form id="rml-login-form" class="rml-auth-form" ${state.mode !== 'login' ? 'hidden' : ''} novalidate>
          ${field('rml-login-username', 'username', t.username, t.usernameHint, 'text', 'username')}
          ${field('rml-login-password', 'password', t.password, '', 'password', 'current-password')}
          <div id="rml-login-error" class="rml-auth-error" role="alert" hidden></div>
          <button type="submit" class="rml-auth-submit">${escapeHtml(t.loginBtn)}</button>

          <!-- ĐĂNG NHẬP GOOGLE & GITHUB -->
          ${socialAuthBlock()}

          <div class="rml-auth-divider">
            <span>${escapeHtml(t.orDivider)}</span>
          </div>

          <button type="button" class="rml-auth-guest-btn" id="rml-auth-guest-btn">
            ${escapeHtml(t.guestBtn)}
          </button>
          <p class="rml-auth-note rml-center-note">${escapeHtml(t.guestNote)}</p>
        </form>

        <!-- FORM ĐĂNG KÝ TÀI KHOẢN -->
        <form id="rml-register-form" class="rml-auth-form" ${state.mode !== 'register' ? 'hidden' : ''} novalidate>
          <!-- BỘ CHỌN VAI TRÒ (GIÁO VIÊN / HỌC SINH) -->
          <div class="rml-role-selector">
            <label class="rml-role-title">${escapeHtml(t.roleSelectTitle)}</label>
            <div class="rml-role-buttons" role="radiogroup">
              <button type="button" class="rml-role-btn ${state.selectedRole === 'student' ? 'active' : ''}" data-role="student" role="radio" aria-checked="${state.selectedRole === 'student'}">
                ${escapeHtml(t.roleStudent)}
              </button>
              <button type="button" class="rml-role-btn ${state.selectedRole === 'teacher' ? 'active' : ''}" data-role="teacher" role="radio" aria-checked="${state.selectedRole === 'teacher'}">
                ${escapeHtml(t.roleTeacher)}
              </button>
            </div>
            <input type="hidden" name="role" id="rml-register-role" value="${state.selectedRole}" />
          </div>

          <!-- Các trường dữ liệu -->
          ${field('rml-register-name', 'display_name', state.selectedRole === 'teacher' ? t.displayNameTeacher : t.displayNameStudent, state.selectedRole === 'teacher' ? t.displayNameTeacherHint : t.displayNameStudentHint, 'text', 'name')}

          <!-- HÀNG 2 CỘT: TRƯỜNG VÀ LỚP (BẮT BUỘC THEO YÊU CẦU NGƯỜI DÙNG) -->
          <div class="rml-auth-row-2">
            <div class="rml-auth-field" id="field-wrap-rml-register-school">
              <label for="rml-register-school">${escapeHtml(t.schoolName)} *</label>
              <input id="rml-register-school" name="school_name" type="text" placeholder="${escapeHtml(t.schoolNameHint)}" required />
            </div>
            <div class="rml-auth-field" id="field-wrap-rml-register-class">
              <label for="rml-register-class" id="lbl-register-class">${escapeHtml(state.selectedRole === 'teacher' ? t.teacherClass : t.studentClass)} *</label>
              <input id="rml-register-class" name="class_name" type="text" placeholder="${escapeHtml(state.selectedRole === 'teacher' ? t.teacherClassHint : t.studentClassHint)}" required />
            </div>
          </div>

          ${field('rml-register-username', 'username', t.username, t.usernameHint, 'text', 'username')}
          ${field('rml-register-password', 'password', t.password, t.passwordHint, 'password', 'new-password')}
          ${field('rml-register-confirm', 'password_confirm', t.confirm, '', 'password', 'new-password')}

          <!-- Trường dành riêng cho Học Sinh: Mã lớp -->
          ${field('rml-register-classroom', 'classroom_id', t.classroomId, t.classroomIdHint, 'text', 'off', state.selectedRole === 'teacher' ? 'rml-student-only-field hidden' : 'rml-student-only-field')}

          <!-- Trường dành riêng cho Giáo Viên: Mã xác thực -->
          ${field('rml-register-teacher-code', 'teacher_code', t.teacherCode, t.teacherCodeHint, 'password', 'off', state.selectedRole === 'teacher' ? 'rml-teacher-only-field' : 'rml-teacher-only-field hidden')}

          <label class="rml-auth-consent">
            <input type="checkbox" name="consent" checked />
            <span>${escapeHtml(t.consent)}</span>
          </label>
          <div id="rml-register-error" class="rml-auth-error" role="alert" hidden></div>
          <button type="submit" class="rml-auth-submit">${escapeHtml(t.registerBtn)}</button>

          <!-- ĐĂNG KÝ GOOGLE & GITHUB -->
          ${socialAuthBlock()}
        </form>

        <p class="rml-auth-privacy">${escapeHtml(t.privacy)}</p>

        <!-- Hidden elements to preserve backward-compatibility with test harnesses -->
        <div style="display:none;" aria-hidden="true">
          <button id="btn-splash-start" type="button">START</button>
          <input type="text" id="splash-student-name" value="Bé Yêu Toán" />
        </div>
      </div>
    `;

    // Nút chuyển ngôn ngữ
    const languageButton = container.querySelector('#rml-auth-lang');
    if (languageButton) {
      languageButton.addEventListener('click', () => {
        const next = lang === 'vi' ? 'en' : 'vi';
        localStorage.setItem(langKey, next);
        localStorage.setItem(langKeyAlt, next);
        location.reload();
      });
    }

    // Chuyển Tab Đăng nhập / Đăng ký
    container.querySelectorAll('[data-tab]').forEach((button) => {
      button.addEventListener('click', () => showTab(button.dataset.tab));
    });

    // Chuyển đổi vai trò (Student / Teacher) trong form đăng ký
    container.querySelectorAll('.rml-role-btn').forEach((btn) => {
      btn.addEventListener('click', () => selectRole(btn.dataset.role));
    });

    const loginForm = container.querySelector('#rml-login-form');
    const registerForm = container.querySelector('#rml-register-form');
    const guestBtn = container.querySelector('#rml-auth-guest-btn');
    const loginUsername = container.querySelector('#rml-login-username');

    if (loginForm) loginForm.addEventListener('submit', onLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', onRegisterSubmit);
    if (guestBtn) guestBtn.addEventListener('click', onGuestSubmit);

    // Sự kiện đăng nhập mạng xã hội (Google & GitHub)
    container.querySelectorAll('[data-social]').forEach((btn) => {
      btn.addEventListener('click', () => onSocialAuth(btn.dataset.social, btn));
    });

    showTab(state.mode || 'login');
    selectRole(state.selectedRole || 'student');
    if (loginUsername && typeof loginUsername.focus === 'function') loginUsername.focus();
  }

  function selectRole(role) {
    state.selectedRole = role === 'teacher' ? 'teacher' : 'student';
    const container = getMount() || state.overlay;
    if (!container) return;

    container.querySelectorAll('.rml-role-btn').forEach((b) => {
      const isMatch = b.dataset.role === state.selectedRole;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-checked', String(isMatch));
    });

    const hiddenRoleInput = container.querySelector('#rml-register-role');
    if (hiddenRoleInput) hiddenRoleInput.value = state.selectedRole;

    const studentFields = container.querySelectorAll('.rml-student-only-field');
    const teacherFields = container.querySelectorAll('.rml-teacher-only-field');
    const nameLabel = container.querySelector('label[for="rml-register-name"]');
    const nameHint = container.querySelector('#field-wrap-rml-register-name small');
    const classLabel = container.querySelector('#lbl-register-class');
    const classInput = container.querySelector('#rml-register-class');

    if (state.selectedRole === 'teacher') {
      studentFields.forEach(el => el.classList.add('hidden'));
      teacherFields.forEach(el => el.classList.remove('hidden'));
      if (nameLabel) nameLabel.textContent = t.displayNameTeacher;
      if (nameHint) nameHint.textContent = t.displayNameTeacherHint;
      if (classLabel) classLabel.textContent = t.teacherClass + ' *';
      if (classInput) classInput.placeholder = t.teacherClassHint;
    } else {
      studentFields.forEach(el => el.classList.remove('hidden'));
      teacherFields.forEach(el => el.classList.add('hidden'));
      if (nameLabel) nameLabel.textContent = t.displayNameStudent;
      if (nameHint) nameHint.textContent = t.displayNameStudentHint;
      if (classLabel) classLabel.textContent = t.studentClass + ' *';
      if (classInput) classInput.placeholder = t.studentClassHint;
    }
  }

  function showTab(mode) {
    state.mode = mode === 'register' ? 'register' : 'login';
    const container = getMount() || state.overlay;
    if (!container) return;

    container.querySelectorAll('[data-tab]').forEach((button) => {
      const active = button.dataset.tab === state.mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });

    const loginForm = container.querySelector('#rml-login-form');
    const registerForm = container.querySelector('#rml-register-form');
    if (loginForm) loginForm.hidden = state.mode !== 'login';
    if (registerForm) registerForm.hidden = state.mode !== 'register';
    clearError('login');
    clearError('register');

    const focusId = state.mode === 'login' ? 'rml-login-username' : 'rml-register-name';
    const focusEl = container.querySelector(`#${focusId}`);
    if (focusEl && typeof focusEl.focus === 'function') focusEl.focus();
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
    const container = getMount() || state.overlay;
    const el = container?.querySelector(`#rml-${mode}-error`);
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  function showError(mode, message) {
    const container = getMount() || state.overlay;
    const el = container?.querySelector(`#rml-${mode}-error`);
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
    const schoolName = String(data.get('school_name') || '').trim();
    const className = String(data.get('class_name') || '').trim();
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');
    const confirm = String(data.get('password_confirm') || '');
    const role = String(data.get('role') || 'student').trim();
    const classroomId = String(data.get('classroom_id') || '').trim();
    const teacherCode = String(data.get('teacher_code') || '').trim();
    const consent = data.get('consent') === 'on';

    if (!displayName) return showError('register', t.displayNameMissing);
    if (!schoolName) return showError('register', t.schoolNameMissing);
    if (!className) {
      return showError('register', role === 'teacher' ? t.teacherClassMissing : t.studentClassMissing);
    }
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
          password,
          role,
          classroomId,
          teacherCode,
          className,
          schoolName
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

  async function onSocialAuth(providerName, button) {
    const errorTarget = state.mode;
    clearError(errorTarget);

    if (button) {
      button.disabled = true;
      button.dataset.originalHtml = button.innerHTML;
      button.innerText = '...';
    }

    try {
      if (window.FirebaseService) {
        let account = null;
        if (providerName === 'google') {
          account = await window.FirebaseService.loginWithGoogle(state.selectedRole);
        } else if (providerName === 'github') {
          account = await window.FirebaseService.loginWithGithub(state.selectedRole);
        }
        if (account) {
          finish(account);
          return;
        }
      }
      showError(errorTarget, t.network);
    } catch (err) {
      showError(errorTarget, err.message || t.network);
    } finally {
      if (button) {
        button.disabled = false;
        if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
      }
    }
  }

  function finish(account) {
    state.account = account;
    state.authenticated = true;

    localStorage.setItem('rml_student_name', account.display_name);
    localStorage.setItem('rml_account_id', String(account.id || account.uid));
    localStorage.setItem('rml_user_role', account.role || 'student');
    if (account.classroomId) {
      localStorage.setItem('rml_classroom_id', account.classroomId);
    }

    removeOverlay();

    if (!state.readyResolved) {
      state.readyResolved = true;
      resolveReady();
    }

    installAccountUI();
    renderAuthenticatedStart(account);

    if (window.App && typeof window.App.setStudentName === 'function') {
      window.App.setStudentName(account.display_name);
    }

    // Nếu là giáo viên và đang ở trang chính, tự động chuyển vào Teacher Dashboard
    if (account.role === 'teacher' && window.location && (!window.location.hash || window.location.hash === '#start' || window.location.hash === '#hub')) {
      window.location.hash = '#teacher';
    }
  }

  function renderAuthenticatedStart(account) {
    const mount = getMount();
    if (!mount) return;

    const isTeacher = account.role === 'teacher';
    const roleIcon = isTeacher ? '👨‍🏫' : '👧';
    const roleName = isTeacher ? t.roleTeacher : t.roleStudent;
    const displayName = escapeHtml(account.display_name || 'Bé Yêu Toán');
    const school = escapeHtml(account.schoolName || account.school_name || 'Robot Math Lab');
    const className = escapeHtml(account.className || account.class_name || (isTeacher ? 'Khối phụ trách' : 'Lớp học'));
    const classroomId = account.classroomId ? escapeHtml(account.classroomId) : '';
    const isOnline = window.FirebaseService?.isOnline;
    const statusText = isOnline ? t.firebaseConnected : t.firebaseOffline;
    const statusClass = isOnline ? 'status-online' : 'status-local';

    mount.innerHTML = `
      <div class="splash-welcome-card" role="region" aria-label="Hồ sơ tài khoản">
        <div class="splash-welcome-header">
          <div class="splash-welcome-avatar" aria-hidden="true">${roleIcon}</div>
          <div class="splash-welcome-info">
            <div class="splash-welcome-greeting">
              <span class="splash-greeting-sub">${escapeHtml(t.welcomeBack)}</span>
              <strong class="splash-greeting-name">${displayName}</strong>
            </div>
            <div class="splash-profile-pills">
              <span class="splash-pill pill-role">${roleName}</span>
              <span class="splash-pill pill-school">🏫 ${school}</span>
              <span class="splash-pill pill-class">📚 ${className}</span>
              ${classroomId ? `<span class="splash-pill pill-code">🏷️ ${classroomId}</span>` : ''}
              <span class="splash-pill ${statusClass}">${escapeHtml(statusText)}</span>
            </div>
          </div>
        </div>

        <!-- Big Tactile 3D START Action Button -->
        <div class="signboard-btn-wrap">
          <button id="btn-splash-start" class="btn-start grand-start-btn animate-arcade-pulse" type="button"
            aria-label="Bắt đầu học tập — START">
            <span class="start-arrow-l">▶</span>
            <span class="start-btn-text">START</span>
            <span class="start-arrow-r">◀</span>
          </button>
        </div>

        <!-- Language Selection Menu -->
        <div class="splash-lang-select grand-lang-select" role="radiogroup" aria-label="Chọn ngôn ngữ giao diện">
          <div class="lang-option ${lang === 'vi' ? 'active' : ''}" data-lang="vi" role="radio" aria-checked="${lang === 'vi'}" tabindex="0">
            <span class="lang-arrow">▶</span>
            <span class="lang-flag">VIE</span>
            <span class="lang-text">TIẾNG VIỆT</span>
          </div>
          <div class="lang-option ${lang === 'en' ? 'active' : ''}" data-lang="en" role="radio" aria-checked="${lang === 'en'}" tabindex="0">
            <span class="lang-arrow">▶</span>
            <span class="lang-flag">EN</span>
            <span class="lang-text">ENGLISH</span>
          </div>
        </div>

        <!-- Hidden input for name compatibility -->
        <input type="hidden" id="splash-student-name" value="${displayName}" />

        <!-- Switch Account / Logout Button -->
        <div class="splash-account-footer">
          <button type="button" class="btn-splash-switch-account" id="btn-splash-switch-account">
            <span>🚪</span> <span>${escapeHtml(t.switchAccount)}</span>
          </button>
        </div>
      </div>
    `;

    // Gắn sự kiện nút START
    const startBtn = mount.querySelector('#btn-splash-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (window.App && typeof window.App.completeStartScreen === 'function') {
          window.App.completeStartScreen();
        } else {
          window.location.hash = isTeacher ? '#teacher' : '#hub';
        }
      });
    }

    // Gắn sự kiện nút Đổi tài khoản
    const switchBtn = mount.querySelector('#btn-splash-switch-account');
    if (switchBtn) {
      switchBtn.addEventListener('click', onLogoutClick);
    }

    // Gắn sự kiện chọn ngôn ngữ
    mount.querySelectorAll('.lang-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const nextLang = opt.getAttribute('data-lang');
        if (window.App && typeof window.App.selectSplashLanguage === 'function') {
          window.App.selectSplashLanguage(nextLang, true);
        } else if (window.I18N) {
          window.I18N.setLang(nextLang);
        }
      });
    });
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
      icon.textContent = state.account?.role === 'teacher' ? '👨‍🏫' : '🧑‍🎓';

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
      const roleStr = state.account.role === 'teacher' ? '👨‍🏫 Giáo Viên' : '👧 Học Sinh';
      const classStr = state.account.classroomId ? ` · Lớp: ${state.account.classroomId}` : '';
      meta.textContent = `${roleStr} · ${state.account.display_name}${classStr} (${modeIndicator})`;
    }

    // Name input synchronization
    const nameInput = document.getElementById('settings-input-name');
    if (nameInput) {
      nameInput.readOnly = false;
      nameInput.value = state.account?.display_name || '';
    }
  }

  async function onLogoutClick(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    const text = activeText();
    if (!window.confirm(text.logoutConfirm)) return;

    if (window.FirebaseService) {
      await window.FirebaseService.logout();
    }

    state.account = null;
    state.authenticated = false;
    localStorage.removeItem('rml_student_name');
    localStorage.removeItem('rml_account_id');
    localStorage.removeItem('rml_user_role');
    localStorage.removeItem('rml_classroom_id');

    const mount = getMount();
    if (mount) {
      renderGate();
    } else {
      location.reload();
    }
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
      if (window.FirebaseService) {
        await window.FirebaseService.init();
        if (window.FirebaseService.account) {
          finish(window.FirebaseService.account);
          return;
        }
      }
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
    if (state.authenticated && state.account) {
      installAccountUI();
      renderAuthenticatedStart(state.account);
    } else if (getMount()) {
      renderGate();
    }
  });

  onReady(bootstrap);
})();
