/**
 * ROBOT MATH LAB - LESSON BASE CLASS
 * Template Method Pattern for all Polya-scaffolded lessons.
 * Integrated with Gamification (Stars, EXP, Confetti) and Sound FX.
 */

class LessonBase {
  constructor(config) {
    this.id = config.id;
    this.titleKey = config.titleKey;
    this.descKey = config.descKey;
    this.grade = config.grade || 5;
    this.topic = config.topic || 'motion';
    
    // Simulation settings
    this.trackLength = config.trackLength || 100;
    this.unitLabel = config.unitLabel || 'm';
    this.timeScale = config.timeScale || 1.0;
    this.simMode = config.simMode || 'single';

    // Problem data
    this.problemText = config.problemText || { vi: '', en: '' };
    this.knowns = config.knowns || [];      // [{id, textVi, textEn, type: 'known'}]
    this.unknowns = config.unknowns || [];  // [{id, textVi, textEn, type: 'unknown'}]
    this.correctFormulaId = config.correctFormulaId;
    this.formulaOptions = config.formulaOptions || [];
    this.expectedAnswers = config.expectedAnswers || {};
    this.hints = config.hints || { vi: [], en: [] };
    this.reflectionQuestions = config.reflectionQuestions || [];

    // State
    this.userAnswers = {};
    this.classifiedItems = {}; // item.id => 'known' | 'unknown'
    this.selectedFormula = null;
    this.hintIndex = 0;
  }

  getTitle() {
    return I18n.t(this.titleKey);
  }

  getDesc() {
    return I18n.t(this.descKey);
  }

  getProblemStatement() {
    return this.problemText[I18n.currentLang] || this.problemText.vi;
  }

  /**
   * Configure robots in the simulation
   */
  setupSimulation(simEngine) {
    // Override in subclass
  }

