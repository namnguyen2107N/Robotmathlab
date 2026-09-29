/**
 * LESSON 2: Robot Giao Hàng – Tính Quãng Đường (s = v × t)
 * Grade 5 Uniform Motion
 */

class Lesson2 extends LessonBase {
  constructor() {
    super({
      id: 'motion-2',
      titleKey: 'lesson2Title',
      descKey: 'lesson2Desc',
      grade: 5,
      trackLength: 60,
      unitLabel: 'km',
      timeScale: 0.8,
      simMode: 'single',

      problemText: {
        vi: 'Robot thông minh Eco nhận nhiệm vụ chuyển bưu phẩm từ trung tâm điều hành đến khu dân cư sinh thái. Robot di chuyển với vận tốc đều 15 km/h trong 3 giờ. Hãy tính quãng đường mà Robot Eco đã đi được.',
        en: 'Smart Robot Eco is tasked with delivering parcels from the control hub to an eco-residential district. The robot travels at a constant velocity of 15 km/h for 3 hours. Calculate the total distance traveled by Robot Eco.'
      },

      knowns: [
        { id: 'k1', textVi: 'Vận tốc v = 15 km/h', textEn: 'Velocity v = 15 km/h', type: 'known' },
        { id: 'k2', textVi: 'Thời gian t = 3 giờ', textEn: 'Time t = 3 hours', type: 'known' }
      ],

      unknowns: [
        { id: 'u1', textVi: 'Quãng đường s = ? km', textEn: 'Distance s = ? km', type: 'unknown' }
      ],

      correctFormulaId: 'f_dist',
      formulaOptions: [
        { id: 'f_dist', formula: 's = v × t', labelVi: 'Quãng đường = Vận tốc × Thời gian', labelEn: 'Distance = Velocity × Time' },
        { id: 'f_speed', formula: 'v = s ÷ t', labelVi: 'Vận tốc = Quãng đường ÷ Thời gian', labelEn: 'Velocity = Distance ÷ Time' },
        { id: 'f_time', formula: 't = s ÷ v', labelVi: 'Thời gian = Quãng đường ÷ Vận tốc', labelEn: 'Time = Distance ÷ Velocity' }
      ],

      expectedAnswers: {
        s: 45 // 15 * 3 = 45 km
      },

      predictionConfig: {
        promptVi: 'Trước khi tính: Robot Eco chạy đều 15 km/h trong 3 giờ. Hãy ước lượng quãng đường robot đi được khoảng bao nhiêu km?',
        promptEn: 'Before calculating: Robot Eco travels at 15 km/h for 3 hours. Estimate roughly how many km it travels?',
        defaultGuess: 40,
        unit: 'km'
      },

      unitCheckConfig: {
        questionVi: 'Vận tốc đo bằng km/h và thời gian đo bằng giờ (h). Đơn vị đúng của quãng đường s là:',
        questionEn: 'Velocity is in km/h and time in hours (h). The correct unit for distance s is:',
        options: [
          { id: 'opt1', text: 'km', isCorrect: true },
          { id: 'opt2', text: 'm', isCorrect: false },
          { id: 'opt3', text: 'km/h', isCorrect: false },
          { id: 'opt4', text: 'giờ', isCorrect: false }
        ],
        explanationVi: 's = v × t: (km/h) × h = km.',
        explanationEn: 's = v × t: (km/h) × h = km.'
      },

      whatIfConfig: {
        scenarioVi: 'Thử nghiệm: Nếu Robot Eco chạy liên tục trong 4 giờ với vận tốc 15 km/h, quãng đường đi được sẽ là bao nhiêu km?',
        scenarioEn: 'What-If: If Robot Eco travels for 4 hours at 15 km/h, how far will it travel in km?',
        expected: 60,
        unit: 'km',
        runSim: (sim) => {
          sim.robots[0].target = 60;
          sim.reset();
          sim.start();
        },
        explanationVi: 's = 15 × 4 = 60 km! Thời gian tăng lên thì quãng đường đi được tăng tỉ lệ thuận.',
        explanationEn: 's = 15 × 4 = 60 km! Distance increases in direct proportion to time.'
      }
    });
  }

