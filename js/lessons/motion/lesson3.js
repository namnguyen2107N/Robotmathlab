/**
 * LESSON 3: Robot Cứu Hộ – Tính Thời Gian (t = s ÷ v)
 * Grade 5 Uniform Motion
 */

class Lesson3 extends LessonBase {
  constructor() {
    super({
      id: 'motion-3',
      titleKey: 'lesson3Title',
      descKey: 'lesson3Desc',
      grade: 5,
      trackLength: 140,
      unitLabel: 'km',
      timeScale: 0.8,
      simMode: 'single',

      problemText: {
        vi: 'Một đám cháy rừng được phát hiện cách trạm cứu hộ 120 km. Robot cứu hoả chuyên dụng lập tức xuất kích với vận tốc đều 40 km/h. Hỏi sau bao nhiêu giờ thì Robot cứu hoả sẽ tiếp cận được hiện trường?',
        en: 'A forest wildfire is detected 120 km away from the emergency rescue station. The specialized firefighting robot departs immediately at a constant speed of 40 km/h. How many hours will it take for the robot to reach the scene?'
      },

      knowns: [
        { id: 'k1', textVi: 'Quãng đường s = 120 km', textEn: 'Distance s = 120 km', type: 'known' },
        { id: 'k2', textVi: 'Vận tốc v = 40 km/h', textEn: 'Velocity v = 40 km/h', type: 'known' }
      ],

      unknowns: [
        { id: 'u1', textVi: 'Thời gian t = ? giờ', textEn: 'Time t = ? hours', type: 'unknown' }
      ],

      correctFormulaId: 'f_time',
      formulaOptions: [
        { id: 'f_time', formula: 't = s ÷ v', labelVi: 'Thời gian = Quãng đường ÷ Vận tốc', labelEn: 'Time = Distance ÷ Velocity' },
        { id: 'f_speed', formula: 'v = s ÷ t', labelVi: 'Vận tốc = Quãng đường ÷ Thời gian', labelEn: 'Velocity = Distance ÷ Time' },
        { id: 'f_dist', formula: 's = v × t', labelVi: 'Quãng đường = Vận tốc × Thời gian', labelEn: 'Distance = Velocity × Time' }
      ],

      expectedAnswers: {
        t: 3 // 120 / 40 = 3 hours
      },

      predictionConfig: {
        promptVi: 'Trước khi tính: Quãng đường 120 km, Robot cứu hộ chạy 40 km/h. Hãy ước lượng robot mất khoảng mấy giờ?',
        promptEn: 'Before calculating: 120 km distance, rescue robot runs 40 km/h. Estimate how many hours it takes?',
        defaultGuess: 2.5,
        unit: 'giờ / hours'
      },

      unitCheckConfig: {
        questionVi: 'Quãng đường là 120 km, vận tốc là 40 km/h. Đơn vị của kết quả thời gian t là:',
        questionEn: 'Distance is 120 km, velocity is 40 km/h. The unit of time t is:',
        options: [
          { id: 'opt1', text: 'giờ (h)', isCorrect: true },
          { id: 'opt2', text: 'giây (s)', isCorrect: false },
          { id: 'opt3', text: 'km', isCorrect: false },
          { id: 'opt4', text: 'km/h', isCorrect: false }
        ],
        explanationVi: 't = s ÷ v: km ÷ (km/h) = giờ (h).',
        explanationEn: 't = s ÷ v: km ÷ (km/h) = hours (h).'
      },

      whatIfConfig: {
        scenarioVi: 'Thử nghiệm: Nếu điều động Robot cứu hộ chạy nhanh hơn với vận tốc 60 km/h, thì thời gian đến hiện trường (120 km) là mấy giờ?',
        scenarioEn: 'What-If: If a faster robot runs at 60 km/h, how many hours to reach the 120 km site?',
        expected: 2,
        unit: 'giờ / hours',
        runSim: (sim) => {
          sim.robots[0].velocity = 60;
          sim.reset();
          sim.start();
        },
        explanationVi: 't = 120 ÷ 60 = 2 giờ! Vận tốc càng nhanh thì thời gian cứu hộ càng ngắn lại.',
        explanationEn: 't = 120 ÷ 60 = 2 hours! Faster speed reduces travel time.'
      }
    });
  }

