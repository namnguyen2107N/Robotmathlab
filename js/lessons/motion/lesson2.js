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
      <div class="problem-box" style="margin-bottom: 1rem;">
        <p style="font-size: 0.95rem;">
          ${lang === 'vi' 
            ? '💡 Áp dụng công thức <strong>s = v × t</strong> để tính quãng đường rồi nhập kết quả:' 
            : '💡 Apply formula <strong>s = v × t</strong> to calculate distance and enter result:'}
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
        `;
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