  setupSimulation(simEngine) {
    simEngine.options.trackLengthUnits = 60;
    simEngine.options.unitLabel = 'km';
    simEngine.options.mode = 'single';
    simEngine.setRobots([
      { id: 'eco', name: 'Robot Eco', color: '#10B981', velocity: 15, startPosUnits: 0, targetUnits: 45, trackY: 0.78 }
    ]);
  }

  renderExecute(container, polyaEngine, simEngine) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div id="step3-pred-slot"></div>

      <div class="problem-box" style="margin-bottom: 1rem; margin-top: 0.75rem;">
        <p style="font-size: 0.95rem;">
          ${lang === 'vi' 
            ? '💡 <strong>' + I18n.t('phaseCalculationTitle') + '</strong>:<br/>Áp dụng công thức <strong>s = v × t</strong> để tính quãng đường rồi nhập kết quả:' 
            : '💡 <strong>' + I18n.t('phaseCalculationTitle') + '</strong>:<br/>Apply formula <strong>s = v × t</strong> to calculate distance and enter result:'}
        </p>
      </div>

      <div class="input-group">
        <label class="input-label" style="color: #10B981;">
          🟢 ${lang === 'vi' ? 'Quãng đường Robot Eco đi được (s):' : 'Distance traveled by Robot Eco (s):'}
        </label>
        <div class="number-input-wrapper">
          <input type="number" step="any" class="math-input" id="input-s" placeholder="?" />
          <span class="unit-label">km</span>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-check-execute" style="width: 100%; margin-top: 0.5rem;">
        🚀 ${I18n.t('btnCheck')}
      </button>

      <div id="step3-feedback"></div>
    `;

    // Render Phase 1: Prediction prompt
    const predSlot = container.querySelector('#step3-pred-slot');
    this.renderPredictionPrompt(predSlot);

    const btnCheck = container.querySelector('#btn-check-execute');
    btnCheck.addEventListener('click', () => {
      const s = parseFloat(container.querySelector('#input-s').value);
      const isCorrect = Math.abs(s - this.expectedAnswers.s) < 0.01;

      Telemetry.logEvent(3, Telemetry.EVENT_TYPES.TRIAL_ATTEMPT, {
        inputS: s,
        isCorrect,
        expected: this.expectedAnswers
      });

      const fb = container.querySelector('#step3-feedback');

      if (isCorrect) {
        polyaEngine.markStepComplete(3);
        SoundFX.playVictory();
        Confetti.burst(80);
        DB.addReward(20, 50);
        if (window.App) App.updateHeaderUserProfile();

        // Update target to calculated s and start
        simEngine.robots[0].target = s;
        simEngine.reset();
        simEngine.start();

        fb.innerHTML = `
          <div class="feedback-box feedback-success">
            <span>🎉</span>
            <div>
              <strong>${I18n.t('correctMessage')} (+20 ⭐)</strong><br/>
              <small>
                s = 15 × 3 = 45 km.<br/>
                ${lang === 'vi' ? 'Robot Eco đã mang bưu phẩm đến đích 45km an toàn!' : 'Robot Eco safely delivered the parcel to the 45km target!'}
              </small>
            </div>
          </div>
          <div id="step3-comparison-slot"></div>
        `;

        // Render Phase 3: Prediction vs Actual Comparison
        this.renderComparisonTable(fb, 45, 45, 'km', lang === 'vi' ? 'Robot Eco hoàn thành quãng đường 45km sau đúng 3 giờ hành trình!' : 'Robot Eco reached the 45km destination in exactly 3 hours!');
      } else {
        SoundFX.playOops();
        Telemetry.logEvent(3, 'ERROR_RECORDED', {
          errorType: Telemetry.ERROR_TYPES.COMPUTATIONAL,
          inputS: s
        });

        fb.innerHTML = `
          <div class="feedback-box feedback-error">
            <span>❌</span>
            <div>
              <strong>${I18n.t('incorrectMessage')}</strong><br/>
              <small>
                ${lang === 'vi' 
                  ? 'Gợi ý: Quãng đường = Vận tốc nhân với Thời gian (15 nhân với 3).' 
                  : 'Hint: Distance = Velocity multiplied by Time (15 times 3).'}
              </small>
            </div>
          </div>
        `;
      }
    });
  }
}

window.Lesson2 = Lesson2;
