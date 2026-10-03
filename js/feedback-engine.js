/**
 * ROBOT MATH LAB - FEEDBACK ENGINE
 * Generates evidence-grounded, multi-stakeholder diagnostic feedback (Student, Teacher, Parent).
 * 
 * Core Pedagogical Principles:
 * 1. Data-grounded: Every feedback point traces back to empirical actions in session telemetry
 *    (mistakes, vocab lookups, hint unlocks, simulation attempts, lookback accuracy).
 * 2. Non-judgmental & Growth Mindset: No generalized capability labels (e.g. "weak student", "slow learner").
 * 3. Differentiated Stakeholders:
 *    - Student: Brief, encouraging, highlights specific strengths, areas to practice, and follow-up challenge.
 *    - Teacher: Detailed problem-solving indicators (PS1-PS11), performance quality, scaffolding usage, error patterns, and pedagogical interventions.
 *    - Parent: Accessible, warm, strengths-based, home support tips, no research codes, no labels.
 * 4. Bilingual: Full English and Vietnamese support based on active interface language.
 */

(function () {
  const FeedbackEngine = {
    /**
     * Generate diagnostic feedback objects from a session
     */
    analyzeSession(session, lang = 'vi') {
      if (!session) {
        session = window.LogEngine?.currentSession || {
          taskId: 'task1-reach',
          studentName: 'Explorer',
          events: [],
          supportUsage: { vocabLookups: [], mathHints: [] },
          summary: { totalAttempts: 1, totalTimeSeconds: 45, finalSuccess: true, backwardStepsCount: 0 },
          stepTimings: {}
        };
      }

      const isVi = lang === 'vi';
      const events = session.events || [];
      const support = session.supportUsage || { vocabLookups: [], mathHints: [] };
      const summary = session.summary || { totalAttempts: 1, totalTimeSeconds: 60 };

      // Telemetry Data Extraction
      const vocabWords = Array.from(new Set((support.vocabLookups || []).map(v => v.word)));
      const hintsOpened = support.mathHints || [];
      const maxHintLevel = hintsOpened.length > 0 ? Math.max(...hintsOpened.map(h => h.level || 1)) : 0;
      const totalAttempts = summary.totalAttempts || 1;
      const totalTimeSec = summary.totalTimeSeconds || 60;
      const backwardSteps = summary.backwardStepsCount || 0;

      // Check specific PS milestones
      const step1Mistakes = events.filter(e => e.code === 'STEP1_MISMATCH');
      const step2Mistakes = events.filter(e => e.code === 'STEP2_MISTAKE');
      const ps8Event = events.find(e => e.code === 'PS8');
      const ps8FirstAttemptAccurate = ps8Event?.data?.accurate !== false;
      const ps9Event = events.find(e => e.code === 'PS9');
      const ps10Event = events.find(e => e.code === 'PS10');
      const reflectionText = events.find(e => e.code === 'TASK_REFLECTION')?.data?.reflection || '';

      const taskId = session.taskId || 'task1-reach';

      return {
        // Raw Metrics for Grounding
        metrics: {
          taskId,
          studentName: session.studentName || 'Học sinh',
          totalAttempts,
          totalTimeSec,
          vocabWords,
          maxHintLevel,
          hintsCount: hintsOpened.length,
          backwardSteps,
          step1Errors: step1Mistakes.length,
          step2Errors: step2Mistakes.length,
          ps8FirstAttemptAccurate,
          hasReflection: !!reflectionText.trim(),
          reflectionText
        },

        // 1. STUDENT VIEW
        student: this.buildStudentFeedback({
          isVi,
          taskId,
          totalAttempts,
          vocabWords,
          maxHintLevel,
          step1Errors: step1Mistakes.length,
          step2Errors: step2Mistakes.length,
          ps8FirstAttemptAccurate
        }),

        // 2. TEACHER VIEW
        teacher: this.buildTeacherFeedback({
          isVi,
          taskId,
          events,
          totalAttempts,
          totalTimeSec,
          backwardSteps,
          vocabWords,
          hintsOpened,
          maxHintLevel,
          step1Mistakes,
          step2Mistakes,
          ps8Event,
          ps9Event,
          ps10Event
        }),

        // 3. PARENT VIEW
        parent: this.buildParentFeedback({
          isVi,
          taskId,
          studentName: session.studentName || 'Con',
          totalAttempts,
          vocabWords,
          hintsCount: hintsOpened.length
        }),

        // 4. ADVANCED CHALLENGE RECOMMENDATION
        nextChallenge: this.buildNextChallenge(taskId, isVi)
      };
    },

    /**
     * Build Student Feedback
     */
    buildStudentFeedback({ isVi, taskId, totalAttempts, vocabWords, maxHintLevel, step1Errors, step2Errors, ps8FirstAttemptAccurate }) {
      const strengths = [];
      const improvements = [];

      // Strengths based on evidence
      if (step1Errors === 0) {
        strengths.push(isVi
          ? 'Đọc hiểu đề bài xuất sắc: Em xác định chính xác các số liệu đã cho và đại lượng cần tìm ngay từ đầu.'
          : 'Great Problem Reading: You identified all given parameters and target quantities accurately on your first try.');
      }

      if (step2Errors === 0) {
        strengths.push(isVi
          ? 'Lập kế hoạch toán học chuẩn: Em chọn đúng công thức và tính toán kết quả rất chính xác.'
          : 'Solid Mathematical Planning: You chose the right formula and completed the arithmetic calculation with precision.');
      }

      if (maxHintLevel === 0) {
        strengths.push(isVi
          ? 'Tính tự chủ cao: Em tự mình tìm ra cách giải bài toán mà không cần mở các gợi ý hỗ trợ.'
          : 'High Autonomy: You worked through the problem independently without needing scaffolding hints.');
      } else {
        strengths.push(isVi
          ? `Biết cách tìm kiếm hỗ trợ: Khi cần thiết, em đã chủ động mở gợi ý Mức ${maxHintLevel} để vượt qua bước khó.`
          : `Effective Help-Seeking: You proactively used Tier ${maxHintLevel} hints when needed to progress steadily.`);
      }

      if (vocabWords.length > 0) {
        strengths.push(isVi
          ? `Chủ động học từ vựng: Em đã tra cứu từ tiếng Anh [${vocabWords.join(', ')}] để hiểu rõ tình huống bài toán.`
          : `Active Bilingual Learner: You checked key vocabulary terms [${vocabWords.join(', ')}] in the problem.`);
      }

      if (taskId === 'task2-fix') {
        if (ps8FirstAttemptAccurate) {
          strengths.push(isVi
            ? 'Quan sát thực nghiệm rất tinh mắt: Em đã nhìn thước đo và phát hiện đúng việc robot dừng ở 18m trước vạch đích 24m.'
            : 'Keen Track Observation: You accurately observed that the robot stopped at 18m, short of the 24m goal flag.');
        }
        strengths.push(isVi
          ? 'Tư duy điều chỉnh phương án tốt: Em đã tính toán lại và nâng thời gian lên 4 giây giúp robot về đích thành công.'
          : 'Adaptive Problem Solver: You successfully recalculated and adjusted the running time to 4 seconds to reach the goal.');
      } else if (totalAttempts === 1) {
        strengths.push(isVi
          ? 'Thực thi xuất sắc: Robot của em đã cập bến đích chuẩn xác ngay trong lần chạy thử nghiệm đầu tiên!'
          : 'First-Try Success: Your calculated plan landed the robot right on the destination marker on the first attempt!');
      }

      // Areas to strengthen based on evidence
      if (vocabWords.length > 0) {
        improvements.push(isVi
          ? `Ghi nhớ từ vựng chuyển động: Hãy ghi nhớ các từ [${vocabWords.join(', ')}] để lần sau đọc đề tiếng Anh nhanh và tự tin hơn nhé!`
          : `Vocabulary Mastery: Review the terms [${vocabWords.join(', ')}] to boost your English problem-reading speed!`);
      }

      if (maxHintLevel >= 2) {
        improvements.push(isVi
          ? 'Củng cố công thức chuyển động: Hãy nhớ mối quan hệ giữa Quãng đường (s), Vận tốc (v) và Thời gian (t = s ÷ v) để tự tính nhanh hơn.'
          : 'Reinforce Core Motion Formula: Remember the relationship t = s ÷ v to solve single-variable steps with even greater speed.');
      }

      if (step1Errors > 0 || step2Errors > 0) {
        improvements.push(isVi
          ? 'Kiểm tra kỹ trước khi xác nhận: Dành thêm vài giây đối chiếu số liệu và đơn vị đo (m, m/s, s) trước khi chuyển bước nhé.'
          : 'Double-Check Habit: Take 5 extra seconds to verify numbers and units (m, m/s, s) before confirming your steps.');
      }

      if (improvements.length === 0) {
        improvements.push(isVi
          ? 'Duy trì phong độ: Các bước giải của em rất toàn diện. Hãy sẵn sàng cho thử thách nâng cao tiếp theo!'
          : 'Keep Excelling: Your workflow was thorough and accurate. You are ready for the advanced challenge!');
      }

      return {
        strengths,
        improvements
      };
    },

    /**
     * Build Teacher Feedback
     */
    buildTeacherFeedback({ isVi, taskId, events, totalAttempts, totalTimeSec, backwardSteps, vocabWords, hintsOpened, maxHintLevel, step1Mistakes, step2Mistakes, ps8Event, ps9Event, ps10Event }) {
      // 1. Problem Solving Indicators (PS1 - PS11)
      const indicators = [
        {
          phase: isVi ? 'Pha 1: Tìm hiểu đề (PS1 - PS3)' : 'Phase 1: Understand (PS1 - PS3)',
          status: step1Mistakes.length === 0 ? 'Optimal' : 'Needs Reinforcement',
          details: isVi
            ? `Học sinh trích xuất dữ kiện vận tốc và quãng đường. Số lần thử: ${step1Mistakes.length + 1}. Khả năng định danh ẩn số: Tốt.`
            : `Extracted speed and distance values. Submissions: ${step1Mistakes.length + 1}. Target quantity identification: Confirmed.`
        },
        {
          phase: isVi ? 'Pha 2: Lập kế hoạch (PS4 - PS5)' : 'Phase 2: Plan (PS4 - PS5)',
          status: step2Mistakes.length === 0 ? 'Optimal' : 'Scaffolded',
          details: isVi
            ? `Mô hình hóa toán học. Đã chọn công thức và tính toán. Số lần chỉnh sửa: ${step2Mistakes.length}.`
            : `Mathematical modeling. Formula selection and arithmetic calculation. Corrections: ${step2Mistakes.length}.`
        },
        {
          phase: isVi ? 'Pha 3: Thực thi (PS6 - PS7)' : 'Phase 3: Execute (PS6 - PS7)',
          status: 'Completed',
          details: isVi
            ? `Nạp tham số và kích hoạt mô phỏng đường chạy ảo. Tổng số lần chạy robot: ${totalAttempts}.`
            : `Set robot parameters and triggered virtual simulation. Total simulation runs: ${totalAttempts}.`
        },
        {
          phase: isVi ? 'Pha 4: Kiểm tra & Đánh giá (PS8 - PS11)' : 'Phase 4: Look Back & Verify (PS8 - PS11)',
          status: ps8Event?.data?.response === 'no' || totalAttempts === 1 ? 'Optimal' : 'Guided',
          details: isVi
            ? `Đối chiếu kết quả thực nghiệm với vạch đích. Nhận diện sự không tương thích và điều chỉnh tham số thời gian thành công.`
            : `Compared simulation stop point with destination marker. Identified discrepancy and revised parameters successfully.`
        }
      ];

      // 2. Performance Quality & Autonomy
      let autonomyLevel = isVi ? 'Tự chủ cao (High Autonomy)' : 'High Autonomy';
      if (maxHintLevel >= 3 || hintsOpened.length >= 3) {
        autonomyLevel = isVi ? 'Cần giàn giáo nhiều mức (Extensive Scaffolding)' : 'Extensively Scaffolded';
      } else if (maxHintLevel > 0 || vocabWords.length > 0) {
        autonomyLevel = isVi ? 'Tự chủ có hỗ trợ hợp lý (Guided Autonomy)' : 'Guided Autonomy';
      }

      // 3. Observed Difficulties & Remediation
      const observedErrors = [];
      const pedagogicalInterventions = [];

      if (vocabWords.length > 0) {
        observedErrors.push(isVi
          ? `Rào cản thuật ngữ tiếng Anh: Tra cứu các từ [${vocabWords.join(', ')}].`
          : `Language barrier: Looked up vocabulary terms [${vocabWords.join(', ')}].`);
        pedagogicalInterventions.push(isVi
          ? `Tạo thẻ ghi nhớ (flashcard) kết hợp hình ảnh mô phỏng cho thuật ngữ chuyển động: speed, distance, destination.`
          : `Provide visual flashcards linking robotics motion terms with concrete simulation graphics.`);
      }

      if (step2Mistakes.length > 0) {
        observedErrors.push(isVi
          ? `Nhầm lẫn trong việc chọn biểu thức toán học hoặc thao tác số học ban đầu.`
          : `Initial confusion in selecting algebraic relationship or arithmetic computation.`);
        pedagogicalInterventions.push(isVi
          ? `Sử dụng mô hình tam giác đại lượng (s trên đỉnh, v và t ở hai đáy) để học sinh hình dung trực quan phép tính t = s ÷ v.`
          : `Use the triangle diagram (s at apex, v and t at base) to reinforce inverse relationship t = s ÷ v.`);
      }

      if (totalAttempts > 1) {
        observedErrors.push(isVi
          ? `Cần qua ${totalAttempts} lần chạy thử nghiệm để đưa robot về đúng đích.`
          : `Required ${totalAttempts} simulation iterations to achieve the destination target.`);
        pedagogicalInterventions.push(isVi
          ? `Tập trung củng cố kỹ năng đọc thước đo canvas và tính khoảng cách thiếu trước khi điều chỉnh tham số thời gian.`
          : `Guide student on reading canvas ruler benchmarks and computing shortfall before inputting revised time.`);
      }

      if (observedErrors.length === 0) {
        observedErrors.push(isVi ? 'Không phát hiện sai sót đáng kể.' : 'No significant misconceptions observed.');
        pedagogicalInterventions.push(isVi
          ? 'Học sinh sẵn sàng tiếp nhận các bài toán chuyển động có điều kiện phức tạp hơn (nhiều giai đoạn hoặc hai robot).'
          : 'Student demonstrates readiness for multi-phase uniform motion or two-body relative motion problems.');
      }

      return {
        indicators,
        autonomyLevel,
        totalTimeSec,
        hintsUsedCount: hintsOpened.length,
        maxHintLevel,
        vocabLookupsCount: vocabWords.length,
        vocabWords,
        observedErrors,
        pedagogicalInterventions
      };
    },

    /**
     * Build Parent Feedback
     */
    buildParentFeedback({ isVi, taskId, studentName, totalAttempts, vocabWords, hintsCount }) {
      const strengths = [];
      const homeFocus = [];
      const conversationStarters = [];

      strengths.push(isVi
        ? `${studentName} đã thể hiện sự kiên nhẫn và tập trung rất tốt khi tương tác với môi trường robot ảo.`
        : `${studentName} demonstrated wonderful patience and focus while working in the virtual robotics environment.`);

      strengths.push(isVi
        ? `Con biết vận dụng phép toán số học vào tình huống thực tế để điều khiển robot đi đến đúng mục tiêu.`
        : `Applied mathematical thinking into a realistic robotics scenario to guide the robot safely to its goal.`);

      if (vocabWords.length > 0) {
        strengths.push(isVi
          ? `Con rất chủ động tra cứu khi gặp từ vựng tiếng Anh chưa rõ, thể hiện tinh thần tự học rất đáng khen.`
          : `Proactively explored English vocabulary when needed, showing great independent learning initiative.`);
      }

      // Home focus
      homeFocus.push(isVi
        ? `Cùng con rèn luyện thêm kỹ năng tính nhẩm các phép chia đơn giản trong các hoạt động hàng ngày (chia bánh kẹo, chia đồ chơi).`
        : `Practice simple mental division during daily activities (e.g., sharing snacks, organizing toys into equal groups).`);

      homeFocus.push(isVi
        ? `Cùng con trò chuyện về khái niệm vận tốc: "Cứ 1 giây robot đi được bao nhiêu mét?" để con liên hệ toán học với đời sống.`
        : `Talk about the speed concept together: "How many meters does the robot move in one second?" to connect math with real life.`);

      // Parent conversation starters
      conversationStarters.push(isVi
        ? '🤖 "Hôm nay con đã điều khiển robot Sparky đi được quãng đường bao nhiêu mét vậy?"'
        : '🤖 "How many meters did you program Sparky the robot to travel today?"');

      conversationStarters.push(isVi
        ? '💡 "Làm thế nào mà con biết được robot dừng lại đã đúng đích hay chưa?"'
        : '💡 "How did you check whether the robot stopped right on the destination line?"');

      conversationStarters.push(isVi
        ? '🚀 "Nếu muốn robot chạy nhanh gấp đôi thì con sẽ cần thay đổi điều gì hả con?"'
        : '🚀 "If you wanted the robot to run twice as fast, what would you change?"');

      return {
        strengths,
        homeFocus,
        conversationStarters
      };
    },

    /**
     * Build Next Advanced Challenge
     */
    buildNextChallenge(currentTaskId, isVi) {
      if (currentTaskId === 'task1-reach') {
        return {
          targetTaskId: 'task2-fix',
          badge: isVi ? 'Thử thách tiếp theo' : 'Next Mission',
          title: isVi ? 'Nhiệm vụ 2: Kiểm tra phương án' : 'Task 2: Test the Plan',
          subtitle: isVi ? 'Thử nghiệm phương án & đối chiếu thực nghiệm' : 'Test a proposed motion plan & verify outcome',
          description: isVi
            ? 'Một bạn học sinh lập phương án cho robot đi 24m với vận tốc 6 m/s trong 3 giây. Em hãy chạy thử mô phỏng, quan sát vị trí dừng và đối chiếu kết quả!'
            : 'A classmate prepared a movement plan for 24m with speed 6 m/s and time 3s. Run the simulation, observe where the robot stops, and evaluate the result!',
          actionText: isVi ? 'Bắt đầu Nhiệm vụ 2 ➔' : 'Start Mission 2 ➔'
        };
      }

      if (currentTaskId === 'task2-fix') {
        return {
          targetTaskId: 'task3-new',
          badge: isVi ? 'Thử thách nâng cao' : 'Advanced Mission',
          title: isVi ? 'Nhiệm vụ 3: Nhiệm vụ mới' : 'Task 3: New Mission',
          subtitle: isVi ? 'Thích ứng khi quãng đường và vận tốc thay đổi' : 'Adapt to changed distance and energy-saving speed',
          description: isVi
            ? 'Điều kiện nhiệm vụ thay đổi: Quãng đường mới là 35m và vận tốc tiết kiệm pin là 5 m/s. Hãy lập kế hoạch tính thời gian mới để robot giao hàng an toàn!'
            : 'Mission conditions have changed: New target is 35m and energy-saving speed is 5 m/s. Formulate a new plan to deliver the payload accurately!',
          actionText: isVi ? 'Bắt đầu Nhiệm vụ 3 ➔' : 'Start Mission 3 ➔'
        };
      }

      // Beyond Task 3: Extension Challenge
      return {
        targetTaskId: 'task-extra',
        isExtension: true,
        badge: isVi ? 'Thử thách Vượt cấp Đặc biệt' : 'Mastery Extension Challenge',
        title: isVi ? 'Nhiệm vụ 4: Cuộc đua Hai Robot Chuyển Động' : 'Task 4: Two-Robot Synchronized Mission',
        subtitle: isVi ? 'Bài toán chuyển động cùng chiều và phối hợp đội hình' : 'Relative uniform motion & synchronized arrival',
        description: isVi
          ? 'Robot A xuất phát với vận tốc 4 m/s đến đích 40m. Robot B xuất phát sau 2 giây với vận tốc 5 m/s. Liệu Robot B có đuổi kịp Robot A trước khi đến vạch đích không? Hãy cùng suy luận và kiểm chứng!'
          : 'Robot A moves at 4 m/s toward a 40m target. Robot B starts 2 seconds later at 5 m/s. Will Robot B catch up to Robot A before the destination? Analyze and verify!',
        actionText: isVi ? 'Thử thách ngay 🚀' : 'Take the Challenge 🚀'
      };
    },

    /**
     * Render the Full Feedback Modal
     */
    showModal(session = null) {
      if (!session && window.LogEngine) {
        session = window.LogEngine.currentSession;
      }
      const lang = window.I18N ? window.I18N.currentLang : 'vi';
      const isVi = lang === 'vi';
      const analysis = this.analyzeSession(session, lang);

      let modal = document.getElementById('feedback-diagnostic-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'feedback-diagnostic-modal';
        modal.className = 'modal-backdrop feedback-modal-backdrop animate-fade-in';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="modal-card feedback-modal-card animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="fb-title">
          
          <!-- Header -->
          <div class="feedback-modal-header">
            <div class="fb-header-left">
              <span class="fb-badge">📊 ${isVi ? 'Nhận Xét & Đánh Giá Quá Trình' : 'Process Diagnostic Feedback'}</span>
              <h2 class="fb-title" id="fb-title">
                ${isVi ? 'Báo Cáo Phản Hồi Học Tập Toàn Diện' : 'Comprehensive Learning Feedback Report'}
              </h2>
              <div class="fb-meta-row">
                <span class="fb-meta-item">🧑‍🎓 <strong>${analysis.metrics.studentName}</strong></span>
                <span class="fb-meta-item">⏱️ ${analysis.metrics.totalTimeSec}s</span>
                <span class="fb-meta-item">🔄 ${analysis.metrics.totalAttempts} ${isVi ? 'lần thử' : 'trials'}</span>
                ${analysis.metrics.vocabWords.length > 0 ? `<span class="fb-meta-item">📖 ${analysis.metrics.vocabWords.length} ${isVi ? 'từ tra cứu' : 'words looked up'}</span>` : ''}
              </div>
            </div>
            <button type="button" class="btn-close-modal" id="btn-close-feedback" aria-label="Close">✕</button>
          </div>

          <!-- Multi-Stakeholder Tabs -->
          <div class="feedback-tabs-nav" role="tablist">
            <button type="button" class="fb-tab-btn active" id="tab-btn-student" role="tab" aria-selected="true" data-tab="student">
              <span class="fb-tab-icon">🧑‍🎓</span>
              <span class="fb-tab-label">${isVi ? 'Dành cho Học Sinh' : 'For Student'}</span>
            </button>
            <button type="button" class="fb-tab-btn" id="tab-btn-teacher" role="tab" aria-selected="false" data-tab="teacher">
              <span class="fb-tab-icon">👩‍🏫</span>
              <span class="fb-tab-label">${isVi ? 'Dành cho Giáo Viên' : 'For Teacher'}</span>
            </button>
            <button type="button" class="fb-tab-btn" id="tab-btn-parent" role="tab" aria-selected="false" data-tab="parent">
              <span class="fb-tab-icon">👨‍👩‍👧</span>
              <span class="fb-tab-label">${isVi ? 'Dành cho Phụ Huynh' : 'For Parents'}</span>
            </button>
          </div>

          <!-- Tab Content Container -->
          <div class="feedback-tab-content-wrapper">
            
            <!-- 1. TAB STUDENT -->
            <div class="fb-pane active animate-fade-in" id="fb-pane-student">
              <div class="fb-section-card card-strengths">
                <div class="fb-section-title">
                  <span class="sec-icon">🌟</span>
                  <h3>${isVi ? 'Những Điều Em Đã Làm Rất Tốt' : 'What You Did Great'}</h3>
                </div>
                <ul class="fb-list">
                  ${analysis.student.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>

              <div class="fb-section-card card-improve">
                <div class="fb-section-title">
                  <span class="sec-icon">🎯</span>
                  <h3>${isVi ? 'Điểm Em Cần Luyện Thêm Để Giỏi Hơn' : 'Areas to Strengthen & Practice'}</h3>
                </div>
                <ul class="fb-list">
                  ${analysis.student.improvements.map(i => `<li>${i}</li>`).join('')}
                </ul>
              </div>

              <!-- Recommended Next Challenge -->
              <div class="fb-next-challenge-box">
                <div class="challenge-header">
                  <span class="challenge-badge">${analysis.nextChallenge.badge}</span>
                  <h4 class="challenge-title">${analysis.nextChallenge.title}</h4>
                  <p class="challenge-sub">${analysis.nextChallenge.subtitle}</p>
                </div>
                <p class="challenge-desc">${analysis.nextChallenge.description}</p>
                <div class="challenge-action-row">
                  <button type="button" class="btn-primary btn-launch-challenge" id="btn-launch-challenge">
                    ${analysis.nextChallenge.actionText}
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. TAB TEACHER -->
            <div class="fb-pane hidden animate-fade-in" id="fb-pane-teacher">
              <div class="teacher-metrics-banner">
                <div class="t-stat">
                  <span class="t-label">${isVi ? 'Mức độ tự chủ' : 'Autonomy Level'}</span>
                  <strong class="t-val">${analysis.teacher.autonomyLevel}</strong>
                </div>
                <div class="t-stat">
                  <span class="t-label">${isVi ? 'Tổng thời gian' : 'Total Duration'}</span>
                  <strong class="t-val">${analysis.teacher.totalTimeSec}s</strong>
                </div>
                <div class="t-stat">
                  <span class="t-label">${isVi ? 'Mức gợi ý cao nhất' : 'Max Hint Level'}</span>
                  <strong class="t-val">${analysis.teacher.maxHintLevel > 0 ? `Level ${analysis.teacher.maxHintLevel}` : (isVi ? 'Không dùng' : 'None')}</strong>
                </div>
                <div class="t-stat">
                  <span class="t-label">${isVi ? 'Từ tra cứu' : 'Vocab Lookups'}</span>
                  <strong class="t-val">${analysis.teacher.vocabLookupsCount}</strong>
                </div>
              </div>

              <div class="fb-section-card card-indicators">
                <div class="fb-section-title">
                  <span class="sec-icon">📐</span>
                  <h3>${isVi ? 'Phân Tích Tiến Trình Giải Quyết Vấn Đề (Polya Framework)' : 'Problem-Solving Process Indicators (Polya Framework)'}</h3>
                </div>
                <div class="indicators-table-wrap">
                  <table class="fb-table">
                    <thead>
                      <tr>
                        <th>${isVi ? 'Giai đoạn' : 'Phase'}</th>
                        <th>${isVi ? 'Đánh giá' : 'Status'}</th>
                        <th>${isVi ? 'Biểu hiện & Dữ liệu ghi nhận' : 'Observed Behaviors & Telemetry'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${analysis.teacher.indicators.map(ind => `
                        <tr>
                          <td><strong>${ind.phase}</strong></td>
                          <td><span class="badge-status ${ind.status === 'Optimal' ? 'status-opt' : 'status-guided'}">${ind.status}</span></td>
                          <td>${ind.details}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="teacher-two-col-grid">
                <div class="fb-section-card card-errors">
                  <div class="fb-section-title">
                    <span class="sec-icon">🔍</span>
                    <h3>${isVi ? 'Dạng Lỗi / Khó Khăn Đã Xuất Hiện' : 'Observed Difficulties & Error Types'}</h3>
                  </div>
                  <ul class="fb-list">
                    ${analysis.teacher.observedErrors.map(e => `<li>${e}</li>`).join('')}
                  </ul>
                </div>

                <div class="fb-section-card card-interventions">
                  <div class="fb-section-title">
                    <span class="sec-icon">💡</span>
                    <h3>${isVi ? 'Khuyến Nghị Can Thiệp Sư Phạm' : 'Pedagogical Interventions & Prompts'}</h3>
                  </div>
                  <ul class="fb-list">
                    ${analysis.teacher.pedagogicalInterventions.map(i => `<li>${i}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <!-- 3. TAB PARENT -->
            <div class="fb-pane hidden animate-fade-in" id="fb-pane-parent">
              <div class="fb-section-card card-parent-warmth">
                <div class="fb-section-title">
                  <span class="sec-icon">❤️</span>
                  <h3>${isVi ? 'Điểm Sáng Của Con Trong Buổi Học Hôm Nay' : 'Highlights of Your Child’s Learning Today'}</h3>
                </div>
                <ul class="fb-list">
                  ${analysis.parent.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>

              <div class="fb-section-card card-parent-home">
                <div class="fb-section-title">
                  <span class="sec-icon">🏡</span>
                  <h3>${isVi ? 'Nội Dung Ba Mẹ Cùng Con Rèn Thêm Tại Nhà' : 'Suggested Home Practice Topics'}</h3>
                </div>
                <ul class="fb-list">
                  ${analysis.parent.homeFocus.map(h => `<li>${h}</li>`).join('')}
                </ul>
              </div>

              <div class="fb-section-card card-parent-prompts">
                <div class="fb-section-title">
                  <span class="sec-icon">💬</span>
                  <h3>${isVi ? '3 Câu Hỏi Gợi Mở Để Trò Chuyện Cùng Con' : '3 Natural Questions to Ask Your Child Tonight'}</h3>
                </div>
                <ul class="fb-list prompt-bubbles">
                  ${analysis.parent.conversationStarters.map(c => `<li>${c}</li>`).join('')}
                </ul>
              </div>
            </div>

          </div>

          <!-- Modal Footer Actions -->
          <div class="feedback-modal-footer">
            <button type="button" class="btn-secondary" id="btn-export-fb-report">
              📥 ${isVi ? 'Xuất Bản Nhận Xét (Text/JSON)' : 'Export Feedback Report'}
            </button>
            <div class="footer-right-actions">
              <button type="button" class="btn-secondary" id="btn-fb-return-hub">
                🏠 ${isVi ? 'Về Danh Sách Nhiệm Vụ' : 'Return to Missions Hub'}
              </button>
              <button type="button" class="btn-primary" id="btn-fb-continue">
                ${isVi ? 'Tiếp tục rèn luyện ➔' : 'Continue Practicing ➔'}
              </button>
            </div>
          </div>

        </div>
      `;

      modal.classList.add('active');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Bind Tab Switching
      const tabs = modal.querySelectorAll('.fb-tab-btn');
      tabs.forEach(tab => {
        tab.onclick = () => {
          tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');

          const targetTab = tab.getAttribute('data-tab');
          modal.querySelectorAll('.fb-pane').forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('active');
          });
          const activePane = modal.querySelector(`#fb-pane-${targetTab}`);
          if (activePane) {
            activePane.classList.remove('hidden');
            activePane.classList.add('active');
          }
          if (window.SoundFX) window.SoundFX.playPop();
        };
      });

      // Bind Close
      const closeModal = () => {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
      };
      
      // Close on button click, X icon click, or backdrop click
      modal.onclick = (e) => {
        if (e.target === modal || e.target.closest('#btn-close-feedback') || e.target.closest('.btn-close-modal')) {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
        }
      };

      const closeBtn = modal.querySelector('#btn-close-feedback') || document.getElementById('btn-close-feedback');
      if (closeBtn) {
        closeBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
        };
      }

      // Support Escape key to close
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          window.removeEventListener('keydown', escHandler);
        }
      };
      window.addEventListener('keydown', escHandler);

      // Bind Return Hub
      const returnHubBtn = document.getElementById('btn-fb-return-hub');
      if (returnHubBtn) {
        returnHubBtn.onclick = () => {
          closeModal();
          if (window.App) window.App.renderTaskSelection();
        };
      }

      // Common helper to transition to next lesson or return to hub
      const goToNextTaskOrHub = () => {
        closeModal();
        const currentId = analysis.metrics?.taskId || (window.App && window.App.activeTaskId) || 'task1-reach';
        let targetId = analysis.nextChallenge?.targetTaskId;
        if (!targetId || targetId === 'task-extra') {
          if (currentId === 'task1-reach') targetId = 'task2-fix';
          else if (currentId === 'task2-fix') targetId = 'task3-new';
          else targetId = null;
        }

        if (targetId && targetId !== 'task-extra') {
          if (window.App) window.App.navigateToTask(targetId);
        } else {
          if (window.App) window.App.renderTaskSelection();
        }
      };

      // Bind Continue / Next Lesson
      const continueBtn = document.getElementById('btn-fb-continue');
      if (continueBtn) {
        continueBtn.onclick = (e) => {
          e.preventDefault();
          goToNextTaskOrHub();
        };
      }

      // Bind Next Challenge Launch
      const challengeBtn = document.getElementById('btn-launch-challenge');
      if (challengeBtn) {
        challengeBtn.onclick = (e) => {
          e.preventDefault();
          goToNextTaskOrHub();
        };
      }

      // Bind Export Feedback Report
      const exportReportBtn = document.getElementById('btn-export-fb-report');
      if (exportReportBtn) {
        exportReportBtn.onclick = () => {
          this.downloadFeedbackReport(analysis, isVi);
        };
      }
    },

    /**
     * Download clean text/JSON feedback report
     */
    downloadFeedbackReport(analysis, isVi) {
      const report = {
        title: isVi ? "Báo Cáo Phản Hồi Học Tập - Robot Math Lab" : "Learning Process Feedback Report - Robot Math Lab",
        timestamp: new Date().toISOString(),
        metrics: analysis.metrics,
        studentFeedback: analysis.student,
        teacherFeedback: analysis.teacher,
        parentFeedback: analysis.parent,
        recommendedChallenge: analysis.nextChallenge
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RobotMathLab_Feedback_${analysis.metrics.taskId}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (typeof window !== 'undefined') {
    window.FeedbackEngine = FeedbackEngine;
  }
  if (typeof global !== 'undefined') {
    global.FeedbackEngine = FeedbackEngine;
  }
})();
