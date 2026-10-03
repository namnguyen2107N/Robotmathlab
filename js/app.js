/**
 * ROBOT MATH LAB - APPLICATION CONTROLLER & ROUTER
 * Orchestrates Mandatory Start Screen, Mission Hub, Robot Mascot, and Task Workspace.
 */

class AppController {
  constructor() {
    this.selectedLanguage = localStorage.getItem('rml_language') || localStorage.getItem('rml_ui_language') || (window.I18N ? window.I18N.currentLang : 'vi');
    this.currentStudent = localStorage.getItem('rml_student_name') || (this.selectedLanguage === 'vi' ? 'Bé Yêu Toán' : 'Math Explorer');
    this.taskEngine = null;
    this.activeTaskId = null;
    this.splashScreen = null;
    this.init();
  }

  init() {
    // 1. Initialize retro pixel art splash screen
    this.initSplashScreen();

    // 2. Ensure task engine instance
    this.taskEngine = new TaskEngine('main-view');

    // 3. Update header student badge on startup
    const badge = document.getElementById('header-student-name');
    if (badge) badge.innerText = this.currentStudent;

    // 4. Listen to I18N language changes
    window.addEventListener('languageChanged', (e) => {
      this.handleLanguageChanged(e.detail.lang);
    });

    // 5. Hash-based router
    window.addEventListener('hashchange', () => this.handleRoute());

    // 6. Mandatory Start Screen check
    const splashDone = localStorage.getItem('rml_splash_done') === 'true' || sessionStorage.getItem('rml_started') === 'true';
    const currentHash = window.location.hash;

    if (!splashDone || !currentHash || currentHash === '#start' || currentHash === '#welcome') {
      window.location.hash = '#start';
      this.renderStartScreen();
    } else {
      this.handleRoute();
    }
  }

  handleLanguageChanged(lang) {
    this.selectedLanguage = lang;
    localStorage.setItem('rml_language', lang);
    localStorage.setItem('rml_ui_language', lang);

    // Update student name fallback if using standard defaults
    if (this.currentStudent === 'Math Explorer' && lang === 'vi') {
      this.setStudentName('Bé Yêu Toán');
    } else if (this.currentStudent === 'Bé Yêu Toán' && lang === 'en') {
      this.setStudentName('Math Explorer');
    }

    const hash = window.location.hash || '#start';
    if (hash === '#start' || hash === '#welcome') {
      this.renderStartScreen();
    } else if (hash.startsWith('#task/')) {
      if (this.taskEngine) this.taskEngine.updateLanguage();
    } else {
      this.renderTaskHub();
    }
  }

  handleRoute() {
    const hash = window.location.hash || '#start';
    const splashDone = localStorage.getItem('rml_splash_done') === 'true' || sessionStorage.getItem('rml_started') === 'true';

    // Guard: Must complete Start Screen before entering Mission Hub!
    if (!splashDone && hash !== '#start' && hash !== '#welcome') {
      window.location.hash = '#start';
      return;
    }

    if (hash === '#start' || hash === '#welcome') {
      this.activeTaskId = null;
      this.renderStartScreen();
    } else if (hash.startsWith('#task/')) {
      this.hideSplashScreen();
      const taskId = hash.replace('#task/', '');
      this.launchTask(taskId);
    } else {
      this.hideSplashScreen();
      this.activeTaskId = null;
      this.renderTaskHub();
    }
  }

  setStudentName(name) {
    if (!name || !name.trim()) return;
    this.currentStudent = name.trim();
    localStorage.setItem('rml_student_name', this.currentStudent);
    const badge = document.getElementById('header-student-name');
    if (badge) badge.innerText = this.currentStudent;
  }

