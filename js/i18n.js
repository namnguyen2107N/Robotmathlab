/**
 * ROBOT MATH LAB - BILINGUAL (VIETNAMESE / ENGLISH) SYSTEM
 * Designed to reduce cognitive load for elementary students while preserving math precision.
 */

const I18n = {
  currentLang: localStorage.getItem('robot_math_lang') || 'vi',

  translations: {
    vi: {
      // Header & Navigation
      appTitle: 'Robot Math Lab',
      appSubtitle: 'Mô phỏng Toán học & Robotics Tiểu học',
      navHome: 'Trang chủ',
      navLessons: 'Danh mục Bài học',
      navProgress: 'Nhật ký & Tiến trình',
      navResearch: 'Dữ liệu Nghiên cứu',
      studentProfile: 'Học sinh',
      grade5Motion: 'Chuyển Động Đều Lớp 5',
      grade4Geometry: 'Hình Học & Đo Lường Lớp 4 (Mô-đun)',

      // Polya 4 Steps
      step1Title: '1. Hiểu vấn đề',
      step1Subtitle: 'Đọc kỹ đề bài & Phân loại dữ kiện',
      step2Title: '2. Lập kế hoạch',
      step2Subtitle: 'Chọn công thức & Chiến lược giải',
      step3Title: '3. Thực hiện',
      step3Subtitle: 'Mô phỏng & Tính toán kết quả',
      step4Title: '4. Kiểm tra & Nhìn lại',
      step4Subtitle: 'Đánh giá kết quả & Mở rộng',

      // Polya UI Elements
      knownData: 'Dữ kiện ĐÃ BIẾT (Đề cho)',
      unknownData: 'Dữ kiện CẦN TÌM (Hỏi)',
      dragHint: 'Kéo thả hoặc bấm để phân loại thông tin bài toán:',
      selectFormula: 'Chọn công thức thích hợp để giải bài toán:',
      formulaTriangle: 'Tam giác liên hệ (s, v, t):',
      formulaSpeed: 'v = s ÷ t  (Vận tốc = Quãng đường ÷ Thời gian)',
      formulaDistance: 's = v × t  (Quãng đường = Vận tốc × Thời gian)',
      formulaTime: 't = s ÷ v  (Thời gian = Quãng đường ÷ Vận tốc)',
      formulaOpposite: 't = s ÷ (v₁ + v₂)  (Hai vật chuyển động ngược chiều)',
      inputValues: 'Nhập số liệu để cài đặt Robot:',
      runSimulation: 'Chạy mô phỏng',
      pauseSimulation: 'Tạm dừng',
      resetSimulation: 'Đặt lại',
      stepSimulation: 'Từng bước',
      speedLabel: 'Tốc độ mô phỏng:',
      timeElapsed: 'Thời gian:',
      distanceCovered: 'Quãng đường:',
      currentVelocity: 'Vận tốc:',

      // Action Buttons
      btnNext: 'Tiếp tục',
      btnBack: 'Quay lại',
      btnHint: 'Gợi ý',
      btnCheck: 'Kiểm tra kết quả',
      btnTryAgain: 'Thử lại',
      btnComplete: 'Hoàn thành bài học',
      btnExportData: 'Xuất dữ liệu nghiên cứu (CSV)',
      btnClearData: 'Xóa dữ liệu',

      // Feedback & Dialogs
      correctMessage: 'Tuyệt vời! Kết quả hoàn toàn chính xác.',
      incorrectMessage: 'Chưa chính xác rồi. Hãy thử quan sát lại mô phỏng nhé!',
      hintUsedText: 'Bạn đã mở một gợi ý:',
      reviewQuestion1: 'Kết quả tính được có hợp lý với thực tế không?',
      reviewQuestion2: 'Nếu vận tốc của Robot tăng gấp đôi, thời gian đi sẽ thay đổi thế nào?',
      congratsTitle: 'Chúc mừng bạn đã hoàn thành bài học!',
      
      // === NEW: Prediction-Observe-Compare Cycle (NCKH) ===
      phasePredictionTitle: 'Pha 1: Dự đoán & Ước lượng ban đầu',
      phasePredictionDesc: 'Trước khi tính toán, hãy quan sát và đưa ra ước lượng ban đầu của bạn:',
      phaseCalculationTitle: 'Pha 2: Tính toán chính xác & Lập trình Robot',
      phaseComparisonTitle: 'Pha 3: Đối chiếu Dự đoán vs Kết quả thực tế',
      btnSavePrediction: 'Lưu dự đoán & Bắt đầu tính toán',
      predictionSavedNotice: '✓ Đã ghi nhận dự đoán! Giờ hãy áp dụng công thức để tính giá trị chính xác.',
      predictionLabel: 'Dự đoán ban đầu:',
      calculatedLabel: 'Tính toán chính xác:',
      actualSimLabel: 'Mô phỏng thực tế:',
      deviationLabel: 'Độ chênh lệch ước lượng:',
      observeSimulationPrompt: 'Quan sát robot chạy trên đường đua ảo để kiểm chứng tính toán!',

      // === NEW: Step 4 Interactive Review & What-if ===
      step4InteractiveDesc: 'Thực hiện 3 thử thách kiểm tra & nhìn lại để nhận 30 sao thưởng:',
      unitCheckTitle: 'Thử thách 1: Kiểm tra đơn vị đo lường',
      whatIfTitle: 'Thử thách 2: Kịch bản "Nếu... thì sao?" (What-If)',
      whatIfDesc: 'Thay đổi thông số và dự đoán kết quả mới để rèn luyện tư duy ngoại suy:',
      btnTestWhatIf: 'Chạy thử nghiệm What-If',
      selfAssessmentTitle: 'Thử thách 3: Tự đánh giá mức độ tự tin',
      selfConfidencePrompt: 'Bạn tự tin bao nhiêu phần trăm khi gặp lại bài toán dạng này?',

      // === NEW: Bilingual Math Vocabulary ===
      mathVocabTitle: 'Từ điển Thuật ngữ Toán - Anh',
      vocabDistance: 'Quãng đường (Distance - s)',
      vocabVelocity: 'Vận tốc (Velocity / Speed - v)',
      vocabTime: 'Thời gian (Time - t)',
      vocabFormula: 'Công thức (Formula)',
      vocabOpposite: 'Ngược chiều (Opposite direction)',
      vocabSameDir: 'Cùng chiều (Same direction)',

      // Units
      unitMeters: 'm',
      unitKilometers: 'km',
      unitSeconds: 'giây',
      unitHours: 'giờ',
      unitMps: 'm/s',
      unitKmph: 'km/h',

      // 5 Lessons Metadata
      lesson1Title: 'Bài 1: Cuộc Đua Robot – Khái Niệm Vận Tốc',
      lesson1Desc: 'Giúp 2 Robot Alpha và Beta chạy đua 100m. Tìm xem Robot nào chạy nhanh hơn và tính vận tốc của từng Robot.',
      lesson2Title: 'Bài 2: Robot Giao Hàng – Tính Quãng Đường',
      lesson2Desc: 'Robot Eco giao bưu phẩm với vận tốc cố định 15 km/h trong 3 giờ. Hãy xác định quãng đường Robot đã đi.',
      lesson3Title: 'Bài 3: Robot Cứu Hộ – Tính Thời Gian',
      lesson3Desc: 'Trạm cứu hộ cách hiện trường 120 km. Robot cứu hỏa chạy với vận tốc 40 km/h. Cần bao nhiêu giờ để tới nơi?',
      lesson4Title: 'Bài 4: Hai Robot Chạy Ngược Chiều Gặp Nhau',
      lesson4Desc: 'Hai Robot xuất phát cùng lúc từ hai trạm cách nhau 200 km và đi ngược chiều. Khi nào và ở đâu chúng sẽ gặp nhau?',
      lesson5Title: 'Bài 5: Thử Thách Lộ Trình Đa Chặng',
      lesson5Desc: 'Robot thám hiểm Mặt Trăng vượt qua 3 chặng đường gồ ghề với vận tốc khác nhau. Tính tổng thời gian và vẽ đồ thị chuyển động.'
    },

    en: {
      // Header & Navigation
      appTitle: 'Robot Math Lab',
      appSubtitle: 'Elementary Math & Virtual Robotics Lab',
      navHome: 'Home',
      navLessons: 'Lesson Catalog',
      navProgress: 'Log & Progress',
      navResearch: 'Research Telemetry',
      studentProfile: 'Student',
      grade5Motion: 'Grade 5 Uniform Motion',
      grade4Geometry: 'Grade 4 Geometry & Measurement (Module)',

      // Polya 4 Steps
      step1Title: '1. Understand the Problem',
      step1Subtitle: 'Read carefully & Categorize given data',
      step2Title: '2. Devise a Plan',
      step2Subtitle: 'Choose formulas & Strategy',
      step3Title: '3. Carry Out the Plan',
      step3Subtitle: 'Simulate & Calculate result',
      step4Title: '4. Look Back & Review',
      step4Subtitle: 'Evaluate result & Extend knowledge',

      // Polya UI Elements
      knownData: 'GIVEN Information (Knowns)',
      unknownData: 'TO FIND Information (Unknowns)',
      dragHint: 'Drag or click to classify problem information:',
      selectFormula: 'Select the appropriate formula to solve the problem:',
      formulaTriangle: 'Relationship Triangle (s, v, t):',
      formulaSpeed: 'v = s ÷ t  (Velocity = Distance ÷ Time)',
      formulaDistance: 's = v × t  (Distance = Velocity × Time)',
      formulaTime: 't = s ÷ v  (Time = Distance ÷ Velocity)',
      formulaOpposite: 't = s ÷ (v₁ + v₂)  (Two objects in opposite motion)',
      inputValues: 'Enter parameters to configure the Robot:',
      runSimulation: 'Run Simulation',
      pauseSimulation: 'Pause',
      resetSimulation: 'Reset',
      stepSimulation: 'Step',
      speedLabel: 'Simulation Speed:',
      timeElapsed: 'Time elapsed:',
      distanceCovered: 'Distance covered:',
      currentVelocity: 'Velocity:',

      // Action Buttons
      btnNext: 'Next',
      btnBack: 'Back',
      btnHint: 'Hint',
      btnCheck: 'Check Answer',
      btnTryAgain: 'Try Again',
      btnComplete: 'Finish Lesson',
      btnExportData: 'Export Research Data (CSV)',
      btnClearData: 'Clear Data',

      // Feedback & Dialogs
      correctMessage: 'Awesome job! The calculation is completely correct.',
      incorrectMessage: 'Not quite right yet. Try observing the simulation again!',
      hintUsedText: 'You opened a hint:',
      reviewQuestion1: 'Does the calculated result make sense in real life?',
      reviewQuestion2: 'If the Robot velocity is doubled, how would the travel time change?',
      congratsTitle: 'Congratulations! You completed the lesson!',
      
      // === NEW: Prediction-Observe-Compare Cycle (NCKH) ===
      phasePredictionTitle: 'Phase 1: Initial Estimation & Prediction',
      phasePredictionDesc: 'Before calculating, observe the scenario and make your initial estimate:',
      phaseCalculationTitle: 'Phase 2: Mathematical Calculation & Robot Setup',
      phaseComparisonTitle: 'Phase 3: Compare Prediction vs Actual Result',
      btnSavePrediction: 'Save Prediction & Start Calculation',
      predictionSavedNotice: '✓ Prediction logged! Now apply the mathematical formula to find the exact value.',
      predictionLabel: 'Your Prediction:',
      calculatedLabel: 'Calculated Value:',
      actualSimLabel: 'Actual Simulation:',
      deviationLabel: 'Estimation Error:',
      observeSimulationPrompt: 'Observe the virtual robot run to verify your mathematical calculation!',

      // === NEW: Step 4 Interactive Review & What-if ===
      step4InteractiveDesc: 'Complete 3 interactive review challenges to earn 30 bonus stars:',
      unitCheckTitle: 'Challenge 1: Measurement Unit Verification',
      whatIfTitle: 'Challenge 2: "What-If" Scenario Exploration',
      whatIfDesc: 'Modify parameters and predict the new outcome to build extrapolation thinking:',
      btnTestWhatIf: 'Run What-If Simulation',
      selfAssessmentTitle: 'Challenge 3: Metacognitive Self-Assessment',
      selfConfidencePrompt: 'How confident are you if you encounter this type of problem again?',

      // === NEW: Bilingual Math Vocabulary ===
      mathVocabTitle: 'Math-English Vocabulary Glossary',
      vocabDistance: 'Distance (Quãng đường - s)',
      vocabVelocity: 'Velocity / Speed (Vận tốc - v)',
      vocabTime: 'Time (Thời gian - t)',
      vocabFormula: 'Formula (Công thức)',
      vocabOpposite: 'Opposite direction (Ngược chiều)',
      vocabSameDir: 'Same direction (Cùng chiều)',

      // Units
      unitMeters: 'm',
      unitKilometers: 'km',
      unitSeconds: 's',
      unitHours: 'h',
      unitMps: 'm/s',
      unitKmph: 'km/h',

      // 5 Lessons Metadata
      lesson1Title: 'Lesson 1: Robot Race – Concept of Velocity',
      lesson1Desc: 'Help Robot Alpha and Beta race 100m. Determine which robot is faster and calculate their velocities.',
      lesson2Title: 'Lesson 2: Delivery Robot – Calculating Distance',
      lesson2Desc: 'Robot Eco delivers packages at a constant speed of 15 km/h for 3 hours. Calculate how far it traveled.',
      lesson3Title: 'Lesson 3: Rescue Robot – Calculating Time',
      lesson3Desc: 'The rescue station is 120 km away. The fire-fighting robot runs at 40 km/h. How many hours to arrive?',
      lesson4Title: 'Lesson 4: Two Robots Moving Towards Each Other',
      lesson4Desc: 'Two robots start simultaneously from two points 200 km apart moving towards each other. When and where do they meet?',
      lesson5Title: 'Lesson 5: Multi-Stage Route Challenge',
      lesson5Desc: 'Lunar Explorer Robot traverses 3 terrain segments at different speeds. Calculate total time and inspect the motion graph.'
    }
  },

  /**
   * Get translated string by key
   */
  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    // Fallback to Vietnamese or key itself
    return (this.translations.vi && this.translations.vi[key]) || key;
  },

  /**
   * Switch language
   */
  setLang(lang) {
    if (lang === 'vi' || lang === 'en') {
      this.currentLang = lang;
      localStorage.setItem('robot_math_lang', lang);
      document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
      this.updateDOM();
    }
  },

  /**
   * Automatically update elements with data-i18n attribute
   */
  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    // Update active state in toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  }
};

window.I18n = I18n;
