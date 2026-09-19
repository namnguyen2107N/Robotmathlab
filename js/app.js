/**
 * ROBOT MATH LAB - MAIN APPLICATION CONTROLLER & ROUTER
 * Orchestrates views, lessons, Polya state transitions, telemetry, sound FX, and student profiles.
 * Includes Role-Based Access Control (Separating Regular Student and Admin/Teacher editions).
 */

const App = {
  lessons: {},
  activeLesson: null,
  activePolyaEngine: null,
  activeSimEngine: null,
  selectedAvatarId: 'bot-spark',

  init() {
    this.registerLessons();
    this.setupEventListeners();
    this.setupUserModal();
    this.setupControls();
    this.updateHeaderUserProfile();
    this.updateRoleVisibility();
    Chatbot.init();
    this.route();

    // Hide chatbot badge after first open
    const badge = document.getElementById('chatbot-badge');
    if (badge) {
      const chatToggle = document.getElementById('chatbot-toggle-btn');
      if (chatToggle) {
        chatToggle.addEventListener('click', () => {
          badge.style.display = 'none';
        }, { once: true });
      }
    }
  },

  registerLessons() {
    this.lessons = {
      'motion-1': new Lesson1(),
      'motion-2': new Lesson2(),
      'motion-3': new Lesson3(),
      'motion-4': new Lesson4(),
      'motion-5': new Lesson5()
    };
  },

  setupEventListeners() {
    // Hash change router
    window.addEventListener('hashchange', () => {
      this.route();
      Analytics.trackPageView(window.location.hash);
    });

    // Language change listener
    document.addEventListener('languageChanged', () => {
      this.route();
      this.updateHeaderUserProfile();
      this.updateRoleVisibility();
    });

    // User changed listener
    window.addEventListener('userChanged', () => {
      this.updateHeaderUserProfile();
      this.updateRoleVisibility();
      this.route();
    });

    // Language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.playPop();
        I18n.setLang(btn.dataset.lang);
      });
    });

    // Mascot click event
    const mascotBot = document.getElementById('mascot-bot-avatar');
    if (mascotBot) {
      mascotBot.addEventListener('click', () => {
        SoundFX.playPop();
        this.mascotCheer();
      });
    }
  },

  setupControls() {
    // 1. Fullscreen Toggle
    const btnFullscreen = document.getElementById('btn-toggle-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        SoundFX.playPop();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen error:', err);
          });
          btnFullscreen.textContent = '🗗';
          btnFullscreen.title = 'Thoát toàn màn hình / Exit Fullscreen';
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
          btnFullscreen.textContent = '⛶';
          btnFullscreen.title = 'Toàn màn hình / Fullscreen';
        }
      });
    }

    // 2. Sound FX Toggle
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      btnSound.textContent = SoundFX.isMuted ? '🔇' : '🔊';
      btnSound.addEventListener('click', () => {
        const muted = SoundFX.toggleMute();
        btnSound.textContent = muted ? '🔇' : '🔊';
        if (!muted) SoundFX.playTing();
      });
    }
  },

  /**
   * Update visibility of Admin/Research elements based on user role
   */
  updateRoleVisibility() {
    const isAdmin = DB.isAdmin();
    const navResearch = document.getElementById('nav-research-link');
    if (navResearch) {
      // Show research tab ONLY if user is Teacher/Admin
      navResearch.style.display = isAdmin ? 'inline-flex' : 'none';
    }
  },

  setupUserModal() {
    const modal = document.getElementById('user-modal');
    const btnOpen = document.getElementById('btn-open-user-modal');
    const btnClose = document.getElementById('btn-close-user-modal');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabReg = document.getElementById('tab-btn-register');
    const contentLogin = document.getElementById('tab-content-login');
    const contentReg = document.getElementById('tab-content-register');

    if (!modal || !btnOpen) return;

    btnOpen.addEventListener('click', () => {
      SoundFX.playPop();
      this.renderQuickUserList();
      this.renderAvatarSelector();
      modal.classList.add('open');
    });

    btnClose.addEventListener('click', () => {
      SoundFX.playPop();
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    // Tab switching
    tabLogin.addEventListener('click', () => {
      SoundFX.playPop();
      tabLogin.classList.add('active');
      tabReg.classList.remove('active');
      contentLogin.style.display = 'block';
      contentReg.style.display = 'none';
    });

    tabReg.addEventListener('click', () => {
      SoundFX.playPop();
      tabReg.classList.add('active');
      tabLogin.classList.remove('active');
      contentReg.style.display = 'block';
      contentLogin.style.display = 'none';
    });

    // Custom login submit
    const btnCustomLogin = document.getElementById('btn-submit-custom-login');
    const inputLoginName = document.getElementById('login-input-name');
    if (btnCustomLogin && inputLoginName) {
      btnCustomLogin.addEventListener('click', () => {
        const val = inputLoginName.value.trim();
        if (!val) return;
        const res = DB.login(val);
        if (res.success) {
          SoundFX.playTing();
          modal.classList.remove('open');
          this.setMascotMessage(`Chào mừng bạn ${res.user.name} đã quay trở lại! ⭐`);
        } else {
          SoundFX.playOops();
          alert(res.message);
        }
      });
    }

    // Register submit
    const btnRegister = document.getElementById('btn-submit-register');
    if (btnRegister) {
      btnRegister.addEventListener('click', () => {
        const name = document.getElementById('reg-input-name').value.trim();
        const grade = document.getElementById('reg-select-grade').value;
        const className = document.getElementById('reg-input-class').value.trim();

        if (!name) {
          alert('Vui lòng nhập họ và tên của bạn nhé!');
          return;
        }

        const newUser = DB.registerUser({
          name,
          grade,
          className: className || '5A',
          avatarId: this.selectedAvatarId
        });

        SoundFX.playVictory();
        Confetti.burst(60);
        modal.classList.remove('open');
        this.setMascotMessage(`Tuyệt vời! Chào mừng bạn ${newUser.name} gia nhập Robot Math Lab! 🚀`);
      });
    }
  },

  renderQuickUserList() {
    const list = document.getElementById('user-quick-list');
    if (!list) return;

    const users = DB.getUsers();
    const currentUser = DB.getCurrentUser();
    const isAdmin = DB.isAdmin();

    list.innerHTML = `
      <div style="margin-bottom: 0.5rem; font-weight: 800; font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase;">
        Tài khoản học sinh phổ thông:
      </div>
      ${users.filter(u => u.role === 'student').map(user => {
        const avatar = DB.getAvatar(user.avatarId);
        const isCurrent = currentUser && currentUser.id === user.id;
        return `
          <div class="card" style="padding: 0.85rem 1.1rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}; background: ${isCurrent ? 'var(--primary-light)' : 'var(--bg-card)'};" data-user-id="${user.id}">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div style="font-size: 1.8rem; width: 46px; height: 46px; border-radius: 50%; background: ${avatar.color}; display: flex; align-items: center; justify-content: center;">
                ${avatar.emoji}
              </div>
              <div>
                <div style="font-weight: 900; font-size: 1.1rem; color: var(--text-main);">
                  ${user.name} ${isCurrent ? '<span class="badge badge-emerald" style="font-size: 0.75rem;">Đang chọn</span>' : ''}
                </div>
                <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-muted);">
                  Lớp ${user.className || '5A'} &bull; ⭐ ${user.stars || 0} sao &bull; Lv.${user.level || 1}
                </div>
              </div>
            </div>
            <button class="btn btn-sm ${isCurrent ? 'btn-success' : 'btn-outline-primary'}">
              ${isCurrent ? '✓ Đang dùng' : 'Chọn'}
            </button>
          </div>
        `;
      }).join('')}

      <div style="margin: 1.25rem 0 0.5rem 0; font-weight: 800; font-size: 0.9rem; color: #B45309; text-transform: uppercase;">
        🔒 Dành riêng cho Giáo viên & Quản trị viên (Admin):
      </div>
      ${users.filter(u => u.role !== 'student').map(adminUser => {
        const isCurrent = currentUser && currentUser.id === adminUser.id;
        return `
          <div class="card" style="padding: 0.85rem 1.1rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: #F59E0B; background: #FFFBEB;" data-admin-id="${adminUser.id}">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div style="font-size: 1.8rem; width: 46px; height: 46px; border-radius: 50%; background: #F59E0B; display: flex; align-items: center; justify-content: center; color: white;">
                🔑
              </div>
              <div>
                <div style="font-weight: 900; font-size: 1.1rem; color: #92400E;">
                  ${adminUser.name} ${isCurrent ? '<span class="badge badge-amber" style="font-size: 0.75rem;">Đang chọn</span>' : ''}
                </div>
                <div style="font-size: 0.85rem; font-weight: 800; color: #B45309;">
                  Quyền Quản trị viên &bull; Xem dữ liệu nghiên cứu &bull; PIN: ${adminUser.pin}
                </div>
              </div>
            </div>
            <button class="btn btn-sm btn-warning">
              ${isCurrent ? '✓ Admin' : 'Đăng nhập Admin'}
            </button>
          </div>
        `;
      }).join('')}
    `;

    // Student account selection
    list.querySelectorAll('[data-user-id]').forEach(el => {
      el.addEventListener('click', () => {
        const uid = el.dataset.userId;
        const u = DB.getUserById(uid);
        if (u) {
          DB.setCurrentUser(u);
          SoundFX.playTing();
          document.getElementById('user-modal').classList.remove('open');
          this.setMascotMessage(`Chào bạn ${u.name}! Hãy cùng bắt đầu bài học nào! 🤖`);
        }
      });
    });

    // Admin account selection with PIN confirmation
    list.querySelectorAll('[data-admin-id]').forEach(el => {
      el.addEventListener('click', () => {
        const uid = el.dataset.adminId;
        const adminUser = DB.getUserById(uid);
        if (adminUser) {
          const pin = prompt(`Nhập mã PIN xác nhận quyền ${adminUser.name} (Mặc định: ${adminUser.pin}):`);
          if (pin && pin.trim() === adminUser.pin) {
            DB.setCurrentUser(adminUser);
            SoundFX.playVictory();
            document.getElementById('user-modal').classList.remove('open');
            this.setMascotMessage(`Xin chào ${adminUser.name}! Bạn đã mở khóa chế độ Quản trị & Dữ liệu Nghiên cứu 🔬`);
          } else if (pin !== null) {
            SoundFX.playOops();
            alert('Mã PIN không chính xác!');
          }
        }
      });
    });
  },

  renderAvatarSelector() {
    const grid = document.getElementById('avatar-selector-grid');
    if (!grid) return;

    grid.innerHTML = DB.AVATARS.map(a => `
      <div class="avatar-card-item ${a.id === this.selectedAvatarId ? 'selected' : ''}" data-avatar-id="${a.id}">
        <span class="avatar-emoji-preview">${a.emoji}</span>
        <span class="avatar-name-label">${a.name}</span>
      </div>
    `).join('');

    grid.querySelectorAll('.avatar-card-item').forEach(card => {
      card.addEventListener('click', () => {
        SoundFX.playPop();
        grid.querySelectorAll('.avatar-card-item').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedAvatarId = card.dataset.avatarId;
      });
    });
  },

  updateHeaderUserProfile() {
    const user = DB.getCurrentUser();
    if (!user) return;

    const avatar = DB.getAvatar(user.avatarId);
    const avatarEl = document.getElementById('header-avatar-preview');
    const nameEl = document.getElementById('header-user-name');
    const starsEl = document.getElementById('header-user-stars');
    const classEl = document.getElementById('header-user-class');
    const mascotBotAvatar = document.getElementById('mascot-bot-avatar');

    if (avatarEl) {
      avatarEl.textContent = avatar.emoji;
      avatarEl.style.background = avatar.color;
    }
    if (nameEl) nameEl.textContent = user.name;
    if (starsEl) starsEl.textContent = `⭐ ${user.stars || 0}`;
    if (classEl) {
      if (user.role === 'teacher') {
        classEl.textContent = '🔑 Giáo viên';
        classEl.style.color = '#D97706';
      } else if (user.role === 'researcher') {
        classEl.textContent = '🔬 Nhà NCKH';
        classEl.style.color = '#7C3AED';
      } else {
        classEl.textContent = `Lớp ${user.className || '5A'}`;
        classEl.style.color = 'var(--primary)';
      }
    }
    if (mascotBotAvatar) mascotBotAvatar.textContent = avatar.emoji;
  },

  setMascotMessage(msg) {
    const bubble = document.getElementById('mascot-speech-bubble');
    if (bubble) {
      bubble.innerHTML = msg;
    }
  },

  mascotCheer() {
    const cheers = [
      'Bạn làm rất tốt! Hãy tiếp tục phát huy nhé! 🌟',
      'Đọc kĩ đề bài là đã giải quyết được một nửa vấn đề rồi đấy! 📖',
      'Tam giác công thức (s, v, t) là chìa khóa vạn năng cho bài này! 📐',
      'Mỗi lần thử lại là một lần não bộ chúng mình thông minh hơn! 💡',
      'Robot của bạn đang tràn đầy năng lượng để về đích! 🏎️'
    ];
    const randomCheer = cheers[Math.floor(Math.random() * cheers.length)];
    this.setMascotMessage(randomCheer);
  },

  route() {
    const hash = window.location.hash || '#home';
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    // Cleanup active simulation if leaving lesson
    if (this.activeSimEngine && !hash.startsWith('#lesson/')) {
      this.activeSimEngine.pause();
      this.activeSimEngine = null;
    }

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });

    if (hash === '#home' || hash === '') {
      this.renderHome(mainView);
      this.setMascotMessage('Xin chào! Hãy chọn một bài học trong danh mục để chúng mình cùng khám phá nhé! 🚀');
    } else if (hash === '#lessons') {
      this.renderLessons(mainView);
      this.setMascotMessage('Đây là 5 thử thách chuyển động đều. Bạn muốn bắt đầu với bài nào trước? 📚');
    } else if (hash.startsWith('#lesson/')) {
      const lessonId = hash.replace('#lesson/', '');
      this.renderLessonWorkspace(mainView, lessonId);
    } else if (hash === '#progress') {
      this.renderProgress(mainView);
      this.setMascotMessage('Đây là bảng thành tích và huy hiệu bạn đã đạt được. Tuyệt vời lắm! 🏆');
    } else if (hash === '#research') {
      // Check Admin Role: If not Admin, show PIN challenge
      if (!DB.isAdmin()) {
        this.renderAdminAccessRestricted(mainView);
      } else {
        this.renderResearch(mainView);
        this.setMascotMessage('Cổng dữ liệu nghiên cứu NCKH ghi nhận chi tiết quá trình học tập theo chuẩn xAPI! 🔬');
      }
    } else {
      this.renderHome(mainView);
    }

    I18n.updateDOM();
  },

  /**
   * VIEW: ACCESS RESTRICTED SCREEN (Displayed when regular student tries to access #research)
   */
  renderAdminAccessRestricted(container) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div class="container">
        <div class="admin-lock-card">
          <span class="admin-lock-icon">🔒</span>
          <h2 style="color: #92400E; margin-bottom: 0.75rem;">
            ${lang === 'vi' ? 'Khu Vực Dành Riêng Cho Giáo Viên & Nhà Nghiên Cứu' : 'Restricted Area for Teachers & Researchers'}
          </h2>
          <p style="font-size: 1.1rem; color: #78350F; margin-bottom: 2rem;">
            ${lang === 'vi' 
              ? 'Dữ liệu nghiên cứu quá trình (Telemetry) và nhật ký người dùng được bảo mật để đảm bảo tính khách quan của đề tài NCKH. Học sinh không được phép xem phần này.' 
              : 'Research process data (Telemetry) and user logs are restricted to ensure pedagogical research integrity. Students cannot view this section.'}
          </p>

          <div style="max-width: 420px; margin: 0 auto 1.5rem auto;">
            <label class="input-label" style="color: #92400E;">
              🔑 ${lang === 'vi' ? 'Nhập mã PIN Quản trị (Gợi ý: 9999 hoặc 8888):' : 'Enter Admin PIN (Hint: 9999 or 8888):'}
            </label>
            <div style="display: flex; gap: 0.75rem;">
              <input type="password" class="math-input" id="admin-pin-input" placeholder="****" style="font-size: 1.8rem; letter-spacing: 4px;" />
              <button class="btn btn-warning btn-lg" id="btn-unlock-admin">
                ${lang === 'vi' ? 'Mở khóa' : 'Unlock'}
              </button>
            </div>
            <div id="admin-pin-error" style="margin-top: 0.75rem; color: var(--danger); font-weight: 800;"></div>
          </div>

          <a href="#home" class="btn btn-secondary" onclick="SoundFX.playPop()">
            &larr; ${lang === 'vi' ? 'Quay lại Trang chủ học sinh' : 'Back to Student Home'}
          </a>
        </div>
      </div>
    `;

    const btnUnlock = container.querySelector('#btn-unlock-admin');
    const inputPin = container.querySelector('#admin-pin-input');
    const errBox = container.querySelector('#admin-pin-error');

    const handleUnlock = () => {
      const pin = inputPin.value.trim();
      const res = DB.verifyAdminPin(pin);
      if (res.success) {
        SoundFX.playVictory();
        Confetti.burst(60);
        this.updateHeaderUserProfile();
        this.updateRoleVisibility();
        this.renderResearch(container);
      } else {
        SoundFX.playOops();
        errBox.textContent = lang === 'vi' ? 'Mã PIN Quản trị không chính xác! Vui lòng thử lại.' : 'Incorrect Admin PIN! Please try again.';
      }
    };

    btnUnlock.addEventListener('click', handleUnlock);
    inputPin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUnlock();
    });
  },

  /**
   * VIEW: HOME / DASHBOARD
   */
  renderHome(container) {
    const lang = I18n.currentLang;
    const user = DB.getCurrentUser();
    const isAdmin = DB.isAdmin();

    container.innerHTML = `
      <div class="container">
        <!-- Hero Section -->
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 50%, #06B6D4 100%); border-radius: var(--radius-lg); padding: clamp(2.5rem, 5vw, 4rem); color: white; margin-bottom: 3rem; box-shadow: var(--shadow-xl); position: relative; overflow: hidden;">
          <div style="max-width: 820px; position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
              <span class="badge" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); font-size: 1rem; padding: 0.5rem 1rem;">
                🚀 STEM Robotics & Math Lab
              </span>
              <span class="badge" style="background: #F59E0B; color: white; font-size: 1rem; padding: 0.5rem 1rem;">
                ⭐ ${user ? user.stars : 0} Sao Tích Lũy
              </span>
              ${isAdmin ? '<span class="badge" style="background: #10B981; color: white; font-size: 1rem; padding: 0.5rem 1rem;">🔑 Chế độ Quản trị / Giáo viên</span>' : ''}
            </div>
            <h1 style="color: white; font-size: clamp(2.3rem, 4.5vw, 3.4rem); margin-bottom: 1.25rem; line-height: 1.2;">
              ${lang === 'vi' ? 'Khám Phá Toán Học Cùng Thế Giới Robotics Ảo' : 'Explore Math with Virtual Robotics Lab'}
            </h1>
            <p style="color: #E0E7FF; font-size: clamp(1.15rem, 1.8vw, 1.4rem); margin-bottom: 2.25rem;">
              ${lang === 'vi' 
                ? 'Học giải toán chuyển động đều Lớp 5 theo phương pháp Pólya 4 bước trực quan, sinh động và tràn đầy hứng khởi!' 
                : 'Learn Grade 5 uniform motion problem-solving through the 4-step Polya framework in an interactive virtual robotics lab!'}
            </p>
            <div style="display: flex; gap: 1.25rem; flex-wrap: wrap;">
              <a href="#lessons" class="btn btn-warning btn-lg" onclick="SoundFX.playPop()">
                🎮 ${lang === 'vi' ? 'Bắt đầu học ngay' : 'Start Learning Now'}
              </a>
              <button class="btn btn-secondary btn-lg" style="background: rgba(255,255,255,0.2); color: white; border-color: rgba(255,255,255,0.4);" onclick="SoundFX.playPop(); document.getElementById('btn-open-user-modal').click();">
                👤 ${lang === 'vi' ? 'Đổi tài khoản học sinh' : 'Switch Student'}
              </button>
            </div>
          </div>
        </div>

        <!-- Polya Framework Showcase -->
        <h2 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.6rem; font-size: 2rem;">
          🧠 ${lang === 'vi' ? 'Quy Trình 4 Bước Giải Quyết Vấn Đề Pólya' : 'Polya 4-Step Problem-Solving Framework'}
        </h2>
        <div class="polya-stepper" style="margin-bottom: 3.5rem;">
          <div class="step-card active" data-step="1">
            <div class="step-number" style="background: var(--polya-step1); color: white;">1</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step1Title')}</span>
              <span class="step-title-en">${I18n.t('step1Subtitle')}</span>
            </div>
          </div>
          <div class="step-card active" data-step="2">
            <div class="step-number" style="background: var(--polya-step2); color: white;">2</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step2Title')}</span>
              <span class="step-title-en">${I18n.t('step2Subtitle')}</span>
            </div>
          </div>
          <div class="step-card active" data-step="3">
            <div class="step-number" style="background: var(--polya-step3); color: white;">3</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step3Title')}</span>
              <span class="step-title-en">${I18n.t('step3Subtitle')}</span>
            </div>
          </div>
          <div class="step-card active" data-step="4">
            <div class="step-number" style="background: var(--polya-step4); color: white;">4</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step4Title')}</span>
              <span class="step-title-en">${I18n.t('step4Subtitle')}</span>
            </div>
          </div>
        </div>

        <!-- Featured Lessons Grid -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 2rem;">📚 ${I18n.t('grade5Motion')}</h2>
          <a href="#lessons" class="btn btn-outline-primary btn-sm" onclick="SoundFX.playPop()">${lang === 'vi' ? 'Xem tất cả' : 'View All'} &rarr;</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.75rem; margin-bottom: 3.5rem;">
          ${Object.values(this.lessons).slice(0, 3).map(lesson => this.renderLessonCard(lesson)).join('')}
        </div>
      </div>
    `;
  },

  /**
   * VIEW: LESSON CATALOG
   */
  renderLessons(container) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div class="container">
        <div style="margin-bottom: 2.5rem;">
          <h1 style="font-size: 2.8rem;">📚 ${I18n.t('navLessons')}</h1>
          <p style="font-size: 1.25rem;">${lang === 'vi' ? 'Học và rèn luyện kỹ năng giải toán thông qua các thử thách Robotics thực tế.' : 'Learn and master math skills through hands-on virtual robotics challenges.'}</p>
        </div>

        <h2 style="margin: 2rem 0 1.25rem 0; color: var(--primary); font-size: 2.2rem;">
          🏎️ ${I18n.t('grade5Motion')}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.75rem;">
          ${Object.values(this.lessons).map(lesson => this.renderLessonCard(lesson)).join('')}
        </div>

        <!-- Grade 4 Geometry Module Preview -->
        <h2 style="margin: 3.5rem 0 1.25rem 0; color: var(--secondary); font-size: 2.2rem;">
          📐 ${I18n.t('grade4Geometry')}
        </h2>
        <div style="background: var(--bg-card); border: 3px dashed var(--secondary); border-radius: var(--radius-lg); padding: 3rem 2rem; text-align: center;">
          <h3 style="color: var(--secondary); margin-bottom: 0.75rem; font-size: 1.75rem;">
            🧩 ${lang === 'vi' ? 'Mô-đun Đang Mở Rộng: Hình Học & Đo Lường Lớp 4' : 'Expanding Module: Grade 4 Geometry & Measurement'}
          </h3>
          <p style="max-width: 750px; margin: 0 auto 1.75rem auto; font-size: 1.2rem;">
            ${lang === 'vi' 
              ? 'Kiến trúc mô-đun hóa sẵn sàng tích hợp 5 bài học về Chu vi, Diện tích hình chữ nhật, hình vuông, và góc với Robot vẽ hình (Turtle Graphics).' 
              : 'Modular architecture ready for 5 upcoming lessons on Perimeter, Area of rectangles/squares, and angles with Turtle Graphics.'}
          </p>
        </div>
      </div>
    `;
  },

  renderLessonCard(lesson) {
    const lang = I18n.currentLang;
    return `
      <div class="card">
        <div class="card-header">
          <span class="badge badge-blue">Lớp ${lesson.grade}</span>
          <span class="badge badge-gray">${lesson.trackLength} ${lesson.unitLabel}</span>
        </div>
        <h3 class="card-title" style="margin-bottom: 0.85rem;">
          ${lesson.getTitle()}
        </h3>
        <p class="card-body" style="margin-bottom: 1.75rem;">
          ${lesson.getDesc()}
        </p>
        <a href="#lesson/${lesson.id}" class="btn btn-primary btn-lg" style="width: 100%;" onclick="SoundFX.playPop()">
          🚀 ${lang === 'vi' ? 'Vào bài học' : 'Enter Lesson'}
        </a>
      </div>
    `;
  },

  /**
   * VIEW: INTERACTIVE LESSON WORKSPACE WITH POLYA STEPPER
   */
  renderLessonWorkspace(container, lessonId) {
    const lesson = this.lessons[lessonId];
    if (!lesson) {
      window.location.hash = '#lessons';
      return;
    }

    this.activeLesson = lesson;
    this.activePolyaEngine = new PolyaEngine(lesson);
    Telemetry.setLesson(lesson.id);

    const lang = I18n.currentLang;

    container.innerHTML = `
      <div class="container">
        <!-- Back Navigation & Title -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <a href="#lessons" style="font-weight: 900; font-size: 1.15rem; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;" onclick="SoundFX.playPop()">
              &larr; ${lang === 'vi' ? 'Danh mục bài học' : 'Lesson Catalog'}
            </a>
            <h1 style="font-size: clamp(1.6rem, 3vw, 2.3rem);">${lesson.getTitle()}</h1>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-secondary btn-sm" id="btn-request-hint">
              💡 ${I18n.t('btnHint')}
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-restart-lesson">
              🔄 ${lang === 'vi' ? 'Làm lại từ đầu' : 'Restart'}
            </button>
          </div>
        </div>

        <!-- Polya Stepper Bar -->
        <div class="polya-stepper" id="polya-stepper-bar">
          <div class="step-card active" data-step="1">
            <div class="step-number">1</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step1Title')}</span>
              <span class="step-title-en">${I18n.t('step1Subtitle')}</span>
            </div>
          </div>
          <div class="step-card" data-step="2">
            <div class="step-number">2</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step2Title')}</span>
              <span class="step-title-en">${I18n.t('step2Subtitle')}</span>
            </div>
          </div>
          <div class="step-card" data-step="3">
            <div class="step-number">3</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step3Title')}</span>
              <span class="step-title-en">${I18n.t('step3Subtitle')}</span>
            </div>
          </div>
          <div class="step-card" data-step="4">
            <div class="step-number">4</div>
            <div class="step-info">
              <span class="step-title-vi">${I18n.t('step4Title')}</span>
              <span class="step-title-en">${I18n.t('step4Subtitle')}</span>
            </div>
          </div>
        </div>

        <!-- Simulation & Polya Interactive Layout -->
        <div class="simulation-layout">
          <!-- Left: Simulation Canvas -->
          <div class="sim-viewport-card">
            <div class="sim-header">
              <div class="sim-title">
                🤖 ${lang === 'vi' ? 'Đường Đua Robotics Ảo' : 'Virtual Robotics Track'}
              </div>
              <div class="sim-stats">
                <div class="stat-item timer">
                  ⏱️ <span id="stat-timer">0.0s</span>
                </div>
                <div class="stat-item">
                  📏 <span id="stat-dist">0 ${lesson.unitLabel}</span>
                </div>
              </div>
            </div>

            <div class="canvas-wrapper">
              <canvas id="simulation-canvas"></canvas>
            </div>

            <!-- Simulation Controls Bar -->
            <div class="sim-controls-bar">
              <div class="playback-buttons">
                <button class="btn btn-primary" id="sim-play-btn">▶ ${I18n.t('runSimulation')}</button>
                <button class="btn btn-secondary" id="sim-pause-btn">⏸ ${I18n.t('pauseSimulation')}</button>
                <button class="btn btn-secondary" id="sim-step-btn">⏯ ${I18n.t('stepSimulation')}</button>
                <button class="btn btn-secondary" id="sim-reset-btn">🔄 ${I18n.t('resetSimulation')}</button>
              </div>
              <div class="speed-control">
                <span>${I18n.t('speedLabel')}</span>
                <input type="range" min="0.5" max="3" step="0.5" value="1" class="speed-slider" id="sim-speed-slider">
                <span id="speed-val">1x</span>
              </div>
            </div>
          </div>

          <!-- Right: Polya Step Interactive Panel -->
          <div class="polya-panel">
            <div class="polya-panel-header">
              <div class="polya-panel-step-badge step-1" id="panel-badge">1</div>
              <div class="polya-panel-title" id="panel-title">${I18n.t('step1Title')}</div>
            </div>

            <div class="polya-panel-content" id="panel-content">
              <!-- Content injected dynamically per step -->
            </div>

            <div class="polya-panel-footer">
              <button class="btn btn-secondary btn-lg" id="btn-polya-prev" disabled>
                ◀ ${I18n.t('btnBack')}
              </button>
              <button class="btn btn-primary btn-lg" id="btn-polya-next">
                ${I18n.t('btnNext')} ▶
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize Simulation Engine
    this.activeSimEngine = new SimulationEngine('simulation-canvas', {
      trackLengthUnits: lesson.trackLength,
      unitLabel: lesson.unitLabel,
      timeScale: lesson.timeScale,
      mode: lesson.simMode
    });

    lesson.setupSimulation(this.activeSimEngine);

    // Bind Sim Engine updates to UI stats
    this.activeSimEngine.onTick = (simTime, robots) => {
      const timerEl = document.getElementById('stat-timer');
      const distEl = document.getElementById('stat-dist');
      if (timerEl) timerEl.textContent = `${simTime.toFixed(1)}s`;
      if (distEl && robots[0]) {
        distEl.textContent = `${Math.round(robots[0].position)} ${lesson.unitLabel}`;
      }
    };

    // Bind Sim Control Buttons
    const playBtn = document.getElementById('sim-play-btn');
    const pauseBtn = document.getElementById('sim-pause-btn');
    const resetBtn = document.getElementById('sim-reset-btn');
    const stepBtn = document.getElementById('sim-step-btn');
    const speedSlider = document.getElementById('sim-speed-slider');
    const speedVal = document.getElementById('speed-val');

    playBtn.addEventListener('click', () => {
      SoundFX.playPop();
      this.activeSimEngine.start();
    });
    pauseBtn.addEventListener('click', () => {
      SoundFX.playPop();
      this.activeSimEngine.pause();
    });
    resetBtn.addEventListener('click', () => {
      SoundFX.playPop();
      this.activeSimEngine.reset();
    });
    stepBtn.addEventListener('click', () => {
      SoundFX.playPop();
      this.activeSimEngine.step(1.0);
    });
    speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.activeSimEngine.setTimeScale(val);
      speedVal.textContent = `${val}x`;
    });

    // Bind Hint button
    document.getElementById('btn-request-hint').addEventListener('click', () => {
      SoundFX.playPop();
      this.showHint(lesson);
    });

    // Bind Restart button
    document.getElementById('btn-restart-lesson').addEventListener('click', () => {
      SoundFX.playPop();
      if (confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn làm lại bài từ đầu?' : 'Restart lesson from the beginning?')) {
        this.activePolyaEngine.start();
        this.activeSimEngine.reset();
      }
    });

    // Bind Stepper Bar clicks
    document.querySelectorAll('#polya-stepper-bar .step-card').forEach(card => {
      card.addEventListener('click', () => {
        SoundFX.playPop();
        const stepNum = parseInt(card.dataset.step);
        this.activePolyaEngine.goToStep(stepNum);
      });
    });

    // Bind Prev/Next buttons
    const btnPrev = document.getElementById('btn-polya-prev');
    const btnNext = document.getElementById('btn-polya-next');

    btnPrev.addEventListener('click', () => {
      SoundFX.playPop();
      this.activePolyaEngine.prevStep();
    });
    btnNext.addEventListener('click', () => {
      SoundFX.playPop();
      this.activePolyaEngine.nextStep();
    });

    // Listen for Polya Engine changes
    this.activePolyaEngine.onChange((e) => {
      this.updatePolyaUI(e.newStep);
    });

    // Start Polya Engine
    this.activePolyaEngine.start();
  },

  updatePolyaUI(step) {
    const lesson = this.activeLesson;
    const engine = this.activePolyaEngine;

    // Update Stepper Bar Active State
    document.querySelectorAll('#polya-stepper-bar .step-card').forEach(card => {
      const cardStep = parseInt(card.dataset.step);
      card.classList.toggle('active', cardStep === step);
      card.classList.toggle('completed', engine.isStepCompleted(cardStep));
    });

    // Update Panel Header Badge and Title
    const badge = document.getElementById('panel-badge');
    const title = document.getElementById('panel-title');
    if (badge && title) {
      badge.className = `polya-panel-step-badge step-${step}`;
      badge.textContent = step;
      title.textContent = I18n.t(`step${step}Title`);
    }

    // Update Prev / Next buttons
    const btnPrev = document.getElementById('btn-polya-prev');
    const btnNext = document.getElementById('btn-polya-next');
    if (btnPrev) btnPrev.disabled = (step === 1);
    if (btnNext) btnNext.disabled = (step === 4);

    // Update Mascot hints based on step
    if (step === 1) {
      this.setMascotMessage('Bước 1: Bấm vào từng mảnh ghép dữ kiện để phân loại <strong>ĐÃ BIẾT</strong> và <strong>CẦN TÌM</strong> nhé! 🔵🟡');
    } else if (step === 2) {
      this.setMascotMessage('Bước 2: Hãy chọn công thức toán học phù hợp từ tam giác liên hệ (s, v, t)! 📐');
    } else if (step === 3) {
      this.setMascotMessage('Bước 3: Nhập kết quả tính toán rồi bấm "Kiểm tra" để xem robot lăn bánh nào! 🏎️');
    } else if (step === 4) {
      this.setMascotMessage('Bước 4: Xuất sắc! Hãy cùng nhìn lại lời giải và rút ra bài học thú vị nhé! 🏆');
    }

    // Render Step Content
    const content = document.getElementById('panel-content');
    if (!content) return;

    if (step === 1) {
      lesson.renderUnderstand(content, engine);
    } else if (step === 2) {
      lesson.renderPlan(content, engine);
    } else if (step === 3) {
      lesson.renderExecute(content, engine, this.activeSimEngine);
    } else if (step === 4) {
      lesson.renderReview(content, engine);
    }
  },

  showHint(lesson) {
    const lang = I18n.currentLang;
    Telemetry.logEvent(this.activePolyaEngine.currentStep, Telemetry.EVENT_TYPES.HINT_REQUESTED, {
      hintIndex: lesson.hintIndex
    });
    alert(`${I18n.t('hintUsedText')}\n\n${lang === 'vi' ? 'Hãy đọc kĩ đề bài và xác định những gì đã biết (s, v, hoặc t) rồi dùng tam giác công thức để tìm đại lượng còn thiếu!' : 'Read carefully to identify knowns (s, v, or t) and use the formula triangle to calculate the unknown!'}`);
  },

  /**
   * VIEW: STUDENT PROGRESS
   */
  renderProgress(container) {
    const lang = I18n.currentLang;
    const summary = Telemetry.getAnalyticsSummary();
    const user = DB.getCurrentUser() || { name: 'Học Sinh', stars: 120, exp: 350, level: 3, badges: ['Tân binh Robotics'] };
    const avatar = DB.getAvatar(user.avatarId);

    container.innerHTML = `
      <div class="container">
        <!-- Student Hero Profile Card -->
        <div class="card" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-color: #818CF8; margin-bottom: 2rem; padding: 2.25rem;">
          <div style="display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap;">
            <div style="width: 90px; height: 90px; border-radius: 50%; background: ${avatar.color}; display: flex; align-items: center; justify-content: center; font-size: 3.2rem; box-shadow: 0 8px 18px rgba(79, 70, 229, 0.35);">
              ${avatar.emoji}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;">
                <h2 style="font-size: 2rem; color: #1E1B4B;">${user.name}</h2>
                <span class="badge badge-emerald">Cấp độ ${user.level || 1}</span>
                <span class="badge badge-blue">${user.role === 'teacher' ? 'Giáo viên' : `Lớp ${user.className || '5A'}`}</span>
              </div>
              <div style="margin-top: 0.6rem; font-weight: 800; color: #4338CA; display: flex; gap: 1.75rem; flex-wrap: wrap; font-size: 1.15rem;">
                <span>⭐ ${user.stars || 0} Sao thưởng</span>
                <span>⚡ ${user.exp || 0} / ${((user.level || 1) * 100)} EXP</span>
                <span>🏅 ${(user.badges || []).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.75rem; margin-bottom: 2.75rem;">
          <div class="card" style="text-align: center; padding: 2rem;">
            <div style="font-size: 2.8rem; font-weight: 900; color: var(--primary);">${summary.lessonsAttempted} / 5</div>
            <div style="font-weight: 800; font-size: 1.15rem; color: var(--text-muted);">${lang === 'vi' ? 'Bài học đã khám phá' : 'Lessons Attempted'}</div>
          </div>
          <div class="card" style="text-align: center; padding: 2rem;">
            <div style="font-size: 2.8rem; font-weight: 900; color: var(--success);">${summary.correctTrials}</div>
            <div style="font-weight: 800; font-size: 1.15rem; color: var(--text-muted);">${lang === 'vi' ? 'Lần giải chính xác' : 'Correct Trials'}</div>
          </div>
          <div class="card" style="text-align: center; padding: 2rem;">
            <div style="font-size: 2.8rem; font-weight: 900; color: var(--warning);">${summary.backwardStepsCount}</div>
            <div style="font-weight: 800; font-size: 1.15rem; color: var(--text-muted);">${lang === 'vi' ? 'Hành vi kiểm tra lại (Debug)' : 'Backward Review Steps'}</div>
          </div>
          <div class="card" style="text-align: center; padding: 2rem;">
            <div style="font-size: 2.8rem; font-weight: 900; color: #8B5CF6;">${summary.totalHintsUsed}</div>
            <div style="font-weight: 800; font-size: 1.15rem; color: var(--text-muted);">${lang === 'vi' ? 'Gợi ý đã sử dụng' : 'Hints Used'}</div>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 1.25rem; font-size: 1.6rem;">🎯 ${lang === 'vi' ? 'Bản Đồ Năng Lực Giải Quyết Vấn Đề (Pólya)' : 'Polya Problem-Solving Competency Map'}</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 1.25rem;">
            <li style="display: flex; justify-content: space-between; align-items: center; font-size: 1.15rem;">
              <span><strong>1. ${I18n.t('step1Title')}</strong> (${lang === 'vi' ? 'Phân loại dữ kiện' : 'Data Classification'})</span>
              <span class="badge badge-blue">Thành thạo</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; font-size: 1.15rem;">
              <span><strong>2. ${I18n.t('step2Title')}</strong> (${lang === 'vi' ? 'Lựa chọn công thức' : 'Formula Selection'})</span>
              <span class="badge badge-amber">Đang phát triển</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; font-size: 1.15rem;">
              <span><strong>3. ${I18n.t('step3Title')}</strong> (${lang === 'vi' ? 'Mô phỏng & Tính toán' : 'Simulation & Calculation'})</span>
              <span class="badge badge-emerald">Tốt</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; font-size: 1.15rem;">
              <span><strong>4. ${I18n.t('step4Title')}</strong> (${lang === 'vi' ? 'Nhìn lại & Đánh giá' : 'Reflection & Evaluation'})</span>
              <span class="badge badge-purple">Khuyến khích</span>
            </li>
          </ul>
        </div>
      </div>
    `;
  },

  /**
   * VIEW: RESEARCHER & TEACHER PORTAL WITH TRAFFIC ANALYTICS (Admin Only)
   */
  renderResearch(container) {
    const lang = I18n.currentLang;
    const events = Telemetry.getAllEvents();
    const trafficSummary = Analytics.getSummary();
    const currentUser = DB.getCurrentUser();

    container.innerHTML = `
      <div class="container">
        <!-- Admin Header Bar -->
        <div style="background: #FFFBEB; border: 2px solid #FCD34D; border-radius: var(--radius-lg); padding: 1.25rem 1.75rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.75rem;">🔒</span>
            <div>
              <strong style="color: #92400E; font-size: 1.15rem;">Chế độ Quản Trị Viên: ${currentUser ? currentUser.name : 'Admin'}</strong>
              <div style="font-size: 0.95rem; color: #B45309;">Người dùng phổ thông (học sinh) không thấy được trang này.</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-switch-to-student">
            👤 Chuyển về Chế độ Học sinh
          </button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: 2.6rem;">🔬 ${I18n.t('navResearch')}</h1>
            <p style="font-size: 1.15rem;">${lang === 'vi' ? 'Hệ thống thống kê lưu lượng truy cập và dữ liệu quá trình (Process Data Telemetry).' : 'Web Traffic Analytics & Process Data Telemetry System.'}</p>
          </div>
          <div style="display: flex; gap: 0.85rem;">
            <button class="btn btn-primary" id="btn-export-csv" onclick="SoundFX.playPop()">
              📥 ${I18n.t('btnExportData')}
            </button>
            <button class="btn btn-secondary" id="btn-export-json" onclick="SoundFX.playPop()">
              📄 JSON
            </button>
            <button class="btn btn-secondary" id="btn-clear-telemetry" style="color: var(--danger);" onclick="SoundFX.playPop()">
              🗑️ ${I18n.t('btnClearData')}
            </button>
          </div>
        </div>

        <!-- Web Traffic & Access Stats Dashboard -->
        <h2 style="margin-bottom: 1.25rem; color: var(--primary); font-size: 2rem;">
          📈 ${lang === 'vi' ? 'Thống Kê Lượng Truy Cập Hệ Thống' : 'Web Traffic & Access Analytics'}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.25rem;">
          <div class="card" style="border-left: 6px solid #4F46E5;">
            <div style="font-size: 2.5rem; font-weight: 900; color: #4F46E5;">${trafficSummary.totalVisits}</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-muted);">${lang === 'vi' ? 'Tổng lượt truy cập' : 'Total Visits'}</div>
          </div>
          <div class="card" style="border-left: 6px solid #06B6D4;">
            <div style="font-size: 2.5rem; font-weight: 900; color: #06B6D4;">${trafficSummary.totalPageViews}</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-muted);">${lang === 'vi' ? 'Lượt xem trang (Pageviews)' : 'Total Page Views'}</div>
          </div>
          <div class="card" style="border-left: 6px solid #10B981;">
            <div style="font-size: 2.5rem; font-weight: 900; color: #10B981;">${trafficSummary.deviceBreakdown['Desktop/Smartboard'] || 0}</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-muted);">${lang === 'vi' ? 'Máy tính / Bảng TV' : 'Desktop / Smartboard'}</div>
          </div>
          <div class="card" style="border-left: 6px solid #F59E0B;">
            <div style="font-size: 2.5rem; font-weight: 900; color: #F59E0B;">${trafficSummary.deviceBreakdown['Tablet'] || 0}</div>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-muted);">${lang === 'vi' ? 'Máy tính bảng (Tablet)' : 'Tablet Visits'}</div>
          </div>
        </div>

        <!-- Traffic Chart Card -->
        <div class="card" style="margin-bottom: 2.5rem;">
          <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">📊 ${lang === 'vi' ? 'Biểu Đồ Lượng Truy Cập Theo Ngày' : 'Daily Visits Chart'}</h3>
          <div style="width: 100%; height: 220px;">
            <canvas id="traffic-canvas" style="width: 100%; height: 100%;"></canvas>
          </div>
        </div>

        <!-- Research Coding Scheme Card -->
        <div class="card" style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 0.85rem; font-size: 1.5rem;">📋 ${lang === 'vi' ? 'Khung Mã Hóa Năng Lực (Coding Scheme)' : 'Competency Coding Scheme'}</h3>
          <p style="font-size: 1.1rem; margin-bottom: 1.25rem;">
            ${lang === 'vi' 
              ? 'Hệ thống tự động ghi nhận các sự kiện theo chuẩn xAPI (Actor-Verb-Object) tương ứng với 4 pha của Pólya:' 
              : 'The system automatically captures events in xAPI format corresponding to the 4 Polya phases:'}
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); font-size: 1.05rem;">
              <strong>Pha 1 (Hiểu):</strong> Tỉ lệ phân loại chính xác dữ kiện Đã biết / Cần tìm; thời gian dừng đọc đề.
            </div>
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); font-size: 1.05rem;">
              <strong>Pha 2 (Kế hoạch):</strong> Lựa chọn công thức ($s, v, t$); nhận diện dạng bài đơn lẻ hay chuyển động ngược chiều.
            </div>
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); font-size: 1.05rem;">
              <strong>Pha 3 (Thực hiện):</strong> Số lần thử lại (Trials), phân loại lỗi (Khái niệm, Tính toán, Nhập số).
            </div>
            <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); font-size: 1.05rem;">
              <strong>Pha 4 (Nhìn lại):</strong> Hành vi quay lui (Backtracking), kiểm tra đơn vị đo và tính hợp lý của kết quả.
            </div>
          </div>
        </div>

        <!-- Telemetry Log Table -->
        <div class="card">
          <h3 style="margin-bottom: 1.25rem; font-size: 1.5rem;">
            ⏱️ ${lang === 'vi' ? 'Dòng Sự Kiện Ghi Nhận Thực Thời' : 'Real-time Event Stream'} (${events.length} events)
          </h3>
          <div style="max-height: 420px; overflow-y: auto; border: 2px solid var(--border-color); border-radius: var(--radius-md);">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; text-align: left;">
              <thead style="background: var(--bg-surface); position: sticky; top: 0;">
                <tr>
                  <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Timestamp</th>
                  <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Student ID</th>
                  <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Lesson</th>
                  <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Polya Step</th>
                  <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Event Type</th>
                  <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Details</th>
                </tr>
              </thead>
              <tbody>
                ${events.slice(-50).reverse().map(ev => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem; font-family: monospace;">${new Date(ev.timestamp).toLocaleTimeString()}</td>
                    <td style="padding: 0.75rem; font-family: monospace;">${ev.studentId}</td>
                    <td style="padding: 0.75rem;">${ev.lessonId || '-'}</td>
                    <td style="padding: 0.75rem;">
                      <span class="badge ${ev.polyaStep ? `badge-${['blue','amber','emerald','purple'][ev.polyaStep-1]}` : 'badge-gray'}">
                        ${ev.polyaStep ? `Step ${ev.polyaStep}` : '-'}
                      </span>
                    </td>
                    <td style="padding: 0.75rem; font-weight: 800;">${ev.eventType}</td>
                    <td style="padding: 0.75rem; font-family: monospace; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${JSON.stringify(ev.data)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Chatbot Admin Panel (Q&A Management) -->
        <div id="chatbot-admin-section">
          ${Chatbot.renderAdminPanel()}
        </div>
      </div>
    `;

    // Render traffic chart
    setTimeout(() => {
      Analytics.renderTrafficChart('traffic-canvas');
    }, 50);

    // Switch to student button
    const btnSwitch = container.querySelector('#btn-switch-to-student');
    if (btnSwitch) {
      btnSwitch.addEventListener('click', () => {
        SoundFX.playPop();
        DB.switchToStudent();
        window.location.hash = '#home';
      });
    }

    document.getElementById('btn-export-csv').addEventListener('click', () => Telemetry.exportCSV());
    document.getElementById('btn-export-json').addEventListener('click', () => Telemetry.exportJSON());
    document.getElementById('btn-clear-telemetry').addEventListener('click', () => {
      if (confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu telemetry?' : 'Clear all telemetry events?')) {
        Telemetry.clearData();
        this.renderResearch(container);
      }
    });

    // Bind Chatbot Admin Events
    Chatbot.bindAdminEvents(container);
  }
};

window.App = App;

// Bootstrap application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