  // =========================================================================
  // RETRO PIXEL ART SPLASH SCREEN CONTROLLER
  // =========================================================================
  initSplashScreen() {
    this.splashScreen = document.getElementById('splash-screen');
    if (!this.splashScreen) return;

    // Synchronize initial language from stored state without audio blip
    const savedLang = localStorage.getItem('rml_language') || localStorage.getItem('rml_ui_language') || (window.I18N ? window.I18N.currentLang : 'vi');
    this.selectSplashLanguage(savedLang, false);

    // Language options: 1 PLAYER (vi) and 2 PLAYERS (en)
    const langOptions = this.splashScreen.querySelectorAll('.lang-option');
    langOptions.forEach(opt => {
      const chooseOption = () => {
        const lang = opt.getAttribute('data-lang');
        this.selectSplashLanguage(lang, true);
      };
      opt.addEventListener('click', chooseOption);
      opt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          chooseOption();
        }
      });
    });

    // START Button
    const startBtn = document.getElementById('btn-splash-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.completeStartScreen();
      });
    }

    // Interactive Robot Mascot click easter egg
    const robotEl = document.getElementById('splash-robot');
    if (robotEl) {
      robotEl.addEventListener('click', () => {
        if (window.SoundFX) window.SoundFX.playRetroSelect();
        robotEl.classList.add('sparky-jump');
        setTimeout(() => robotEl.classList.remove('sparky-jump'), 600);
      });
    }

    // Splash Sound toggle button
    const splashSoundBtn = document.getElementById('btn-splash-sound');
    if (splashSoundBtn) {
      splashSoundBtn.addEventListener('click', () => {
        if (window.SoundFX) {
          const isMuted = window.SoundFX.toggleMute();
          const icon = document.getElementById('splash-sound-icon');
          if (icon) icon.innerText = isMuted ? '🔇' : '🔊';
        }
      });
    }

    // Splash Fullscreen toggle button
    const splashFsBtn = document.getElementById('btn-splash-fs');
    if (splashFsBtn) {
      splashFsBtn.addEventListener('click', () => {
        if (window.SoundFX) window.SoundFX.playPop();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });
    }

    // Student Name Input
    const nameInput = document.getElementById('splash-student-name');
    if (nameInput) {
      nameInput.value = this.currentStudent;
      nameInput.addEventListener('input', (e) => this.setStudentName(e.target.value));
      nameInput.addEventListener('change', (e) => this.setStudentName(e.target.value));
    }

    // Keyboard navigation (Arrow Up/Down or W/S to toggle 1P/2P, Enter to start)
    document.addEventListener('keydown', (e) => {
      if (!this.splashScreen || this.splashScreen.classList.contains('hidden')) return;

      // When user is typing inside the name input, Enter triggers start, other keys type normally
      if (document.activeElement === nameInput) {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.completeStartScreen();
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's') {
        e.preventDefault();
        const currentLang = window.I18N ? window.I18N.currentLang : (this.selectedLanguage || 'vi');
        const nextLang = currentLang === 'vi' ? 'en' : 'vi';
        this.selectSplashLanguage(nextLang, true);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.completeStartScreen();
      }
    });
  }

  selectSplashLanguage(lang, playSound = true) {
    if (lang !== 'vi' && lang !== 'en') return;
    this.selectedLanguage = lang;

    if (window.I18N) {
      window.I18N.setLang(lang);
    }
    if (playSound && window.SoundFX) {
      window.SoundFX.playRetroSelect();
    }

    if (this.splashScreen) {
      this.splashScreen.querySelectorAll('.lang-option').forEach(opt => {
        const isMatch = opt.getAttribute('data-lang') === lang;
        opt.classList.toggle('active', isMatch);
        opt.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });

      // Update text labels dynamically based on selected language
      const coinText = document.getElementById('splash-coin-text');
      if (coinText) {
        coinText.innerText = lang === 'vi' ? 'CHẾ ĐỘ TỰ DO: MIỄN PHÍ' : 'FREE PLAY MODE: ACTIVE';
      }

      const eyebrow = document.getElementById('splash-eyebrow');
      if (eyebrow) {
        eyebrow.innerText = lang === 'vi' ? '★ NHẬP MÔN TOÁN HỌC & ROBOTICS ★' : '★ MATH & ROBOTICS LAB ★';
      }

      const subtitle = document.getElementById('splash-subtitle');
      if (subtitle) {
        subtitle.innerText = lang === 'vi' ? 'NỀN TẢNG HỌC TOÁN & GIẢI QUYẾT VẤN ĐỀ POLYA' : 'VIRTUAL PROBLEM SOLVING PLATFORM';
      }

      const nameLabel = document.getElementById('splash-name-label');
      if (nameLabel) {
        nameLabel.innerText = lang === 'vi' ? '🧑‍🎓 TÊN BẠN:' : '🧑‍🎓 STUDENT:';
      }

      const footerHints = document.getElementById('splash-footer-hints');
      if (footerHints) {
        footerHints.innerHTML = lang === 'vi'
          ? '<span class="key-hint">▲/▼ CHỌN</span><span class="sep">•</span><span class="key-hint">ENTER: BẮT ĐẦU</span><span class="sep">•</span><span class="key-hint">© 2026 TRƯỜNG ĐH SƯ PHẠM HÀ NỘI</span>'
          : '<span class="key-hint">▲/▼ SELECT</span><span class="sep">•</span><span class="key-hint">ENTER: START</span><span class="sep">•</span><span class="key-hint">© 2026 HNUE</span>';
      }

      // Update name input placeholder and value if default
      const nameInput = document.getElementById('splash-student-name');
      if (nameInput) {
        if (lang === 'vi') {
          nameInput.placeholder = 'Nhập tên của bạn...';
          if (this.currentStudent === 'Math Explorer') this.setStudentName('Bé Yêu Toán');
        } else {
          nameInput.placeholder = 'Enter your name...';
          if (this.currentStudent === 'Bé Yêu Toán') this.setStudentName('Math Explorer');
        }
        nameInput.value = this.currentStudent;
      }
    }
  }

  showSplashScreen() {
    document.body.classList.add('view-start-screen');
    if (!this.splashScreen) {
      this.splashScreen = document.getElementById('splash-screen');
    }
    if (this.splashScreen) {
      this.splashScreen.classList.remove('hidden', 'splash-exit');
      const curr = window.I18N ? window.I18N.currentLang : (this.selectedLanguage || 'vi');
      this.selectSplashLanguage(curr, false);

      const nameInput = document.getElementById('splash-student-name');
      if (nameInput) nameInput.value = this.currentStudent;

      const fsIcon = document.getElementById('splash-fs-icon');
      if (fsIcon) fsIcon.innerText = document.fullscreenElement ? '⤢' : '⛶';

      const soundIcon = document.getElementById('splash-sound-icon');
      if (soundIcon && window.SoundFX) {
        soundIcon.innerText = window.SoundFX.isMuted ? '🔇' : '🔊';
      }
    }
  }

  hideSplashScreen() {
    document.body.classList.remove('view-start-screen');
    if (this.splashScreen) {
      this.splashScreen.classList.add('hidden');
    }
  }

  renderStartScreen() {
    this.showSplashScreen();
  }

  completeStartScreen() {
    const nameInput = document.getElementById('splash-student-name');
    if (nameInput && nameInput.value.trim()) {
      this.setStudentName(nameInput.value.trim());
    }

    sessionStorage.setItem('rml_started', 'true');
    localStorage.setItem('rml_splash_done', 'true');
    const lang = window.I18N ? window.I18N.currentLang : (this.selectedLanguage || 'vi');
    localStorage.setItem('rml_ui_language', lang);
    localStorage.setItem('rml_language', lang);

    if (window.SoundFX) {
      window.SoundFX.playRetroStart();
    }

    const robotEl = document.getElementById('splash-robot');
    if (robotEl) {
      robotEl.classList.add('sparky-jump');
    }

    if (this.splashScreen) {
      this.splashScreen.classList.add('splash-exit');
    }

    setTimeout(() => {
      this.hideSplashScreen();
      this.renderTaskSelection();
    }, 450);
  }

  renderTaskSelection() {
    window.location.hash = '#hub';
    this.renderTaskHub();
  }

  // =========================================================================
  // SCREEN 2: MAIN MISSION HUB (CHOOSE TASK 1, 2, OR 3)
  // =========================================================================
  renderTaskHub() {
    this.hideSplashScreen();
    document.body.classList.remove('view-start-screen');
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.classList.remove('active');
      m.style.display = 'none';
    });
    document.body.style.overflow = '';
    const main = document.getElementById('main-view');
    if (!main) return;

    const t = (key) => window.I18N ? window.I18N.t(key) : key;

    main.innerHTML = `
      <div class="hub-container animate-fade-in">
        
        <!-- Mission Hub Hero Briefing Banner -->
        <div class="hub-hero">
          <div class="hub-hero-content">
            <span class="hub-eyebrow">${t('hero_eyebrow')}</span>
            <h1 class="hub-title">${t('hero_title')}</h1>
            <p class="hub-subtitle">
              ${t('hub_greeting')}
            </p>
          </div>
          
          <div class="hub-actions-card">
            <div class="hub-student-badge-wrap">
              <span class="badge-avatar">🧑‍🎓</span>
              <div>
                <div class="badge-role">${t('student_tag_title')}</div>
                <div class="badge-name">${this.currentStudent}</div>
              </div>
            </div>
            <a href="#start" class="btn-return-start" title="${t('btn_back_to_start')}">
              ${t('btn_back_to_start')}
            </a>
          </div>
        </div>

        <!-- Task Selection Grid -->
        <section class="tasks-section" id="tasks-section">
          <div class="section-title-wrap">
            <h2 class="section-title">${t('hub_section_title')}</h2>
            <p class="section-desc">${t('hub_section_desc')}</p>
          </div>

          <div class="tasks-grid">
            
            <!-- Task 1 Card: Reach the Goal -->
            <div class="task-card task-card-1" id="card-task1">
              <div class="task-card-header">
                <span class="task-card-badge">${t('task1_badge')}</span>
                <span class="task-difficulty">${t('task1_diff')}</span>
              </div>
              <h3 class="task-card-title">${t('task1_title')}</h3>
              <p class="task-card-sub">${t('task1_sub')}</p>
              <p class="task-card-desc">
                ${t('task1_desc')}
              </p>
              <div class="task-card-footer">
                <button type="button" class="btn-start-task" onclick="window.App.navigateToTask('task1-reach')">
                  ${t('task1_btn')}
                </button>
              </div>
            </div>

            <!-- Task 2 Card: Test the Plan -->
            <div class="task-card task-card-2" id="card-task2">
              <div class="task-card-header">
                <span class="task-card-badge">${t('task2_badge')}</span>
                <span class="task-difficulty highlight">${t('task2_diff')}</span>
              </div>
              <h3 class="task-card-title">${t('task2_title')}</h3>
              <p class="task-card-sub">${t('task2_sub')}</p>
              <p class="task-card-desc">
                ${t('task2_desc')}
              </p>
              <div class="task-card-footer">
                <button type="button" class="btn-start-task btn-start-task2" onclick="window.App.navigateToTask('task2-fix')">
                  ${t('task2_btn')}
                </button>
              </div>
            </div>

            <!-- Task 3 Card: New Mission -->
            <div class="task-card task-card-3" id="card-task3">
              <div class="task-card-header">
                <span class="task-card-badge">${t('task3_badge')}</span>
                <span class="task-difficulty">${t('task3_diff')}</span>
              </div>
              <h3 class="task-card-title">${t('task3_title')}</h3>
              <p class="task-card-sub">${t('task3_sub')}</p>
              <p class="task-card-desc">
                ${t('task3_desc')}
              </p>
              <div class="task-card-footer">
                <button type="button" class="btn-start-task" onclick="window.App.navigateToTask('task3-new')">
                  ${t('task3_btn')}
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>
    `;

    // Synchronize Sparky floating companion bubble
    const sparkyBubble = document.getElementById('sparky-bubble');
    if (sparkyBubble) {
      sparkyBubble.innerText = t('robot_bubble_welcome');
    }
  }

  animateRobotHappyCheer() {
    if (window.SoundFX) window.SoundFX.playTing();
    const robotEl = document.getElementById('hero-robot-character');
    const bubbleEl = document.getElementById('hero-robot-bubble');
    if (robotEl) {
      robotEl.classList.add('robot-jump-spin');
      setTimeout(() => robotEl.classList.remove('robot-jump-spin'), 800);
    }
    if (bubbleEl) {
      const easterMsg = window.I18N ? window.I18N.t('robot_easter_egg') : 'Yay! Let\'s learn together! 🚀';
      bubbleEl.innerText = easterMsg;
      bubbleEl.classList.add('pop-highlight');
      setTimeout(() => bubbleEl.classList.remove('pop-highlight'), 1200);
    }
  }

  navigateToTask(taskId) {
    if (window.SoundFX) window.SoundFX.playPop();
    const targetHash = `#task/${taskId}`;
    if (window.location.hash === targetHash) {
      this.launchTask(taskId);
    } else {
      window.location.hash = targetHash;
    }
  }

  launchTask(taskId) {
    this.hideSplashScreen();
    document.body.classList.remove('view-start-screen');

    // Dismiss any active modals
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.classList.remove('active');
      m.style.display = 'none';
    });
    document.body.style.overflow = '';

    let taskConfig = null;
    if (taskId === 'task1-reach') taskConfig = window.Task1Reach;
    else if (taskId === 'task2-fix') taskConfig = window.Task2Fix;
    else if (taskId === 'task3-new') taskConfig = window.Task3New;

    if (!taskConfig) {
      window.location.hash = '#hub';
      return;
    }

    this.activeTaskId = taskId;
    this.taskEngine.loadTask(taskConfig, this.currentStudent);
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.App = new AppController();
});