  setupSimulation(simEngine) {
    simEngine.options.trackLengthUnits = 140;
    simEngine.options.unitLabel = 'km';
    simEngine.options.mode = 'single';
    simEngine.setRobots([
      { id: 'fire', name: 'Robot Cứu Hộ', color: '#EF4444', velocity: 40, startPosUnits: 0, targetUnits: 120, trackY: 0.78 }
    ]);
  }

  renderExecute(container, polyaEngine, simEngine) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div id="step3-pred-slot"></div>

      <div class="problem-box" style="margin-bottom: 1rem; margin-top: 0.75rem;">
        <p style="font-size: 0.95rem;">
          ${lang === 'vi' 
            ? '💡 <strong>' + I18n.t('phaseCalculationTitle') + '</strong>:<br/>Áp dụng công thức <strong>t = s ÷ v</strong> để tính thời gian cần thiết rồi nhập kết quả:' 
            : '💡 <strong>' + I18n.t('phaseCalculationTitle') + '</strong>:<br/>Apply formula <strong>t = s ÷ v</strong> to calculate required time and enter result:'}
        </p>
      </div>

      <div class="input-group">
        <label class="input-label" style="color: #EF4444;">
          🔴 ${lang === 'vi' ? 'Thời gian Robot cứu hộ di chuyển (t):' : 'Travel time for rescue robot (t):'}
        </label>
        <div class="number-input-wrapper">
          <input type="number" step="any" class="math-input" id="input-t" placeholder="?" />
          <span class="unit-label">${I18n.t('unitHours')}</span>
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
      const t = parseFloat(container.querySelector('#input-t').value);
      const isCorrect = Math.abs(t - this.expectedAnswers.t) < 0.01;

      Telemetry.logEvent(3, Telemetry.EVENT_TYPES.TRIAL_ATTEMPT, {
        inputT: t,
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

        // Run simulation
        simEngine.reset();
        simEngine.start();

        fb.innerHTML = `
          <div class="feedback-box feedback-success">
            <span>🎉</span>
            <div>
              <strong>${I18n.t('correctMessage')} (+20 ⭐)</strong><br/>
              <small>
                t = 120 ÷ 40 = 3 ${lang === 'vi' ? 'giờ' : 'hours'}.<br/>
                ${lang === 'vi' ? 'Robot cứu hộ đã tiếp cận hiện trường đúng 3 giờ!' : 'The rescue robot reached the scene in exactly 3 hours!'}
              </small>
            </div>
          </div>
          <div id="step3-comparison-slot"></div>
        `;

        // Render Phase 3: Prediction vs Actual Comparison
        this.renderComparisonTable(fb, 3, 3, lang === 'vi' ? 'giờ' : 'hours', lang === 'vi' ? 'Robot cứu hộ di chuyển 120 km với tốc độ 40 km/h mất đúng 3 giờ!' : 'Rescue robot traveled 120 km at 40 km/h in exactly 3 hours!');
      } else {
        SoundFX.playOops();
        Telemetry.logEvent(3, 'ERROR_RECORDED', {
          errorType: Telemetry.ERROR_TYPES.COMPUTATIONAL,
          inputT: t
        });

        fb.innerHTML = `
          <div class="feedback-box feedback-error">
            <span>❌</span>
            <div>
              <strong>${I18n.t('incorrectMessage')}</strong><br/>
              <small>
                ${lang === 'vi' 
                  ? 'Gợi ý: Thời gian = Quãng đường chia cho Vận tốc (120 chia cho 40).' 
                  : 'Hint: Time = Distance divided by Velocity (120 divided by 40).'}
              </small>
            </div>
          </div>
        `;
      }
    });
  }
}

window.Lesson3 = Lesson3;
