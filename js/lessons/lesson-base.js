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

    // NCKH Research Configurations
    this.predictionConfig = config.predictionConfig || null;
    this.unitCheckConfig = config.unitCheckConfig || null;
    this.whatIfConfig = config.whatIfConfig || null;

    // Student interaction states
    this.userAnswers = {};
    this.classifiedItems = {}; // item.id => 'known' | 'unknown'
    this.selectedFormula = null;
    this.hintIndex = 0;
    this.userPrediction = null;
    this.predictionSaved = false;
    this.unitCheckPassed = false;
    this.whatIfTested = false;
    this.confidenceLevel = null;
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
   * Helper: Render Phase 1 (Prediction / Ước lượng ban đầu) in Step 3
   */
  renderPredictionPrompt(container, onComplete) {
    if (!this.predictionConfig) {
      if (onComplete) onComplete();
      return;
    }

    const lang = I18n.currentLang;
    const cfg = this.predictionConfig;
    const promptText = lang === 'vi' ? cfg.promptVi : cfg.promptEn;

    const html = `
      <div class="prediction-card" id="step3-prediction-section">
        <div class="prediction-header">
          <span class="prediction-icon">🔮</span>
          <div>
            <strong>${I18n.t('phasePredictionTitle')}</strong>
            <p style="margin: 0.2rem 0 0 0; font-size: 0.88rem; opacity: 0.9;">
              ${promptText}
            </p>
          </div>
        </div>
        <div class="prediction-body" style="margin-top: 0.85rem;">
          <div class="number-input-wrapper">
            <input type="number" step="any" class="math-input" id="input-prediction" 
              placeholder="${cfg.defaultGuess || '?'}" value="${this.userPrediction !== null ? this.userPrediction : ''}" />
            <span class="unit-label">${cfg.unit}</span>
          </div>
          <button class="btn btn-warning" id="btn-save-prediction" style="width: 100%; margin-top: 0.65rem;">
            💾 ${I18n.t('btnSavePrediction')}
          </button>
        </div>
        <div id="prediction-saved-status" style="display: ${this.predictionSaved ? 'block' : 'none'}; margin-top: 0.6rem; color: #047857; font-weight: 800; font-size: 0.85rem;">
          ${I18n.t('predictionSavedNotice')}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('afterbegin', html);

    const btnSave = container.querySelector('#btn-save-prediction');
    const inputPred = container.querySelector('#input-prediction');
    const statusEl = container.querySelector('#prediction-saved-status');

    if (btnSave && inputPred) {
      btnSave.addEventListener('click', () => {
        const val = parseFloat(inputPred.value);
        if (isNaN(val)) {
          alert(lang === 'vi' ? 'Vui lòng nhập một số ước lượng của bạn!' : 'Please enter an estimated number!');
          return;
        }
        SoundFX.playPop();
        this.userPrediction = val;
        this.predictionSaved = true;

        Telemetry.logEvent(3, Telemetry.EVENT_TYPES.PREDICTION_SUBMITTED, {
          lessonId: this.id,
          prediction: val,
          unit: cfg.unit
        });

        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.textContent = `${I18n.t('predictionSavedNotice')} (${val} ${cfg.unit})`;
        }
        btnSave.disabled = true;
        btnSave.textContent = `✓ ${I18n.t('predictionLabel')} ${val} ${cfg.unit}`;

        if (onComplete) onComplete(val);
      });
    }
  }

  /**
   * Helper: Render Phase 3 (Comparison Table) after correct calculation & simulation
   */
  renderComparisonTable(container, calculatedValue, actualSimValue, unit, noteText) {
    const lang = I18n.currentLang;
    const hasPred = (this.userPrediction !== null);
    const predVal = hasPred ? this.userPrediction : null;
    const delta = hasPred ? Math.abs(predVal - calculatedValue) : 0;
    const deltaPercent = (hasPred && calculatedValue !== 0) ? ((delta / calculatedValue) * 100).toFixed(0) : 0;

    let evalRemark = '';
    if (hasPred) {
      if (delta === 0) {
        evalRemark = lang === 'vi' ? '🎯 Tuyệt đối chính xác! Bạn ước lượng hoàn hảo!' : '🎯 Perfect! Your estimate was exact!';
      } else if (deltaPercent <= 20) {
        evalRemark = lang === 'vi' ? `✨ Rất xuất sắc! Dự đoán chỉ lệch ${delta.toFixed(1)} ${unit} (${deltaPercent}%).` : `✨ Excellent! Estimate was off by only ${delta.toFixed(1)} ${unit} (${deltaPercent}%).`;
      } else {
        evalRemark = lang === 'vi' ? `💡 Khá tốt! Lệch ${delta.toFixed(1)} ${unit}. Sau khi tính công thức, bạn đã có kết quả chuẩn xác!` : `💡 Good effort! Difference: ${delta.toFixed(1)} ${unit}. Calculation gave exact value!`;
      }

      Telemetry.logEvent(3, Telemetry.EVENT_TYPES.PREDICTION_COMPARED, {
        lessonId: this.id,
        userPrediction: predVal,
        calculatedValue,
        actualSimValue,
        delta,
        deltaPercent
      });
    }

    const html = `
      <div class="comparison-card" style="margin-top: 1rem;">
        <h4 style="color: #1E40AF; margin-bottom: 0.65rem; font-size: 1.05rem; display: flex; align-items: center; gap: 0.4rem;">
          📊 ${I18n.t('phaseComparisonTitle')}
        </h4>
        <div class="comparison-grid">
          <div class="comparison-cell">
            <span class="comp-label">🔮 ${I18n.t('predictionLabel')}</span>
            <span class="comp-val">${hasPred ? `${predVal} ${unit}` : (lang === 'vi' ? 'Chưa nhập' : 'Not set')}</span>
          </div>
          <div class="comparison-cell highlight">
            <span class="comp-label">📐 ${I18n.t('calculatedLabel')}</span>
            <span class="comp-val">${calculatedValue} ${unit}</span>
          </div>
          <div class="comparison-cell">
            <span class="comp-label">🤖 ${I18n.t('actualSimLabel')}</span>
            <span class="comp-val">${actualSimValue} ${unit}</span>
          </div>
        </div>
        ${hasPred ? `
          <div class="comparison-eval-note" style="margin-top: 0.75rem; padding: 0.6rem 0.85rem; background: #EFF6FF; border-radius: var(--radius-sm); font-size: 0.88rem; color: #1E3A8A; font-weight: 700;">
            ${evalRemark}
          </div>
        ` : ''}
        ${noteText ? `<p style="font-size: 0.88rem; margin: 0.5rem 0 0 0; color: var(--text-muted);">${noteText}</p>` : ''}
      </div>
    `;

    const target = container.querySelector('#step3-comparison-slot') || container;
    target.insertAdjacentHTML('beforeend', html);
  }

  /**
   * STEP 4: Look Back & Review (Kiểm tra & Nhìn lại) - Full Interactive Experience
   */
  renderReview(container, polyaEngine, simEngine) {
    const lang = I18n.currentLang;

    // Default Fallbacks if lesson doesn't define custom configs
    const unitCfg = this.unitCheckConfig || {
      questionVi: 'Trong bài toán vừa giải, đơn vị đo của các đại lượng đã thống nhất chưa?',
      questionEn: 'In this problem, are the measurement units fully consistent?',
      options: [
        { id: 'u1', text: lang === 'vi' ? 'Đã hoàn toàn chuẩn xác (km - giờ - km/h hoặc m - giây - m/s)' : 'Fully consistent (km - h - km/h or m - s - m/s)', isCorrect: true },
        { id: 'u2', text: lang === 'vi' ? 'Chưa hợp lý' : 'Inconsistent', isCorrect: false }
      ],
      explanationVi: 'Đơn vị đo chuẩn xác giúp kết quả phản ánh đúng thực tế!',
      explanationEn: 'Consistent units ensure realistic mathematical results!'
    };

    const whatIfCfg = this.whatIfConfig || {
      scenarioVi: 'Nếu vận tốc của Robot tăng gấp đôi thì thời gian đi sẽ thay đổi như thế nào?',
      scenarioEn: 'If the robot speed doubles, how does the travel time change?',
      expected: 2,
      unit: lang === 'vi' ? 'lần (giảm)' : 'times (less)',
      explanationVi: 'Vì s không đổi, v tăng 2 lần thì t giảm đi 2 lần (tỉ lệ nghịch)!',
      explanationEn: 'Because s is constant, when v doubles, t is halved (inverse proportion)!'
    };

    container.innerHTML = `
      <div class="feedback-box feedback-success" style="margin-top: 0; margin-bottom: 1.25rem;">
        <span>🏆</span>
        <div>
          <strong>${I18n.t('congratsTitle')}</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.95rem;">
            ${I18n.t('step4InteractiveDesc')}
          </p>
        </div>
      </div>

      <!-- CHALLENGE 1: UNIT CHECK -->
      <div class="review-card" id="challenge-unit-check" style="margin-bottom: 1.25rem;">
        <div class="review-card-header">
          <span class="review-card-icon">📏</span>
          <h4>${I18n.t('unitCheckTitle')}</h4>
        </div>
        <p style="font-size: 0.92rem; margin: 0.5rem 0 0.85rem 0; font-weight: 700; color: var(--text-main);">
          ${lang === 'vi' ? unitCfg.questionVi : unitCfg.questionEn}
        </p>
        <div class="unit-check-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem;">
          ${unitCfg.options.map(opt => `
            <button class="btn btn-outline-primary btn-sm btn-unit-option" data-id="${opt.id}" data-correct="${opt.isCorrect}">
              ${opt.text}
            </button>
          `).join('')}
        </div>
        <div id="unit-check-feedback" style="margin-top: 0.65rem;"></div>
      </div>

      <!-- CHALLENGE 2: WHAT-IF SCENARIO -->
      <div class="review-card" id="challenge-what-if" style="margin-bottom: 1.25rem;">
        <div class="review-card-header">
          <span class="review-card-icon">💡</span>
          <h4>${I18n.t('whatIfTitle')}</h4>
        </div>
        <p style="font-size: 0.92rem; margin: 0.5rem 0 0.75rem 0;">
          ${lang === 'vi' ? whatIfCfg.scenarioVi : whatIfCfg.scenarioEn}
        </p>
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;">
          <div class="number-input-wrapper" style="flex: 1;">
            <input type="number" step="any" class="math-input" id="input-whatif" placeholder="?" />
            <span class="unit-label">${whatIfCfg.unit || ''}</span>
          </div>
          <button class="btn btn-warning" id="btn-test-whatif" style="white-space: nowrap;">
            🚀 ${I18n.t('btnTestWhatIf')}
          </button>
        </div>
        <div id="whatif-feedback"></div>
      </div>

      <!-- CHALLENGE 3: SELF-ASSESSMENT -->
      <div class="review-card" id="challenge-self-assessment" style="margin-bottom: 1.5rem;">
        <div class="review-card-header">
          <span class="review-card-icon">🧠</span>
          <h4>${I18n.t('selfAssessmentTitle')}</h4>
        </div>
        <p style="font-size: 0.92rem; margin: 0.5rem 0 0.75rem 0;">
          ${I18n.t('selfConfidencePrompt')}
        </p>
        <div class="self-assessment-rating" style="display: flex; justify-content: space-between; gap: 0.35rem;">
          <button class="btn-self-rate" data-score="1" title="Cần trợ giúp nhiều">😕<br/><small>20%</small></button>
          <button class="btn-self-rate" data-score="2" title="Đã hiểu một phần">🤔<br/><small>40%</small></button>
          <button class="btn-self-rate" data-score="3" title="Tự làm được">🙂<br/><small>60%</small></button>
          <button class="btn-self-rate" data-score="4" title="Khá tự tin">😀<br/><small>80%</small></button>
          <button class="btn-self-rate" data-score="5" title="Hoàn toàn tự tin">🌟<br/><small>100%</small></button>
        </div>
        <div id="self-assessment-feedback" style="margin-top: 0.5rem; font-size: 0.85rem; color: #047857; font-weight: 700;"></div>
      </div>

      <!-- FINISH BUTTON -->
      <button class="btn btn-primary btn-lg" id="btn-finish-lesson" style="width: 100%;">
        🌟 ${I18n.t('btnComplete')} (+30 ⭐)
      </button>
    `;

    // 1. Bind Unit Check
    const unitOptionBtns = container.querySelectorAll('.btn-unit-option');
    const unitFb = container.querySelector('#unit-check-feedback');
    unitOptionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        this.unitCheckPassed = isCorrect;
        unitOptionBtns.forEach(b => {
          b.classList.remove('btn-success', 'btn-danger');
          b.classList.add('btn-outline-primary');
        });

        Telemetry.logEvent(4, Telemetry.EVENT_TYPES.UNIT_CHECK_ANSWER, {
          lessonId: this.id,
          selectedId: btn.dataset.id,
          isCorrect
        });

        if (isCorrect) {
          SoundFX.playVictory();
          btn.classList.remove('btn-outline-primary');
          btn.classList.add('btn-success');
          unitFb.innerHTML = `
            <div style="color: #047857; font-size: 0.88rem; font-weight: 700;">
              ✓ ${lang === 'vi' ? 'Chính xác!' : 'Correct!'} ${lang === 'vi' ? unitCfg.explanationVi : unitCfg.explanationEn}
            </div>
          `;
        } else {
          SoundFX.playOops();
          btn.classList.remove('btn-outline-primary');
          btn.classList.add('btn-danger');
          unitFb.innerHTML = `
            <div style="color: #B91C1C; font-size: 0.88rem; font-weight: 700;">
              ✗ ${lang === 'vi' ? 'Chưa đúng rồi. Hãy nhớ lại: công thức chia quãng đường cho thời gian nhé!' : 'Not quite. Remember distance divided by time!'}
            </div>
          `;
        }
      });
    });

    // 2. Bind What-If Testing
    const btnTestWhatif = container.querySelector('#btn-test-whatif');
    const inputWhatif = container.querySelector('#input-whatif');
    const whatifFb = container.querySelector('#whatif-feedback');

    if (btnTestWhatif && inputWhatif) {
      btnTestWhatif.addEventListener('click', () => {
        const val = parseFloat(inputWhatif.value);
        if (isNaN(val)) {
          alert(lang === 'vi' ? 'Vui lòng nhập kết quả dự đoán của bạn!' : 'Please enter your predicted answer!');
          return;
        }

        const isCorrect = (whatIfCfg.expected !== undefined) 
          ? Math.abs(val - whatIfCfg.expected) < 0.1 
          : true;

        this.whatIfTested = true;

        Telemetry.logEvent(4, Telemetry.EVENT_TYPES.WHAT_IF_TESTED, {
          lessonId: this.id,
          inputVal: val,
          expected: whatIfCfg.expected,
          isCorrect
        });

        // Run simulation with what-if parameters if available
        if (simEngine && typeof whatIfCfg.runSim === 'function') {
          whatIfCfg.runSim(simEngine);
        }

        if (isCorrect) {
          SoundFX.playVictory();
          whatifFb.innerHTML = `
            <div class="feedback-box feedback-success" style="margin-top: 0.5rem; padding: 0.65rem 0.85rem;">
              <span>🎉</span>
              <div style="font-size: 0.88rem;">
                <strong>${lang === 'vi' ? 'Tuyệt vời!' : 'Great!'}</strong><br/>
                ${lang === 'vi' ? whatIfCfg.explanationVi : whatIfCfg.explanationEn}
              </div>
            </div>
          `;
        } else {
          SoundFX.playOops();
          whatifFb.innerHTML = `
            <div class="feedback-box feedback-error" style="margin-top: 0.5rem; padding: 0.65rem 0.85rem;">
              <span>⚠️</span>
              <div style="font-size: 0.88rem;">
                ${lang === 'vi' ? `Kết quả thực tế là ${whatIfCfg.expected} ${whatIfCfg.unit}. ` : `Actual result is ${whatIfCfg.expected} ${whatIfCfg.unit}. `}
                ${lang === 'vi' ? whatIfCfg.explanationVi : whatIfCfg.explanationEn}
              </div>
            </div>
          `;
        }
      });
    }

    // 3. Bind Self-Assessment
    const selfRateBtns = container.querySelectorAll('.btn-self-rate');
    const selfFb = container.querySelector('#self-assessment-feedback');
    selfRateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.playPop();
        const score = parseInt(btn.dataset.score);
        this.confidenceLevel = score;

        selfRateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        Telemetry.logEvent(4, Telemetry.EVENT_TYPES.SELF_ASSESSMENT, {
          lessonId: this.id,
          confidenceScore: score
        });

        const messages = {
          vi: [
            '',
            'Bạn rất dũng cảm khi nhận diện được phần chưa hiểu! Sparky Bot và thầy cô sẽ luôn đồng hành cùng bạn.',
            'Cố gắng thêm một chút nhé, hãy thử làm lại bài để hiểu sâu hơn!',
            'Tốt lắm! Bạn đã nắm được cốt lõi bài học.',
            'Rất tự tin! Bạn đã sẵn sàng cho bài toán tiếp theo.',
            'Tuyệt đỉnh! Bạn đã làm chủ hoàn toàn dạng toán này 🌟!'
          ],
          en: [
            '',
            'Great self-awareness! Sparky Bot and your teachers are here to help.',
            'Keep going! Retrying the lesson will deepen your intuition.',
            'Good job! You have grasped the core problem-solving pattern.',
            'Very confident! You are ready for the next challenge.',
            'Mastery level! You completely own this problem domain 🌟!'
          ]
        };

        if (selfFb) {
          selfFb.textContent = (messages[lang] || messages.vi)[score];
        }
      });
    });

    // 4. Bind Final Finish Button
    const btnFinish = container.querySelector('#btn-finish-lesson');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        SoundFX.playVictory();
        Confetti.burst(100);
        DB.addReward(30, 60);
        if (window.App) App.updateHeaderUserProfile();

        polyaEngine.markStepComplete(4);
        Telemetry.logEvent(4, Telemetry.EVENT_TYPES.LESSON_COMPLETE, {
          lessonId: this.id,
          confidenceLevel: this.confidenceLevel,
          unitCheckPassed: this.unitCheckPassed,
          whatIfTested: this.whatIfTested
        });

        alert(lang === 'vi' 
          ? '🎉 Chúc mừng bạn đã hoàn thành xuất sắc bài học và nhận được 30 sao thưởng ⭐!' 
          : '🎉 Congratulations! You completed the lesson and earned 30 bonus stars ⭐!');
        window.location.hash = '#lessons';
      });
    }
  }
}

window.LessonBase = LessonBase;
