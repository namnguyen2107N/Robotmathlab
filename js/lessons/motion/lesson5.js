/**
 * LESSON 5: Thử Thách Lộ Trình Đa Chặng (Tổng hợp & Phân tích Đồ thị Chuyển động)
 * Grade 5 Uniform Motion Capstone
 */

class Lesson5 extends LessonBase {
  constructor() {
    super({
      id: 'motion-5',
      titleKey: 'lesson5Title',
      descKey: 'lesson5Desc',
      grade: 5,
      trackLength: 120,
      unitLabel: 'm',
      timeScale: 1.2,
      simMode: 'multistage',

      problemText: {
        vi: 'Robot thám hiểm Mặt Trăng di chuyển qua 3 chặng địa hình đặc biệt: Chặng 1 dài 30m với vận tốc 5 m/s; Chặng 2 trên đường bằng phẳng dài 40m với vận tốc 10 m/s; Chặng 3 leo dốc dài 50m với vận tốc 5 m/s. Hãy tính: (1) Tổng thời gian Robot hoàn thành cả 3 chặng; (2) Vận tốc trung bình của Robot trên toàn bộ quãng đường.',
        en: 'A lunar exploration robot traverses 3 distinct terrain stages: Stage 1 is 30m at 5 m/s; Stage 2 is 40m on flat ground at 10 m/s; Stage 3 is 50m uphill at 5 m/s. Calculate: (1) Total time to complete all 3 stages; (2) Average speed of the robot across the entire journey.'
      },

      knowns: [
        { id: 'k1', textVi: 'Chặng 1: s₁ = 30m, v₁ = 5 m/s', textEn: 'Stage 1: s₁ = 30m, v₁ = 5 m/s', type: 'known' },
        { id: 'k2', textVi: 'Chặng 2: s₂ = 40m, v₂ = 10 m/s', textEn: 'Stage 2: s₂ = 40m, v₂ = 10 m/s', type: 'known' },
        { id: 'k3', textVi: 'Chặng 3: s₃ = 50m, v₃ = 5 m/s', textEn: 'Stage 3: s₃ = 50m, v₃ = 5 m/s', type: 'known' }
      ],

      unknowns: [
        { id: 'u1', textVi: 'Tổng thời gian t_tổng = ? giây', textEn: 'Total time t_total = ? s', type: 'unknown' },
        { id: 'u2', textVi: 'Vận tốc trung bình v_tb = ? m/s', textEn: 'Average speed v_avg = ? m/s', type: 'unknown' }
      ],

      correctFormulaId: 'f_composite',
      formulaOptions: [
        { id: 'f_composite', formula: 't_tổng = t₁ + t₂ + t₃ ; v_tb = s_tổng ÷ t_tổng', labelVi: 'Tính từng chặng rồi cộng thời gian và tính v trung bình', labelEn: 'Calculate stage times, sum them, then v_avg = total_s / total_t' },
        { id: 'f_wrong_avg', formula: 'v_tb = (v₁ + v₂ + v₃) ÷ 3', labelVi: 'Trung bình cộng các vận tốc (SAI)', labelEn: 'Simple arithmetic average of speeds (INCORRECT)' },
        { id: 'f_single', formula: 'v = s ÷ t', labelVi: 'Chỉ tính 1 công thức đơn', labelEn: 'Single stage uniform formula' }
      ],

      expectedAnswers: {
        totalTime: 20,  // t1 = 30/5 = 6s; t2 = 40/10 = 4s; t3 = 50/5 = 10s -> sum = 20s
        avgSpeed: 6     // 120 / 20 = 6 m/s
      }
    });
  }

  setupSimulation(simEngine) {
    simEngine.options.trackLengthUnits = 120;
    simEngine.options.unitLabel = 'm';
    simEngine.options.mode = 'multistage';
    simEngine.setRobots([
      {
        id: 'lunar',
        name: 'Robot Lunar Rover',
        color: '#8B5CF6',
        startPosUnits: 0,
        targetUnits: 120,
        trackY: 0.8,
        stages: [
          { s: 30, v: 5 },
          { s: 40, v: 10 },
          { s: 50, v: 5 }
        ]
      }
    ]);
  }