  /**
   * STEP 1: Understand the Problem (Hiểu vấn đề)
   */
  renderUnderstand(container, polyaEngine) {
    const lang = I18n.currentLang;
    const allItems = [...this.knowns, ...this.unknowns].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="problem-box">
        <p><strong>${lang === 'vi' ? '📖 Đề bài:' : '📖 Problem:'}</strong> ${this.getProblemStatement()}</p>
      </div>

      <p style="font-weight: 800; font-size: 0.95rem; margin-bottom: 0.5rem;">
        ${I18n.t('dragHint')}
      </p>

      <div class="chips-container" id="unclassified-chips">
        ${allItems.map(item => `
          <button class="chip chip-draggable" data-id="${item.id}" id="chip-${item.id}">
            ${lang === 'vi' ? item.textVi : item.textEn}
          </button>
        `).join('')}
      </div>

      <div class="drop-zone-container">
        <div class="drop-box" id="zone-known">
          <div class="drop-box-title" style="color: #1E40AF;">
            🔵 ${I18n.t('knownData')}
          </div>
          <div class="chips-container" id="known-chips"></div>
        </div>

        <div class="drop-box" id="zone-unknown">
          <div class="drop-box-title" style="color: #92400E;">
            🟡 ${I18n.t('unknownData')}
          </div>
          <div class="chips-container" id="unknown-chips"></div>
        </div>
      </div>

      <div id="step1-feedback"></div>
    `;

    // Click-to-categorize interaction
    allItems.forEach(item => {
      const chipEl = container.querySelector(`#chip-${item.id}`);
      if (chipEl) {
        chipEl.addEventListener('click', () => {
          this.promptCategorizeItem(item, container, polyaEngine);
        });
      }
    });

    // Check if already completed
    if (polyaEngine.isStepCompleted(1)) {
      this.autoFillStep1(container);
    }
  }

  promptCategorizeItem(item, container, polyaEngine) {
    const isKnown = item.type === 'known';
    const targetZone = isKnown ? container.querySelector('#known-chips') : container.querySelector('#unknown-chips');
    const chipEl = container.querySelector(`#chip-${item.id}`);

    if (chipEl && targetZone) {
      SoundFX.playTing();
      chipEl.classList.add(isKnown ? 'chip-known' : 'chip-unknown');
      chipEl.classList.remove('chip-draggable');
      targetZone.appendChild(chipEl);
      this.classifiedItems[item.id] = isKnown ? 'known' : 'unknown';

      Telemetry.logEvent(1, Telemetry.EVENT_TYPES.DATA_CLASSIFICATION, {
        itemId: item.id,
        chosenCategory: isKnown ? 'known' : 'unknown',
        isCorrect: true
      });

      this.checkStep1Completion(container, polyaEngine);
    }
  }

  autoFillStep1(container) {
    const knownZone = container.querySelector('#known-chips');
    const unknownZone = container.querySelector('#unknown-chips');

    this.knowns.forEach(k => {
      const existing = container.querySelector(`#chip-${k.id}`);
      if (existing) {
        existing.className = 'chip chip-known';
        knownZone.appendChild(existing);
      }
    });

    this.unknowns.forEach(u => {
      const existing = container.querySelector(`#chip-${u.id}`);
      if (existing) {
        existing.className = 'chip chip-unknown';
        unknownZone.appendChild(existing);
      }
    });
  }

  checkStep1Completion(container, polyaEngine) {
    const totalItems = this.knowns.length + this.unknowns.length;
    const classifiedCount = Object.keys(this.classifiedItems).length;

    if (classifiedCount >= totalItems) {
      polyaEngine.markStepComplete(1);
      SoundFX.playVictory();
      Confetti.burst(40);
      DB.addReward(5, 15);
      if (window.App) App.updateHeaderUserProfile();

      const feedback = container.querySelector('#step1-feedback');
      if (feedback) {
        feedback.innerHTML = `
          <div class="feedback-box feedback-success">
            <span>🎉</span>
            <div>
              <strong>+5 ⭐ Thưởng!</strong><br/>
              ${I18n.currentLang === 'vi' 
                ? 'Tuyệt vời! Bạn đã phân loại rõ dữ kiện ĐÃ BIẾT và CẦN TÌM. Bấm <strong>Tiếp tục</strong> để lập kế hoạch.' 
                : 'Great! You have correctly identified Known and Unknown data. Click <strong>Next</strong> to make a plan.'}
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * STEP 2: Devise a Plan (Lập kế hoạch)
   */
  renderPlan(container, polyaEngine) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div class="formula-triangle-card">
        <h4 style="color: var(--primary); margin-bottom: 0.5rem;">
          📐 ${I18n.t('formulaTriangle')}
        </h4>
        <div style="font-size: 1.1rem; font-weight: 800; color: #3730A3;">
          s = v × t &nbsp;|&nbsp; v = s ÷ t &nbsp;|&nbsp; t = s ÷ v
        </div>
      </div>

      <p style="font-weight: 800; font-size: 0.95rem; margin: 1.25rem 0 0.5rem 0;">
        ${I18n.t('selectFormula')}
      </p>

      <div class="formula-options-grid">
        ${this.formulaOptions.map(f => `
          <button class="formula-option-btn ${this.selectedFormula === f.id ? 'selected' : ''}" data-formula-id="${f.id}">
            <span>${f.formula}</span>
            <small style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">
              ${lang === 'vi' ? f.labelVi : f.labelEn}
            </small>
          </button>
        `).join('')}
      </div>

      <div id="step2-feedback"></div>
    `;

    container.querySelectorAll('.formula-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fid = btn.dataset.formulaId;
        this.selectedFormula = fid;
        container.querySelectorAll('.formula-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const isCorrect = (fid === this.correctFormulaId);

        Telemetry.logEvent(2, Telemetry.EVENT_TYPES.FORMULA_SELECTED, {
          selectedFormula: fid,
          isCorrect,
          correctFormula: this.correctFormulaId
        });

        const fb = container.querySelector('#step2-feedback');
        if (isCorrect) {
          polyaEngine.markStepComplete(2);
          SoundFX.playVictory();
          Confetti.burst(50);
          DB.addReward(10, 25);
          if (window.App) App.updateHeaderUserProfile();

          fb.innerHTML = `
            <div class="feedback-box feedback-success">
              <span>✅</span>
              <div>
                <strong>+10 ⭐ Thưởng!</strong><br/>
                ${lang === 'vi'
                  ? 'Chính xác! Bạn đã chọn đúng công thức cần thiết. Bấm <strong>Tiếp tục</strong> để thực hiện mô phỏng và tính toán.'
                  : 'Correct! You chose the right formula. Click <strong>Next</strong> to simulate and calculate.'}
              </div>
            </div>
          `;
        } else {
          SoundFX.playOops();
          Telemetry.logEvent(2, 'ERROR_RECORDED', {
            errorType: Telemetry.ERROR_TYPES.CONCEPTUAL,
            detail: `Selected ${fid} instead of ${this.correctFormulaId}`
          });
          fb.innerHTML = `
            <div class="feedback-box feedback-error">
              <span>⚠️</span>
              <div>
                ${lang === 'vi'
                  ? 'Công thức này chưa phù hợp với yêu cầu của bài toán. Hãy nhớ lại: đề bài đang hỏi điều gì nhé!'
                  : 'This formula does not match the problem target. Recall what the question asks for!'}
              </div>
            </div>
          `;
        }
      });
    });
  }

  /**
   * STEP 3: Carry Out (Thực hiện) - Subclasses provide custom inputs & calculations
   */
  renderExecute(container, polyaEngine, simEngine) {
    // Override in subclass
  }

  /**
   * STEP 4: Look Back & Review (Kiểm tra & Nhìn lại)
   */
  renderReview(container, polyaEngine) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div class="feedback-box feedback-success" style="margin-top: 0;">
        <span>🏆</span>
        <div>
          <strong>${I18n.t('congratsTitle')}</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.95rem;">
            ${lang === 'vi' 
              ? 'Hãy dành 1 phút nhìn lại quá trình giải để hiểu sâu hơn kiến thức nhé.' 
              : 'Take 1 minute to reflect on your solution process to deepen your understanding.'}
          </p>
        </div>
      </div>

      <div style="margin: 1.25rem 0;">
        <div class="reflection-item">
          <div class="reflection-question">
            ❓ ${lang === 'vi' ? '1. Đơn vị đo đã hợp lý chưa?' : '1. Are the measurement units consistent?'}
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted);">
            ${lang === 'vi'
              ? 'Quãng đường (m hoặc km), Thời gian (giây hoặc giờ), Vận tốc tương ứng (m/s hoặc km/h).'
              : 'Distance (m or km), Time (s or h), corresponding Velocity (m/s or km/h).'}
          </p>
        </div>

        <div class="reflection-item">
          <div class="reflection-question">
            ❓ ${lang === 'vi' ? '2. Nếu tăng gấp đôi vận tốc thì thời gian đi sẽ thế nào?' : '2. If velocity doubles, how does travel time change?'}
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted);">
            ${lang === 'vi'
              ? 'Vì thời gian và vận tốc tỉ lệ nghịch trên cùng quãng đường, nên thời gian sẽ giảm đi 2 lần!'
              : 'Because time and velocity are inversely proportional for the same distance, time will be halved!'}
          </p>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" id="btn-finish-lesson" style="width: 100%;">
        🌟 ${I18n.t('btnComplete')} (+30 ⭐)
      </button>
    `;

    container.querySelector('#btn-finish-lesson').addEventListener('click', () => {
      SoundFX.playVictory();
      Confetti.burst(100);
      DB.addReward(30, 60);
      if (window.App) App.updateHeaderUserProfile();

      polyaEngine.markStepComplete(4);
      Telemetry.logEvent(4, Telemetry.EVENT_TYPES.LESSON_COMPLETE, {
        lessonId: this.id
      });
      alert(lang === 'vi' ? '🎉 Chúc mừng bạn đã hoàn thành xuất sắc bài học và nhận được 30 sao thưởng ⭐!' : '🎉 Congratulations! You completed the lesson and earned 30 bonus stars ⭐!');
      window.location.hash = '#lessons';
    });
  }
}

window.LessonBase = LessonBase;
