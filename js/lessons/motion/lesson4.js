/**
 * LESSON 4: Hai Robot Chạy Ngược Chiều Gặp Nhau (t = s ÷ (v₁ + v₂))
 * Grade 5 Uniform Motion
 */

class Lesson4 extends LessonBase {
  constructor() {
    super({
      id: 'motion-4',
      titleKey: 'lesson4Title',
      descKey: 'lesson4Desc',
      grade: 5,
      trackLength: 200,
      unitLabel: 'km',
      timeScale: 0.6,
      simMode: 'opposite',

      problemText: {
        vi: 'Hai trạm nghiên cứu A và B cách nhau 200 km. Cùng một lúc, Robot Thám Hiểm xuất phát từ A với vận tốc 30 km/h hướng về B, và Robot Vận Chuyển xuất phát từ B với vận tốc 50 km/h hướng về A. Hỏi sau bao lâu kể từ lúc xuất phát thì hai Robot gặp nhau?',
        en: 'Two research stations A and B are 200 km apart. Simultaneously, Explorer Robot starts from A at 30 km/h towards B, and Transport Robot starts from B at 50 km/h towards A. How long after departure do the two robots meet?'
      },

      knowns: [
        { id: 'k1', textVi: 'Khoảng cách A-B s = 200 km', textEn: 'Distance A-B s = 200 km', type: 'known' },
        { id: 'k2', textVi: 'Vận tốc Robot A v₁ = 30 km/h', textEn: 'Robot A velocity v₁ = 30 km/h', type: 'known' },
        { id: 'k3', textVi: 'Vận tốc Robot B v₂ = 50 km/h', textEn: 'Robot B velocity v₂ = 50 km/h', type: 'known' }
      ],

      unknowns: [
        { id: 'u1', textVi: 'Thời gian để 2 Robot gặp nhau t = ? giờ', textEn: 'Meeting time t = ? hours', type: 'unknown' }
      ],

      correctFormulaId: 'f_opposite',
      formulaOptions: [
        { id: 'f_opposite', formula: 't = s ÷ (v₁ + v₂)', labelVi: 'Thời gian gặp nhau = Quãng đường ÷ Tổng 2 vận tốc', labelEn: 'Meeting Time = Distance ÷ Sum of Velocities' },
        { id: 'f_same', formula: 't = s ÷ (v₂ - v₁)', labelVi: 'Chuyển động cùng chiều đuổi nhau', labelEn: 'Same direction chase motion' },
        { id: 'f_single', formula: 't = s ÷ v₁', labelVi: 'Chỉ tính theo vận tốc 1 robot', labelEn: 'Calculated using only 1 robot speed' }
      ],

      expectedAnswers: {
        t: 2.5 // 200 / (30 + 50) = 2.5 hours
      }
    });
  }

  setupSimulation(simEngine) {
    simEngine.options.trackLengthUnits = 200;
    simEngine.options.unitLabel = 'km';
    simEngine.options.mode = 'opposite';
    simEngine.setRobots([
      { id: 'rA', name: 'Robot A (30 km/h)', color: '#3B82F6', velocity: 30, startPosUnits: 0, targetUnits: 200, direction: 1, trackY: 0.75 },
      { id: 'rB', name: 'Robot B (50 km/h)', color: '#EC4899', velocity: 50, startPosUnits: 200, targetUnits: 0, direction: -1, trackY: 0.85 }
    ]);
  }

  renderExecute(container, polyaEngine, simEngine) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div class="problem-box" style="margin-bottom: 1rem;">
        <p style="font-size: 0.95rem;">
          ${lang === 'vi' 
            ? '💡 Trong 1 giờ, cả hai Robot đi được: <strong>30 + 50 = 80 km</strong> (Tổng vận tốc). Áp dụng <strong>t = s ÷ (v₁ + v₂)</strong> để tìm thời gian gặp nhau:' 
            : '💡 In 1 hour, both robots cover: <strong>30 + 50 = 80 km</strong> (Combined speed). Apply <strong>t = s ÷ (v₁ + v₂)</strong> to find meeting time:'}
        </p>
      </div>

      <div class="input-group">
        <label class="input-label" style="color: #4F46E5;">
          ⏱️ ${lang === 'vi' ? 'Thời gian hai Robot gặp nhau (t):' : 'Time until robots meet (t):'}
        </label>
        <div class="number-input-wrapper">
          <input type="number" step="any" class="math-input" id="input-t-meet" placeholder="?" />
          <span class="unit-label">${I18n.t('unitHours')}</span>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-check-execute" style="width: 100%; margin-top: 0.5rem;">
        🚀 ${I18n.t('btnCheck')}
      </button>

      <div id="step3-feedback"></div>
    `;

    const btnCheck = container.querySelector('#btn-check-execute');
    btnCheck.addEventListener('click', () => {
      const t = parseFloat(container.querySelector('#input-t-meet').value);
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
                t = 200 ÷ (30 + 50) = 200 ÷ 80 = 2.5 ${lang === 'vi' ? 'giờ (tức 2 giờ 30 phút)' : 'hours (2 hours 30 mins)'}.<br/>
                ${lang === 'vi' ? 'Hai Robot đã gặp nhau tại mốc 75 km tính từ trạm A!' : 'The two robots met at the 75 km marker from station A!'}
              </small>
            </div>
          </div>
        `;
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
                  ? 'Gợi ý: Lấy quãng đường 200 km chia cho tổng hai vận tốc (30 + 50 = 80).' 
                  : 'Hint: Divide distance 200 km by the sum of velocities (30 + 50 = 80).'}
              </small>
            </div>
          </div>
        `;
      }
    });
  }
}

window.Lesson4 = Lesson4;
