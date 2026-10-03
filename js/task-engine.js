/**
 * ROBOT MATH LAB - TASK ENGINE
 * Core orchestrator for the 3 Polya tasks.
 * Manages the UI lifecycle, Polya FSM state transitions, canvas simulation,
 * interactive step validation, bilingual problem support, and PS1-PS11 event telemetry.
 */

class TaskEngine {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.taskConfig = null;
    this.polya = null;
    this.sim = null;
    this.attemptCount = 0;
    this.studentInputs = {
      step1: {},
      step2: {},
      step3: {},
      step4: {}
    };
  }

  /**
   * Load and initialize a task
   */
  loadTask(taskConfig, studentName = 'Student') {
    this.taskConfig = taskConfig;
    this.attemptCount = 0;
    this.studentInputs = { step1: {}, step2: {}, step3: {}, step4: {} };

    // Initialize Log Session
    if (window.LogEngine) {
      window.LogEngine.startSession(studentName, taskConfig.id, taskConfig.title);
    }

    // Initialize Math Hints
    if (window.MathHints) {
      window.MathHints.setTaskHints(taskConfig.id, taskConfig.title, taskConfig.hints);
      window.MathHints.setCurrentStep(1);
    }

    // Initialize Polya FSM
    this.polya = new PolyaEngine(this);
    this.polya.onChange(({ oldStep, newStep, actionType }) => {
      this.handleStepChange(oldStep, newStep, actionType);
    });

    this.renderLayout();
    this.initSimulation();
    this.polya.start();
  }

  /**
   * Render the full workspace shell
   */
  renderLayout() {
    if (!this.container) return;
    const task = this.taskConfig;
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;

    // Rule: Problem Statement ALWAYS in English with interactive vocabulary markup!
    const decoratedEn = window.VocabSupport 
      ? window.VocabSupport.decorateText(task.descriptionEn) 
      : task.descriptionEn;

    this.container.innerHTML = `
      <div class="task-workspace animate-fade-in">
        <!-- Top Navigation / Actions Bar -->
        <div class="workspace-top-bar">
          <button type="button" class="btn-back-hub" id="btn-back-hub" title="${t('btn_back_hub')}">
            ${t('btn_back_hub')}
          </button>
          <div class="workspace-task-header">
            <span class="task-badge">${task.badge}</span>
            <h2 class="workspace-task-title">${task.title}</h2>
          </div>
          <div class="workspace-top-tools">
            <button type="button" class="btn-tool-pill" id="btn-open-hints" title="${t('btn_hint')}">
              ${t('btn_hint')}
            </button>
            <button type="button" class="btn-tool-pill" id="btn-open-dict" title="${t('btn_dict')}">
              ${t('btn_dict')}
            </button>
            <button type="button" class="btn-tool-pill btn-tool-feedback hidden" id="btn-open-feedback" title="${t('btn_feedback')}">
              ${t('btn_feedback')}
            </button>
          </div>
        </div>

        <!-- Main Workspace Grid: Left = Problem & Step Form, Right = Robot Simulation -->
        <div class="workspace-main-grid">
          
          <!-- Left Column: Problem Briefing & Interactive Step Body -->
          <div class="workspace-left-col">
            <!-- Problem Description Card -->
            <section class="card problem-card">
              <div class="problem-card-header">
                <div class="problem-card-title-group">
                  <span class="problem-card-icon">📋</span>
                  <span class="problem-card-title">${t('problem_card_title')}</span>
                </div>
                <!-- Mode to show Vietnamese translation if needed -->
                <button type="button" class="btn-toggle-translation" id="btn-toggle-trans" title="Xem dịch nghĩa Tiếng Việt">
                  ${t('btn_trans_show')}
                </button>
              </div>

              <!-- Problem statement: Always English with clickable terms -->
              <div class="problem-text-en" id="problem-text-en">
                ${decoratedEn}
              </div>

              <!-- Optional Vietnamese translation revealed on demand -->
              <div class="problem-text-vi hidden" id="problem-text-vi">
                <div class="vi-trans-tag">🇻🇳 BẢN DỊCH TIẾNG VIỆT:</div>
                <div class="vi-trans-body">${task.descriptionVi}</div>
              </div>

              <div class="problem-meta-hint">
                ${t('problem_hint_meta')}
              </div>
            </section>

            <!-- Interactive Step Form Container -->
            <section class="card step-form-card" id="step-content-card">
              <!-- Dynamically populated based on active Polya step -->
            </section>
          </div>

          <!-- Right Column: Virtual Robot Simulation Sandbox -->
          <div class="workspace-right-col">
            <div class="card sim-card">
              <div class="sim-card-header">
                <div class="sim-title-group">
                  <span class="sim-icon">🤖</span>
                  <span class="sim-title">${t('sim_track_title')}</span>
                </div>
                <div class="sim-target-indicator">
                  ${t('sim_target_label')} <strong>${task.targetDistance} ${task.unit}</strong>
                </div>
              </div>

              <!-- Canvas Simulation Container -->
              <div class="canvas-wrapper" id="canvas-container">
                <canvas id="robot-canvas"></canvas>
                <!-- Target flag label overlay -->
                <div class="track-destination-flag" id="destination-flag" title="Destination: ${task.targetDistance}m">
                  🏁 ${task.targetDistance}m
                </div>
              </div>

              <!-- Kinematics Readout Bar -->
              <div class="kinematics-readout">
                <div class="readout-item">
                  <span class="readout-label">${t('sim_speed_label')}</span>
                  <span class="readout-value" id="disp-speed">-- ${task.speedUnit}</span>
                </div>
                <div class="readout-item">
                  <span class="readout-label">${t('sim_time_label')}</span>
                  <span class="readout-value" id="disp-time">-- ${task.timeUnit}</span>
                </div>
                <div class="readout-item readout-highlight">
                  <span class="readout-label">${t('sim_dist_label')}</span>
                  <span class="readout-value" id="disp-dist">0.0 ${task.unit}</span>
                </div>
              </div>

              <!-- Simulation Message Box -->
              <div class="sim-status-box" id="sim-status-box">
                ${t('sim_ready')}
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    // Event Listeners for Top Bar Tools
    document.getElementById('btn-back-hub').onclick = () => {
      const confirmMsg = t('confirm_leave_task');
      if (confirm(confirmMsg)) {
        if (this.sim) {
          this.sim.destroy();
        }
        window.App.renderTaskSelection();
      }
    };

    document.getElementById('btn-open-hints').onclick = () => {
      if (window.MathHints) window.MathHints.openModal();
    };

    document.getElementById('btn-open-dict').onclick = () => {
      if (window.VocabSupport) window.VocabSupport.openDictionaryModal();
    };

    const topFbBtn = document.getElementById('btn-open-feedback');
    if (topFbBtn) {
      topFbBtn.onclick = () => {
        if (window.FeedbackEngine) window.FeedbackEngine.showModal();
      };
    }

    // Problem translation toggle
    const toggleTransBtn = document.getElementById('btn-toggle-trans');
    const viText = document.getElementById('problem-text-vi');
    if (toggleTransBtn && viText) {
      toggleTransBtn.onclick = () => {
        if (window.SoundFX) window.SoundFX.playPop();
        const isShowing = !viText.classList.contains('hidden');
        if (isShowing) {
          viText.classList.add('hidden');
          toggleTransBtn.classList.remove('active');
          toggleTransBtn.innerHTML = t('btn_trans_show');
        } else {
          viText.classList.remove('hidden');
          toggleTransBtn.classList.add('active');
          toggleTransBtn.innerHTML = t('btn_trans_hide');
        }
      };
    }
  }

  /**
   * Reactive Language Update without losing state
   */
  updateLanguage() {
    if (!this.container || !this.taskConfig) return;
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;

    // Top Bar
    const backBtn = document.getElementById('btn-back-hub');
    if (backBtn) backBtn.innerText = t('btn_back_hub');

    const hintBtn = document.getElementById('btn-open-hints');
    if (hintBtn) {
      const count = window.MathHints?.unlockedLevel || 0;
      hintBtn.innerHTML = count > 0 ? `💡 Hint (${count}/3)` : t('btn_hint');
    }

    const dictBtn = document.getElementById('btn-open-dict');
    if (dictBtn) dictBtn.innerText = t('btn_dict');

    // Problem Card
    const probTitle = document.querySelector('.problem-card-title');
    if (probTitle) probTitle.innerText = t('problem_card_title');

    const toggleTransBtn = document.getElementById('btn-toggle-trans');
    const viText = document.getElementById('problem-text-vi');
    if (toggleTransBtn && viText) {
      const isShowing = !viText.classList.contains('hidden');
      toggleTransBtn.innerHTML = isShowing ? t('btn_trans_hide') : t('btn_trans_show');
    }

    const metaHint = document.querySelector('.problem-meta-hint');
    if (metaHint) metaHint.innerHTML = t('problem_hint_meta');

    // Simulation Card
    const simTitle = document.querySelector('.sim-title');
    if (simTitle) simTitle.innerText = t('sim_track_title');

    const simTargetInd = document.querySelector('.sim-target-indicator');
    if (simTargetInd) simTargetInd.innerHTML = `${t('sim_target_label')} <strong>${this.taskConfig.targetDistance} ${this.taskConfig.unit}</strong>`;

    const labels = document.querySelectorAll('.kinematics-readout .readout-label');
    if (labels[0]) labels[0].innerText = t('sim_speed_label');
    if (labels[1]) labels[1].innerText = t('sim_time_label');
    if (labels[2]) labels[2].innerText = t('sim_dist_label');

    // Re-render active step
    if (this.polya) {
      this.renderStep(this.polya.currentStep);
    }
  }

  /**
   * Initialize Canvas Simulation with track length and robot
   */
  initSimulation() {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    if (this.sim) {
      this.sim.destroy();
    }

    const task = this.taskConfig;
    this.sim = new SimulationEngine('robot-canvas', {
      trackLengthUnits: task.trackLength,
      unitLabel: task.unit,
      targetDistance: task.targetDistance,
      timeScale: 1.0
    });

    this.sim.setRobots([{
      id: 'main_bot',
      name: 'Alpha Bot',
      color: '#4f46e5',
      velocity: task.robotSpeed,
      startPosUnits: 0,
      targetUnits: task.targetDistance
    }]);

    this.sim.onResize = () => {
      this.updateFlagPosition();
    };

    setTimeout(() => {
      if (this.sim) this.sim.resizeCanvas();
      this.updateFlagPosition();
    }, 60);

    this.sim.onTick = (state) => {
      const bot = this.sim.robots[0];
      if (bot) {
        document.getElementById('disp-dist').innerText = `${bot.position.toFixed(1)} ${task.unit}`;
        document.getElementById('disp-speed').innerText = `${bot.velocity.toFixed(1)} ${task.speedUnit}`;
        document.getElementById('disp-time').innerText = `${this.sim.elapsedSimTime.toFixed(1)} ${task.timeUnit}`;
      }
    };
  }

  updateFlagPosition() {
    const flagEl = document.getElementById('destination-flag');
    if (flagEl && this.sim && this.taskConfig) {
      const px = this.sim.unitsToPixels(this.taskConfig.targetDistance);
      flagEl.style.left = `${px}px`;
    }
  }

  /**
   * Handle step state changes from PolyaEngine
   */
  handleStepChange(oldStep, newStep, actionType) {
    if (window.MathHints) {
      window.MathHints.setCurrentStep(newStep);
    }

    // Update Sparky mascot speech bubble with localized messages
    const sparkyBubble = document.getElementById('sparky-bubble');
    if (sparkyBubble) {
      const key = `sparky_step_${newStep}`;
      const msg = window.I18N ? window.I18N.t(key) : "Cố lên bạn nhé! 🤖✨";
      sparkyBubble.innerText = msg;
    }

    if (window.SoundFX && actionType !== 'START') {
      window.SoundFX.playPop();
    }

    // Render active step content
    this.renderStep(newStep);
  }

  renderStep(stepNumber) {
    const card = document.getElementById('step-content-card');
    if (!card) return;

    switch (stepNumber) {
      case 1:
        this.renderStep1(card);
        break;
      case 2:
        this.renderStep2(card);
        break;
      case 3:
        this.renderStep3(card);
        break;
      case 4:
        this.renderStep4(card);
        break;
    }
  }

  // =========================================================================
  // STEP 1: UNDERSTAND THE PROBLEM (PS1 - PS3)
  // =========================================================================
  renderStep1(container) {
    const s1 = this.taskConfig.step1;
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;
    const isVi = window.I18N ? window.I18N.isVietnamese() : false;

    container.innerHTML = `
      <div class="step-view animate-fade-in">
        <div class="step-header">
          <span class="step-badge step-1-badge">${t('s1_badge')}</span>
          <h3 class="step-title">${t('s1_title')}</h3>
        </div>

        <p class="step-instruction">
          <strong>${s1.promptEn}</strong><br/>
          <small class="text-muted">${s1.promptVi}</small>
        </p>

        <!-- Given Data Inputs (PS1) -->
        <div class="given-fields-box">
          <div class="given-fields-heading">${t('s1_given_heading')}</div>
          ${s1.fields.map(f => `
            <div class="input-group-row">
              <label for="input-s1-${f.key}" class="field-label">
                <strong>${f.label}:</strong>
              </label>
              <div class="input-with-unit">
                <input type="number" step="any" id="input-s1-${f.key}" class="input-field" placeholder="${f.placeholder}" value="${this.studentInputs.step1[f.key] !== undefined ? this.studentInputs.step1[f.key] : ''}" />
                <span class="unit-tag">${f.unit}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Target Quantity Question (PS2) -->
        <div class="target-qty-box">
          <label class="field-label">
            <strong>${s1.targetQuestionEn}</strong>
            <div class="text-muted small">${s1.targetQuestionVi}</div>
          </label>
          <div class="options-radio-group">
            ${s1.targetOptions.map(opt => `
              <label class="radio-card ${this.studentInputs.step1.targetQty === opt.id ? 'selected' : ''}">
                <input type="radio" name="s1-target-qty" value="${opt.id}" ${this.studentInputs.step1.targetQty === opt.id ? 'checked' : ''} />
                <span>${opt.label}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="step-error-box hidden" id="s1-error-box"></div>

        <div class="step-actions">
          <button type="button" class="btn-primary" id="btn-submit-step-1">
            ${t('s1_btn_next')}
          </button>
        </div>
      </div>
    `;

    // Radio selection visual styling
    container.querySelectorAll('input[name="s1-target-qty"]').forEach(r => {
      r.onchange = () => {
        container.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
        r.closest('.radio-card').classList.add('selected');
      };
    });

    document.getElementById('btn-submit-step-1').onclick = () => {
      this.validateStep1();
    };
  }

  validateStep1() {
    const s1 = this.taskConfig.step1;
    const errorBox = document.getElementById('s1-error-box');
    errorBox.classList.add('hidden');
    const t = (k) => window.I18N ? window.I18N.t(k) : k;

    const enteredData = {};
    let allFilled = true;

    s1.fields.forEach(f => {
      const val = parseFloat(document.getElementById(`input-s1-${f.key}`).value);
      if (isNaN(val)) allFilled = false;
      enteredData[f.key] = val;
    });

    const selectedTarget = document.querySelector('input[name="s1-target-qty"]:checked')?.value;

    if (!allFilled || !selectedTarget) {
      errorBox.innerText = t('s1_error_missing');
      errorBox.classList.remove('hidden');
      return;
    }

    // Verify given values and target quantity
    const mismatches = [];
    s1.fields.forEach(f => {
      if (f.expected !== undefined && enteredData[f.key] !== f.expected) {
        mismatches.push({ field: f.key, entered: enteredData[f.key], expected: f.expected });
      }
    });

    const correctTargetOpt = s1.targetOptions.find(o => o.correct);
    if (correctTargetOpt && selectedTarget !== correctTargetOpt.id) {
      mismatches.push({ field: 'target', entered: selectedTarget, expected: correctTargetOpt.id });
    }

    if (mismatches.length > 0) {
      if (window.LogEngine) {
        window.LogEngine.logEvent('STEP1_MISMATCH', 'Identified data does not match problem statement', {
          mismatches,
          enteredData,
          selectedTarget
        });
      }
      if (window.SoundFX) window.SoundFX.playOops();
      errorBox.innerHTML = window.I18N && window.I18N.isVietnamese()
        ? '💡 Có một số thông tin chưa khớp với đề bài. Hãy đọc lại đề bài tiếng Anh và kiểm tra lại số liệu nhé!'
        : '💡 Some values do not match the problem statement. Please check the problem text and numbers again!';
      errorBox.classList.remove('hidden');
      return;
    }

    this.studentInputs.step1 = { ...enteredData, targetQty: selectedTarget };

    if (window.SoundFX) window.SoundFX.playTing();

    // Log PS1, PS2, PS3
    if (window.LogEngine) {
      window.LogEngine.logEvent('PS1', 'Identify given data', enteredData);
      window.LogEngine.logEvent('PS2', 'Identify target quantity', { targetQuantity: selectedTarget });
      window.LogEngine.logEvent('PS3', 'Confirm problem parameters and constraints', {
        fields: enteredData,
        target: selectedTarget
      });
    }

    this.polya.markStepComplete(1);
    this.polya.nextStep();
  }

  // =========================================================================
  // STEP 2: PLAN (PS4 - PS5)
  // =========================================================================
  renderStep2(container) {
    const s2 = this.taskConfig.step2;
    const t = (k) => window.I18N ? window.I18N.t(k) : k;

    container.innerHTML = `
      <div class="step-view animate-fade-in">
        <div class="step-header">
          <span class="step-badge step-2-badge">${t('s2_badge')}</span>
          <h3 class="step-title">${t('s2_title')}</h3>
        </div>

        ${s2.proposedNoteEn ? `
          <div class="alert-box-info">
            <strong>${s2.proposedNoteEn}</strong>
            <div>${s2.proposedNoteVi}</div>
          </div>
        ` : ''}

        <p class="step-instruction">
          <strong>${s2.promptEn}</strong><br/>
          <small class="text-muted">${s2.promptVi}</small>
        </p>

        <!-- Formula Options -->
        <div class="formula-group">
          ${s2.formulaOptions.map(opt => `
            <label class="radio-card formula-card ${this.studentInputs.step2.formulaId === opt.id ? 'selected' : ''}">
              <input type="radio" name="s2-formula" value="${opt.id}" ${this.studentInputs.step2.formulaId === opt.id ? 'checked' : ''} />
              <span class="formula-text"><strong>${opt.text}</strong></span>
            </label>
          `).join('')}
        </div>

        <!-- Calculation Input -->
        <div class="calc-box">
          <label class="field-label" for="input-s2-calc">
            <strong>${s2.calcPromptEn}</strong>
            <div class="text-muted small">${s2.calcPromptVi}</div>
          </label>
          <div class="input-with-unit">
            <input type="number" step="any" id="input-s2-calc" class="input-field" placeholder="" value="${this.studentInputs.step2.calcResult !== undefined ? this.studentInputs.step2.calcResult : ''}" />
            <span class="unit-tag">${s2.resultUnit}</span>
          </div>
        </div>

        <div class="step-error-box hidden" id="s2-error-box"></div>

        <div class="step-actions">
          <button type="button" class="btn-secondary" id="btn-back-step-1">${t('s2_btn_back')}</button>
          <button type="button" class="btn-primary" id="btn-submit-step-2">${t('s2_btn_next')}</button>
        </div>
      </div>
    `;

    container.querySelectorAll('input[name="s2-formula"]').forEach(r => {
      r.onchange = () => {
        container.querySelectorAll('.formula-card').forEach(c => c.classList.remove('selected'));
        r.closest('.formula-card').classList.add('selected');
      };
    });

    document.getElementById('btn-back-step-1').onclick = () => this.polya.prevStep();
    document.getElementById('btn-submit-step-2').onclick = () => this.validateStep2();
  }

  validateStep2() {
    const s2 = this.taskConfig.step2;
    const errorBox = document.getElementById('s2-error-box');
    errorBox.classList.add('hidden');
    const t = (k) => window.I18N ? window.I18N.t(k) : k;

    const formulaId = document.querySelector('input[name="s2-formula"]:checked')?.value;
    const calcVal = parseFloat(document.getElementById('input-s2-calc').value);

    if (!formulaId || isNaN(calcVal)) {
      errorBox.innerText = t('s2_error_missing');
      errorBox.classList.remove('hidden');
      return;
    }

    const selectedFormula = s2.formulaOptions.find(f => f.id === formulaId);
    const formulaCorrect = !!selectedFormula?.correct;
    const calcCorrect = calcVal === s2.expectedResult;

    if (!formulaCorrect || !calcCorrect) {
      if (window.LogEngine) {
        window.LogEngine.logEvent('STEP2_MISTAKE', 'Formula or calculation mismatch', {
          formulaId,
          formulaCorrect,
          calcVal,
          expectedResult: s2.expectedResult
        });
      }
      if (window.SoundFX) window.SoundFX.playOops();
      errorBox.innerHTML = window.I18N && window.I18N.isVietnamese()
        ? '💡 Công thức hoặc kết quả tính toán chưa chính xác. Hãy xem kỹ mối liên hệ giữa các đại lượng hoặc bấm nút 💡 Gợi ý để được hỗ trợ nhé!'
        : '💡 The chosen formula or calculation is not yet correct. Please check your math or click 💡 Hint for assistance!';
      errorBox.classList.remove('hidden');
      return;
    }

    this.studentInputs.step2 = {
      formulaId,
      formulaText: selectedFormula?.text || '',
      calcResult: calcVal
    };

    if (this.taskConfig.step3?.canEditTime) {
      this.studentInputs.step3.time = calcVal;
    }

    if (window.SoundFX) window.SoundFX.playTing();

    // Log PS4 & PS5
    if (window.LogEngine) {
      window.LogEngine.logEvent('PS4', 'Select mathematical formula', {
        formulaId,
        formula: selectedFormula?.formula || '',
        correct: true
      });
      window.LogEngine.logEvent('PS5', 'Initial mathematical plan and calculation', {
        calculationResult: calcVal,
        expectedResult: s2.expectedResult,
        matchesExpected: true
      });
    }

    this.polya.markStepComplete(2);
    this.polya.nextStep();
  }

  // =========================================================================
  // STEP 3: EXECUTE (PS6 - PS7)
  // =========================================================================
  renderStep3(container) {
    const s3 = this.taskConfig.step3;
    const task = this.taskConfig;
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;

    const prefilledTime = this.studentInputs.step3.time !== undefined 
      ? this.studentInputs.step3.time 
      : (s3.canEditTime && this.studentInputs.step2.calcResult !== undefined 
          ? this.studentInputs.step2.calcResult 
          : s3.defaultTime);

    const prefilledSpeed = this.studentInputs.step3.speed !== undefined
      ? this.studentInputs.step3.speed
      : s3.defaultSpeed;

    container.innerHTML = `
      <div class="step-view animate-fade-in">
        <div class="step-header">
          <span class="step-badge step-3-badge">${t('s3_badge')}</span>
          <h3 class="step-title">${t('s3_title')}</h3>
        </div>

        <p class="step-instruction">
          <strong>${s3.promptEn}</strong><br/>
          <small class="text-muted">${s3.promptVi}</small>
        </p>

        ${s3.noteEn ? `
          <div class="alert-box-info">
            ℹ️ ${s3.noteEn}
          </div>
        ` : ''}

        <!-- Robot Parameter Controls (PS6) -->
        <div class="robot-params-panel">
          <div class="param-row">
            <label class="param-label" for="param-speed">
              <span>${t('s3_speed_label')}</span>
              <strong class="param-badge">${prefilledSpeed} ${task.speedUnit}</strong>
            </label>
            ${s3.canEditSpeed ? `
              <input type="number" step="any" id="param-speed" class="input-field" value="${prefilledSpeed}" />
            ` : `
              <input type="hidden" id="param-speed" value="${prefilledSpeed}" />
              <div class="locked-field-badge">${t('s3_speed_locked')}</div>
            `}
          </div>

          <div class="param-row">
            <label class="param-label" for="param-time">
              <span>${t('s3_time_label')}</span>
              <span class="unit-tag">${task.timeUnit}</span>
            </label>
            ${s3.canEditTime ? `
              <input type="number" step="any" id="param-time" class="input-field" value="${prefilledTime}" />
            ` : `
              <input type="number" step="any" id="param-time" class="input-field" value="${prefilledTime}" readonly style="background:#f1f5f9; cursor:not-allowed;" />
              <small class="text-muted">${t('s3_time_flawed_note')}</small>
            `}
          </div>
        </div>

        <div class="sim-feedback-card hidden" id="step-3-sim-feedback"></div>

        <div class="step-actions">
          <button type="button" class="btn-secondary" id="btn-back-step-2">${t('s3_btn_back')}</button>
          <button type="button" class="btn-action-run" id="btn-run-robot">
            ${t('s3_btn_run')}
          </button>
          <button type="button" class="btn-primary hidden" id="btn-go-to-step-4">
            ${t('s3_btn_next')}
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-back-step-2').onclick = () => this.polya.prevStep();

    document.getElementById('btn-run-robot').onclick = () => {
      this.executeSimulationRun();
    };

    document.getElementById('btn-go-to-step-4').onclick = () => {
      this.polya.markStepComplete(3);
      this.polya.nextStep();
    };
  }

  executeSimulationRun() {
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;
    const speed = parseFloat(document.getElementById('param-speed').value);
    const time = parseFloat(document.getElementById('param-time').value);

    if (isNaN(speed) || isNaN(time) || time <= 0) {
      alert(t('s3_val_error'));
      return;
    }

    this.attemptCount++;
    this.studentInputs.step3 = { speed, time };

    // Update readout displays immediately
    document.getElementById('disp-speed').innerText = `${speed.toFixed(1)} ${this.taskConfig.speedUnit}`;
    document.getElementById('disp-time').innerText = `0.0 ${this.taskConfig.timeUnit}`;
    document.getElementById('disp-dist').innerText = `0.0 ${this.taskConfig.unit}`;

    // Disable run button while running
    const runBtn = document.getElementById('btn-run-robot');
    runBtn.disabled = true;
    runBtn.innerText = t('s3_btn_running');

    const statusBox = document.getElementById('sim-status-box');
    statusBox.innerText = t('sim_moving', { speed, time });

    // Log PS6 (Set Robot Parameters)
    if (window.LogEngine) {
      window.LogEngine.logEvent('PS6', 'Set robot parameters', {
        attempt: this.attemptCount,
        speed,
        time,
        expectedDistance: speed * time,
        targetDistance: this.taskConfig.targetDistance
      });
    }

    // Configure simulation robot
    this.sim.reset();
    const bot = this.sim.robots[0];
    if (bot) {
      bot.velocity = speed;
      bot.target = speed * time;
    }

    // Start simulation run
    this.sim.start();

    // Robot finish handler
    this.sim.onFinish = () => {
      runBtn.disabled = false;
      runBtn.innerText = t('s3_btn_rerun');

      const finalDist = Number((speed * time).toFixed(1));
      const targetDist = this.taskConfig.targetDistance;
      const discrepancy = Number((finalDist - targetDist).toFixed(1));
      const isMatch = Math.abs(discrepancy) < 0.01;

      // Update observation readout
      document.getElementById('disp-dist').innerText = `${finalDist} ${this.taskConfig.unit}`;
      document.getElementById('disp-time').innerText = `${time} ${this.taskConfig.timeUnit}`;

      // Factual feedback
      const feedbackEl = document.getElementById('step-3-sim-feedback');
      feedbackEl.classList.remove('hidden');
      feedbackEl.innerHTML = `
        <div class="feedback-title">${t('s3_obs_title')}</div>
        <div class="feedback-metric">
          ${t('s3_obs_traveled', { dist: finalDist, time })}
        </div>
        <div class="feedback-target-comp">
          ${t('s3_obs_target', { target: targetDist })}
        </div>
      `;

      statusBox.innerHTML = t('sim_stopped', { dist: finalDist });

      // Audio & Mascot Feedback
      if (isMatch) {
        if (window.SoundFX) window.SoundFX.playVictory();
        const sparkyBubble = document.getElementById('sparky-bubble');
        if (sparkyBubble) sparkyBubble.innerText = t('sparky_victory');
      } else {
        if (window.SoundFX) window.SoundFX.playOops();
        const sparkyBubble = document.getElementById('sparky-bubble');
        if (sparkyBubble) sparkyBubble.innerText = t('sparky_oops');
      }

      // Log PS7 (Execution Result)
      if (window.LogEngine) {
        window.LogEngine.logEvent('PS7', 'Execution observation result', {
          attempt: this.attemptCount,
          actualDistance: finalDist,
          targetDistance: targetDist,
          discrepancy,
          meetsRequirement: isMatch
        });
      }

      // Show Next Step button
      document.getElementById('btn-go-to-step-4').classList.remove('hidden');
    };
  }

  // =========================================================================
  // STEP 4: LOOK BACK & VERIFY (PS8 - PS11)
  // =========================================================================
  renderStep4(container) {
    const s4 = this.taskConfig.step4;
    const task = this.taskConfig;
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;

    const speed = this.studentInputs.step3.speed !== undefined ? this.studentInputs.step3.speed : (this.taskConfig.robotSpeed || 0);
    const time = this.studentInputs.step3.time !== undefined ? this.studentInputs.step3.time : (this.taskConfig.correctTime || 0);
    const lastDist = Number((speed * time).toFixed(1));
    const isSuccess = Math.abs(lastDist - task.targetDistance) < 0.01;

    container.innerHTML = `
      <div class="step-view animate-fade-in">
        <div class="step-header">
          <span class="step-badge step-4-badge">${t('s4_badge')}</span>
          <h3 class="step-title">${t('s4_title')}</h3>
        </div>

        <!-- Question PS8: Check Result without spoiler banner -->
        <div class="lookback-q-box">
          <label class="field-label">
            <strong>${s4.checkQuestionEn}</strong>
            <div class="text-muted small">${s4.checkQuestionVi}</div>
          </label>
          <div class="binary-choice-group">
            <button type="button" class="btn-choice ${this.studentInputs.step4.checkResult === 'yes' ? 'selected' : ''}" id="btn-check-yes">
              ${t('s4_btn_yes', { target: task.targetDistance })}
            </button>
            <button type="button" class="btn-choice ${this.studentInputs.step4.checkResult === 'no' ? 'selected' : ''}" id="btn-check-no">
              ${t('s4_btn_no', { target: task.targetDistance })}
            </button>
          </div>
        </div>

        <!-- Sub-flow depending on Yes / No -->
        <div id="lookback-subflow">
          <!-- Rendered dynamically below -->
        </div>

        <div class="step-actions">
          <button type="button" class="btn-secondary" id="btn-back-step-3">${t('s4_btn_back')}</button>
          <div id="step-4-finish-action"></div>
        </div>
      </div>
    `;

    document.getElementById('btn-back-step-3').onclick = () => this.polya.prevStep();

    document.getElementById('btn-check-yes').onclick = () => {
      if (isSuccess) {
        this.handlePS8Choice('yes');
      } else {
        // Robot did not reach destination; guide student to observe ruler without giving away numeric calculation
        if (window.LogEngine) {
          window.LogEngine.logEvent('PS8', 'Initial observation evaluation', {
            response: 'yes',
            accurate: false,
            actualDistance: lastDist,
            targetDistance: task.targetDistance
          });
        }
        document.getElementById('btn-check-yes')?.classList.remove('selected');
        document.getElementById('btn-check-no')?.classList.remove('selected');
        const subflow = document.getElementById('lookback-subflow');
        if (subflow) {
          subflow.innerHTML = `
            <div class="observation-hint-box animate-fade-in">
              <span class="obs-icon">🧐</span>
              <div>
                <strong>${t('s4_obs_recheck')}</strong>
              </div>
            </div>
          `;
        }
      }
    };

    document.getElementById('btn-check-no').onclick = () => {
      if (!isSuccess) {
        this.handlePS8Choice('no');
      } else {
        // Robot actually reached destination
        document.getElementById('btn-check-yes')?.classList.remove('selected');
        document.getElementById('btn-check-no')?.classList.remove('selected');
        const subflow = document.getElementById('lookback-subflow');
        const isVi = window.I18N ? window.I18N.isVietnamese() : false;
        if (subflow) {
          subflow.innerHTML = `
            <div class="observation-hint-box animate-fade-in">
              <span class="obs-icon">🧐</span>
              <div>
                <strong>${isVi ? `Thước đo trên đường chạy cho thấy robot đã dừng đúng mốc ${task.targetDistance}m rồi đó! Hãy kiểm tra lại nhé!` : `The track ruler shows the robot landed right on the ${task.targetDistance}m marker! Please verify again!`}</strong>
              </div>
            </div>
          `;
        }
      }
    };

    // Only restore state if student previously made an active choice
    if (this.studentInputs.step4.checkResult) {
      this.handlePS8Choice(this.studentInputs.step4.checkResult, true);
    } else {
      // Clean initial state: prompt student to observe without pre-judging
      const subflow = document.getElementById('lookback-subflow');
      if (subflow) {
        subflow.innerHTML = `
          <div class="observation-prompt-card animate-fade-in">
            <span class="obs-icon">👀</span>
            <div>${t('s4_obs_prompt')}</div>
          </div>
        `;
      }
    }
  }

  handlePS8Choice(choice, isRepaint = false) {
    this.studentInputs.step4.checkResult = choice;
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;

    document.getElementById('btn-check-yes')?.classList.toggle('selected', choice === 'yes');
    document.getElementById('btn-check-no')?.classList.toggle('selected', choice === 'no');

    if (!isRepaint && window.LogEngine) {
      window.LogEngine.logEvent('PS8', 'Check result against requirements', {
        response: choice,
        meetsRequirement: choice === 'yes'
      });
    }

    const subflow = document.getElementById('lookback-subflow');
    const finishAction = document.getElementById('step-4-finish-action');
    const s4 = this.taskConfig.step4;

    if (choice === 'yes') {
      subflow.innerHTML = `
        <div class="verified-box animate-fade-in">
          <div class="verified-icon">🏆</div>
          <div class="lookback-status-banner banner-success">${t('s4_banner_success')}</div>
          <h4>${t('s4_math_proof_title')}</h4>
          <p class="math-proof">
            <strong>s = v × t</strong> = ${this.studentInputs.step3.speed} m/s × ${this.studentInputs.step3.time} s = <strong>${this.taskConfig.targetDistance} m</strong>
          </p>
          <div class="reflection-box">
            <label for="input-reflection" class="field-label">
              <strong>${s4.reflectionPromptEn}</strong>
              <div class="text-muted small">${s4.reflectionPromptVi}</div>
            </label>
            <textarea id="input-reflection" class="input-textarea" rows="2" placeholder="${t('s4_refl_placeholder')}">${this.studentInputs.step4.reflection || ''}</textarea>
          </div>
        </div>
      `;

      finishAction.innerHTML = `
        <button type="button" class="btn-primary btn-complete-task" id="btn-complete-mission">
          ${t('s4_btn_complete')}
        </button>
      `;

      document.getElementById('btn-complete-mission').onclick = () => {
        const refl = document.getElementById('input-reflection')?.value || '';
        this.studentInputs.step4.reflection = refl;

        if (window.LogEngine) {
          window.LogEngine.logEvent('TASK_REFLECTION', 'Student reflection submitted', { reflection: refl });
          window.LogEngine.completeSession(true);
        }

        this.polya.markStepComplete(4);
        this.showMissionCompletedModal();
      };

    } else {
      // Diagnostic & Parameter Adjustment (PS9, PS10, PS11)
      subflow.innerHTML = `
        <div class="debug-cycle-card animate-fade-in">
          <div class="observation-confirm-box">
            <span class="obs-icon">👍</span>
            <div>
              <strong>${t('s4_obs_accurate')}</strong>
              <div class="text-muted small">${t('s4_obs_shortfall')}</div>
            </div>
          </div>

          <div class="debug-step-item">
            <span class="step-sub-badge">🔍</span>
            <label class="field-label">
              <strong>${s4.discrepancyQuestionEn}</strong>
              <div class="text-muted small">${s4.discrepancyQuestionVi}</div>
            </label>
            <div class="options-radio-group">
              ${(s4.discrepancyOptions || []).map(opt => `
                <label class="radio-card ${this.studentInputs.step4.discrepancyId === opt.id ? 'selected' : ''}">
                  <input type="radio" name="ps9-disc" value="${opt.id}" ${this.studentInputs.step4.discrepancyId === opt.id ? 'checked' : ''} />
                  <span>${opt.label}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="debug-step-item">
            <span class="step-sub-badge">⚙️</span>
            <label class="field-label">
              <strong>${s4.diagnosisQuestionEn || 'Plan Adjustment'}</strong>
              <div class="text-muted small">${s4.diagnosisQuestionVi || 'Điều chỉnh phương án:'}</div>
            </label>
            ${s4.diagnosisOptions ? `
              <div class="options-radio-group">
                ${s4.diagnosisOptions.map(opt => `
                  <label class="radio-card ${this.studentInputs.step4.diagnosisId === opt.id ? 'selected' : ''}">
                    <input type="radio" name="ps10-diag" value="${opt.id}" ${this.studentInputs.step4.diagnosisId === opt.id ? 'checked' : ''} />
                    <span>${opt.label}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}

            <div class="revision-input-row">
              <label for="input-revised-time">
                <strong>${s4.revisionPromptEn || 'New Time value for robot:'}</strong>
              </label>
              <div class="input-with-unit">
                <input type="number" step="any" id="input-revised-time" class="input-field" placeholder="" value="${this.studentInputs.step4.revisedTime || ''}" />
                <span class="unit-tag">${this.taskConfig.timeUnit}</span>
              </div>
            </div>
          </div>
        </div>
      `;

      finishAction.innerHTML = `
        <button type="button" class="btn-action-run" id="btn-retry-ps11">
          ${t('s4_btn_retry')}
        </button>
      `;

      subflow.querySelectorAll('input[name="ps9-disc"]').forEach(r => {
        r.onchange = () => {
          subflow.querySelectorAll('input[name="ps9-disc"]').forEach(x => x.closest('.radio-card').classList.remove('selected'));
          r.closest('.radio-card').classList.add('selected');
        };
      });

      subflow.querySelectorAll('input[name="ps10-diag"]').forEach(r => {
        r.onchange = () => {
          subflow.querySelectorAll('input[name="ps10-diag"]').forEach(x => x.closest('.radio-card').classList.remove('selected'));
          r.closest('.radio-card').classList.add('selected');
        };
      });

      document.getElementById('btn-retry-ps11').onclick = () => {
        this.handlePS11Retry();
      };
    }
  }

  handlePS11Retry() {
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;
    const discId = document.querySelector('input[name="ps9-disc"]:checked')?.value;
    const diagId = document.querySelector('input[name="ps10-diag"]:checked')?.value;
    const revisedTime = parseFloat(document.getElementById('input-revised-time').value);

    if (isNaN(revisedTime) || revisedTime <= 0) {
      alert(t('s4_input_error'));
      return;
    }

    this.studentInputs.step4.discrepancyId = discId;
    this.studentInputs.step4.diagnosisId = diagId;
    this.studentInputs.step4.revisedTime = revisedTime;

    // Log PS9 & PS10
    if (window.LogEngine) {
      window.LogEngine.logEvent('PS9', 'Error detection and discrepancy identification', {
        discrepancyId: discId
      });
      window.LogEngine.logEvent('PS10', 'Diagnosis and parameter revision', {
        diagnosisId: diagId,
        revisedTime
      });
    }

    // Now execute PS11: Re-run robot with the revised parameter!
    this.attemptCount++;
    const speed = this.studentInputs.step3.speed !== undefined ? this.studentInputs.step3.speed : this.taskConfig.robotSpeed;
    const targetDist = this.taskConfig.targetDistance;
    const newDist = speed * revisedTime;

    const retryBtn = document.getElementById('btn-retry-ps11');
    retryBtn.disabled = true;
    retryBtn.innerText = t('s4_testing_new');

    const statusBox = document.getElementById('sim-status-box');
    statusBox.innerText = t('s4_testing_status', { speed, time: revisedTime });

    // Configure simulation
    this.sim.reset();
    const bot = this.sim.robots[0];
    if (bot) {
      bot.velocity = speed;
      bot.target = newDist;
    }

    this.sim.start();

    this.sim.onFinish = () => {
      retryBtn.disabled = false;
      retryBtn.innerText = t('s3_btn_rerun');

      const isSuccessNow = Math.abs(newDist - targetDist) < 0.01;

      // Log PS11
      if (window.LogEngine) {
        window.LogEngine.logEvent('PS11', 'Retry and verification of adjusted plan', {
          attempt: this.attemptCount,
          revisedTime,
          newDistance: newDist,
          targetDistance: targetDist,
          success: isSuccessNow
        });
      }

      this.studentInputs.step3.time = revisedTime;

      if (isSuccessNow) {
        statusBox.innerHTML = t('s4_success_status', { target: targetDist });
        if (window.SoundFX) window.SoundFX.playVictory();
        const sparkyBubble = document.getElementById('sparky-bubble');
        if (sparkyBubble) sparkyBubble.innerText = t('sparky_victory');
        this.studentInputs.step4.checkResult = 'yes';
        this.studentInputs.step3.speed = speed;
        this.studentInputs.step3.time = revisedTime;
        this.renderStep4(document.getElementById('step-content-card'));
      } else {
        if (window.SoundFX) window.SoundFX.playOops();
        statusBox.innerHTML = `Robot stopped at <strong>${newDist} m</strong> (Target: ${targetDist} m).`;
        alert(`Robot stopped at ${newDist}m, required target is ${targetDist}m. Please calculate again!`);
      }
    };
  }

  showMissionCompletedModal() {
    let modal = document.getElementById('mission-completed-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'mission-completed-modal';
      modal.className = 'modal-backdrop animate-fade-in active';
      document.body.appendChild(modal);
    }
    if (window.SoundFX) window.SoundFX.playVictory();
    const sparkyBubble = document.getElementById('sparky-bubble');
    if (sparkyBubble) {
      sparkyBubble.innerText = window.I18N && window.I18N.isVietnamese()
        ? "Tuyệt vời quá bạn ơi! Bạn vừa nhận được chiếc cúp hoàn thành nhiệm vụ rồi! 🏆🎉"
        : "Amazing job! You earned the Mission Champion Trophy! 🏆🎉";
    }

    const session = window.LogEngine?.currentSession;
    const totalEvents = session?.events?.length || 0;
    const attempts = session?.summary?.totalAttempts || 1;
    const isVi = window.I18N ? window.I18N.isVietnamese() : false;

    modal.innerHTML = `
      <div class="modal-card completion-card animate-scale-up" style="position: relative;">
        <button type="button" class="btn-close-modal completion-close-btn" id="btn-close-completion" aria-label="Close">✕</button>
        <div class="completion-header">
          <div class="completion-trophy">🏆</div>
          <h2 class="completion-title">${isVi ? 'Hoàn Thành Xuất Sắc!' : 'Mission Accomplished!'}</h2>
          <p class="completion-sub">${isVi ? 'Bạn đã giải quyết vấn đề thành công và kiểm chứng chính xác trên robot!' : 'You mastered the 4-step problem solving cycle and verified it on the robot!'}</p>
        </div>

        <div class="completion-stats-grid">
          <div class="stat-card">
            <span class="stat-num">${attempts}</span>
            <span class="stat-lbl">${isVi ? 'Lần thử nghiệm' : 'Total Attempts'}</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${totalEvents}</span>
            <span class="stat-lbl">${isVi ? 'Hành động học tập' : 'Learning Steps Logged'}</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">4/4</span>
            <span class="stat-lbl">${isVi ? 'Bước hoàn tất' : 'Steps Completed'}</span>
          </div>
        </div>

        <div class="completion-actions">
          <button type="button" class="btn-primary btn-feedback-hero" id="btn-view-feedback">
            📋 ${isVi ? 'Xem Nhận Xét Đánh Giá (View Feedback) ➔' : 'View Process Feedback ➔'}
          </button>
          <div class="completion-sub-actions" style="grid-template-columns: 1fr;">
            <button type="button" class="btn-secondary" id="btn-next-mission" style="width: 100%;">
              ${isVi ? 'Nhiệm vụ tiếp theo →' : 'Next Mission →'}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.style.display = 'flex';
    document.getElementById('btn-open-feedback')?.classList.remove('hidden');

    const closeCompletion = () => {
      modal.classList.remove('active');
      modal.style.display = 'none';
    };

    const compCloseBtn = document.getElementById('btn-close-completion');
    if (compCloseBtn) compCloseBtn.onclick = closeCompletion;

    modal.onclick = (e) => {
      if (e.target === modal) closeCompletion();
    };

    document.getElementById('btn-view-feedback').onclick = () => {
      closeCompletion();
      if (window.FeedbackEngine) {
        window.FeedbackEngine.showModal(session);
      }
    };

    document.getElementById('btn-next-mission').onclick = () => {
      closeCompletion();
      let nextTaskId = 'task2-fix';
      if (this.taskConfig && this.taskConfig.id === 'task1-reach') nextTaskId = 'task2-fix';
      else if (this.taskConfig && this.taskConfig.id === 'task2-fix') nextTaskId = 'task3-new';
      else nextTaskId = 'hub';

      if (nextTaskId === 'hub') {
        window.App.renderTaskSelection();
      } else {
        window.App.navigateToTask(nextTaskId);
      }
    };
  }
}

window.TaskEngine = TaskEngine;
