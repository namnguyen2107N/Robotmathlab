/**
 * LESSON 1: Robot Chạy Đua – Khái Niệm Vận Tốc (v = s ÷ t)
 * Grade 5 Uniform Motion
 */

class Lesson1 extends LessonBase {
  constructor() {
    super({
      id: 'motion-1',
      titleKey: 'lesson1Title',
      descKey: 'lesson1Desc',
      grade: 5,
      trackLength: 100,
      unitLabel: 'm',
      timeScale: 1.0,
      simMode: 'race',

      problemText: {
        vi: 'Hai Robot Alpha và Beta cùng tham gia cuộc đua trên đường chạy thẳng dài 100m. Robot Alpha về đích trong 10 giây. Robot Beta về đích trong 20 giây. Hỏi mỗi giây mỗi Robot đi được bao nhiêu mét (tính vận tốc của từng Robot) và Robot nào chạy nhanh hơn?',
        en: 'Robot Alpha and Robot Beta race on a straight 100m track. Robot Alpha finishes in 10 seconds. Robot Beta finishes in 20 seconds. How many meters does each robot travel per second (calculate velocity for each) and which robot is faster?'
      },

      knowns: [
        { id: 'k1', textVi: 'Quãng đường s = 100 m', textEn: 'Distance s = 100 m', type: 'known' },
        { id: 'k2', textVi: 'Thời gian Alpha t₁ = 10 giây', textEn: 'Alpha time t₁ = 10 s', type: 'known' },
        { id: 'k3', textVi: 'Thời gian Beta t₂ = 20 giây', textEn: 'Beta time t₂ = 20 s', type: 'known' }
      ],

      unknowns: [
        { id: 'u1', textVi: 'Vận tốc Alpha v₁ = ? m/s', textEn: 'Alpha velocity v₁ = ? m/s', type: 'unknown' },
        { id: 'u2', textVi: 'Vận tốc Beta v₂ = ? m/s', textEn: 'Beta velocity v₂ = ? m/s', type: 'unknown' }
      ],

      correctFormulaId: 'f_speed',
      formulaOptions: [
        { id: 'f_speed', formula: 'v = s ÷ t', labelVi: 'Vận tốc = Quãng đường ÷ Thời gian', labelEn: 'Velocity = Distance ÷ Time' },
        { id: 'f_dist', formula: 's = v × t', labelVi: 'Quãng đường = Vận tốc × Thời gian', labelEn: 'Distance = Velocity × Time' },
        { id: 'f_time', formula: 't = s ÷ v', labelVi: 'Thời gian = Quãng đường ÷ Vận tốc', labelEn: 'Time = Distance ÷ Velocity' }
      ],

      expectedAnswers: {
        v1: 10, // 100 / 10 = 10 m/s
        v2: 5   // 100 / 20 = 5 m/s
      }
    });
  }

  setupSimulation(simEngine) {
    simEngine.options.trackLengthUnits = 100;
    simEngine.options.unitLabel = 'm';
    simEngine.options.mode = 'race';
    simEngine.setRobots([
      { id: 'alpha', name: 'Robot Alpha', color: '#4F46E5', velocity: 10, startPosUnits: 0, targetUnits: 100, trackY: 0.72 },
      { id: 'beta', name: 'Robot Beta', color: '#F59E0B', velocity: 5, startPosUnits: 0, targetUnits: 100, trackY: 0.88 }
    ]);
  }

  renderExecute(container, polyaEngine, simEngine) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div class="problem-box" style="margin-bottom: 1rem;">
        <p style="font-size: 0.95rem;">
          ${lang === 'vi' 
            ? '💡 Áp dụng công thức <strong>v = s ÷ t</strong> để tính vận tốc từng Robot rồi nhập kết quả:' 
            : '💡 Apply formula <strong>v = s ÷ t</strong> to calculate velocities and enter results:'}
        </p>
      </div>

      <div class="input-group">
        <label class="input-label" style="color: #4F46E5;">
          🔵 ${lang === 'vi' ? 'Vận tốc Robot Alpha (v₁):' : 'Robot Alpha velocity (v₁):'}
        </label>
        <div class="number-input-wrapper">
          <input type="number" step="any" class="math-input" id="input-v1" placeholder="?" />
          <span class="unit-label">m/s</span>
        </div>
      </div>

      <div class="input-group">
        <label class="input-label" style="color: #D97706;">
          🟡 ${lang === 'vi' ? 'Vận tốc Robot Beta (v₂):' : 'Robot Beta velocity (v₂):'}
        </label>
        <div class="number-input-wrapper">
          <input type="number" step="any" class="math-input" id="input-v2" placeholder="?" />
          <span class="unit-label">m/s</span>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-check-execute" style="width: 100%; margin-top: 0.5rem;">
        🚀 ${I18n.t('btnCheck')}
      </button>

      <div id="step3-feedback"></div>
    `;

    const btnCheck = container.querySelector('#btn-check-execute');
    btnCheck.addEventListener('click', () => {
      const v1 = parseFloat(container.querySelector('#input-v1').value);
      const v2 = parseFloat(container.querySelector('#input-v2').value);

      const isV1Correct = Math.abs(v1 - this.expectedAnswers.v1) < 0.01;
      const isV2Correct = Math.abs(v2 - this.expectedAnswers.v2) < 0.01;
      const isAllCorrect = isV1Correct && isV2Correct;

      // Log attempt
      Telemetry.logEvent(3, Telemetry.EVENT_TYPES.TRIAL_ATTEMPT, {
        v1Input: v1,
        v2Input: v2,
        isCorrect: isAllCorrect,
        expected: this.expectedAnswers
      });

      const fb = container.querySelector('#step3-feedback');

      if (isAllCorrect) {
        polyaEngine.markStepComplete(3);
        SoundFX.playVictory();
        Confetti.burst(80);
        DB.addReward(20, 50);
        if (window.App) App.updateHeaderUserProfile();

        // Update simulation robots with calculated values and run
        simEngine.robots[0].velocity = v1;
        simEngine.robots[1].velocity = v2;
        simEngine.reset();
        simEngine.start();

        fb.innerHTML = `
          <div class="feedback-box feedback-success">
            <span>🎉</span>
            <div>
              <strong>${I18n.t('correctMessage')} (+20 ⭐)</strong><br/>
              <small>
                v₁ = 100 ÷ 10 = 10 m/s<br/>
                v₂ = 100 ÷ 20 = 5 m/s<br/>
                ${lang === 'vi' ? 'Robot Alpha nhanh hơn Robot Beta!' : 'Robot Alpha is faster than Robot Beta!'}
              </small>
            </div>
          </div>
        `;
      } else {
        SoundFX.playOops();
        Telemetry.logEvent(3, 'ERROR_RECORDED', {
          errorType: Telemetry.ERROR_TYPES.COMPUTATIONAL,
          v1, v2
        });

        fb.innerHTML = `
          <div class="feedback-box feedback-error">
            <span>❌</span>
            <div>
              <strong>${I18n.t('incorrectMessage')}</strong><br/>
              <small>
                ${lang === 'vi' 
                  ? 'Gợi ý: Lấy quãng đường 100m chia cho thời gian chạy của mỗi robot nhé!' 
                  : 'Hint: Divide distance 100m by the time of each robot!'}
              </small>
            </div>
          </div>
        `;
      }
    });
  }
}

window.Lesson1 = Lesson1;