  renderExecute(container, polyaEngine, simEngine) {
    const lang = I18n.currentLang;
    container.innerHTML = `
      <div class="problem-box" style="margin-bottom: 1rem;">
        <p style="font-size: 0.95rem;">
          ${lang === 'vi' 
            ? '💡 <strong>Bước giải chi tiết:</strong><br/>' +
              '• Thời gian chặng 1: t₁ = 30 ÷ 5 = 6 giây<br/>' +
              '• Thời gian chặng 2: t₂ = 40 ÷ 10 = 4 giây<br/>' +
              '• Thời gian chặng 3: t₃ = 50 ÷ 5 = 10 giây' 
            : '💡 <strong>Step-by-step guidance:</strong><br/>' +
              '• Stage 1 time: t₁ = 30 ÷ 5 = 6 s<br/>' +
              '• Stage 2 time: t₂ = 40 ÷ 10 = 4 s<br/>' +
              '• Stage 3 time: t₃ = 50 ÷ 5 = 10 s'}
        </p>
      </div>

      <div class="input-group">
        <label class="input-label" style="color: #8B5CF6;">
          ⏱️ ${lang === 'vi' ? '(1) Tổng thời gian đi 3 chặng (t):' : '(1) Total time for all 3 stages (t):'}
        </label>
        <div class="number-input-wrapper">
          <input type="number" step="any" class="math-input" id="input-total-time" placeholder="?" />
          <span class="unit-label">${I18n.t('unitSeconds')}</span>
        </div>
      </div>

      <div class="input-group">
        <label class="input-label" style="color: #06B6D4;">
          🚀 ${lang === 'vi' ? '(2) Vận tốc trung bình (v_tb = s_tổng ÷ t_tổng):' : '(2) Average speed (v_avg = total_s ÷ total_t):'}
        </label>
        <div class="number-input-wrapper">
          <input type="number" step="any" class="math-input" id="input-avg-speed" placeholder="?" />
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
      const tTotal = parseFloat(container.querySelector('#input-total-time').value);
      const vAvg = parseFloat(container.querySelector('#input-avg-speed').value);

      const isTimeCorrect = Math.abs(tTotal - this.expectedAnswers.totalTime) < 0.01;
      const isSpeedCorrect = Math.abs(vAvg - this.expectedAnswers.avgSpeed) < 0.01;
      const isAllCorrect = isTimeCorrect && isSpeedCorrect;

      Telemetry.logEvent(3, Telemetry.EVENT_TYPES.TRIAL_ATTEMPT, {
        tTotal,
        vAvg,
        isCorrect: isAllCorrect,
        expected: this.expectedAnswers
      });

      const fb = container.querySelector('#step3-feedback');

      if (isAllCorrect) {
        polyaEngine.markStepComplete(3);
        SoundFX.playVictory();
        Confetti.burst(80);
        DB.addReward(25, 60);
        if (window.App) App.updateHeaderUserProfile();

        // Run multi-stage simulation
        simEngine.reset();
        simEngine.start();

        fb.innerHTML = `
          <div class="feedback-box feedback-success">
            <span>🎉</span>
            <div>
              <strong>${I18n.t('correctMessage')} (+25 ⭐)</strong><br/>
              <small>
                • Tổng thời gian: t = 6 + 4 + 10 = 20 giây.<br/>
                • Tổng quãng đường: s = 30 + 40 + 50 = 120 mét.<br/>
                • Vận tốc trung bình: v_tb = 120 ÷ 20 = 6 m/s.<br/>
                <em>${lang === 'vi' ? 'Lưu ý: Không được tính v_tb bằng trung bình cộng (5+10+5)/3 ≈ 6.67 m/s!' : 'Note: Do not calculate v_avg as arithmetic mean (5+10+5)/3!'}</em>
              </small>
            </div>
          </div>
        `;
      } else {
        SoundFX.playOops();
        Telemetry.logEvent(3, 'ERROR_RECORDED', {
          errorType: Telemetry.ERROR_TYPES.COMPUTATIONAL,
          tTotal, vAvg
        });

        fb.innerHTML = `
          <div class="feedback-box feedback-error">
            <span>❌</span>
            <div>
              <strong>${I18n.t('incorrectMessage')}</strong><br/>
              <small>
                ${lang === 'vi' 
                  ? 'Gợi ý: Tính thời gian từng chặng (30÷5=6s, 40÷10=4s, 50÷5=10s) rồi cộng lại. Sau đó lấy tổng quãng đường 120m chia cho tổng thời gian.' 
                  : 'Hint: Calculate time for each segment (30÷5=6s, 40÷10=4s, 50÷5=10s) and sum them up. Then divide total distance 120m by total time.'}
              </small>
            </div>
          </div>
        `;
      }
    });
  }
}

window.Lesson5 = Lesson5;
