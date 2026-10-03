/**
 * TASK 3: NEW MISSION (🆕 Nhiệm vụ mới - Thay đổi điều kiện)
 * Transfer and adaptation of Polya problem-solving skills to new environmental constraints.
 */

window.Task3New = {
  id: 'task3-new',
  title: 'Task 3: New Mission',
  titleVi: 'Nhiệm vụ 3: Nhiệm vụ mới',
  badge: '🆕 Level 3',
  tagline: 'Adapt to changed conditions: new destination (35m) and new speed (5 m/s)',
  taglineVi: 'Thích ứng với điều kiện mới: đích đến mới (35m) và vận tốc mới (5 m/s)',

  // Problem description with bracketed vocab terms
  descriptionEn: 'The mission conditions have changed! The robot must deliver a payload to a new [destination]* at 35 [meter]*. To conserve energy, its [speed]* is adjusted to 5 [meter]* per second (5 m/s). Formulate a new [plan]*: how many seconds should the robot [run]* to [reach]* 35 m?',
  descriptionVi: 'Điều kiện nhiệm vụ đã thay đổi! Robot cần giao hàng đến vị trí đích mới ở 35 m. Để tiết kiệm năng lượng, vận tốc được chỉnh thành 5 m/s. Hãy lập kế hoạch mới: robot cần chạy trong bao nhiêu giây để tới đích 35 m?',

  // Problem parameters
  trackLength: 40, // 40m track
  targetDistance: 35, // 35m target
  robotSpeed: 5, // 5 m/s
  correctTime: 7, // 35 / 5 = 7 seconds
  unit: 'm',
  speedUnit: 'm/s',
  timeUnit: 's',

  // Step 1: Understand
  step1: {
    promptEn: 'Identify the new conditions from the mission briefing:',
    promptVi: 'Xác định các điều kiện mới từ bản mô tả nhiệm vụ:',
    fields: [
      { key: 'speed', label: 'New Speed (v)', unit: 'm/s', expected: 5, placeholder: '' },
      { key: 'distance', label: 'New Target Distance (s)', unit: 'm', expected: 35, placeholder: '' }
    ],
    targetQuestionEn: 'What is the target quantity to calculate?',
    targetQuestionVi: 'Đại lượng nào cần tính toán cho nhiệm vụ mới này?',
    targetOptions: [
      { id: 'time', label: 'Required running time (thời gian chạy cần thiết)', correct: true },
      { id: 'distance', label: 'Distance already given (quãng đường đã cho)', correct: false },
      { id: 'battery', label: 'Battery percentage (phần trăm pin)', correct: false }
    ]
  },

  // Step 2: Plan
  step2: {
    promptEn: 'Formulate the mathematical equation for this new mission:',
    promptVi: 'Thiết lập biểu thức toán học cho nhiệm vụ mới này:',
    formulaOptions: [
      { id: 'f1', text: 'Time = 35 ÷ 5  (t = s ÷ v)', formula: 't = 35 ÷ 5', correct: true },
      { id: 'f2', text: 'Time = 35 × 5  (t = s × v)', formula: 't = 35 × 5', correct: false },
      { id: 'f3', text: 'Time = 35 - 5  (t = s - v)', formula: 't = 35 - 5', correct: false }
    ],
    calcPromptEn: 'Calculate the required time in seconds:',
    calcPromptVi: 'Tính thời gian cần thiết (đơn vị: giây):',
    expectedResult: 7,
    resultUnit: 's',
    projectedParamsEn: 'Planned Robot Settings:',
    projectedParamsVi: 'Thông số robot dự kiến cài đặt:'
  },

  // Step 3: Execute
  step3: {
    promptEn: 'Enter the parameters for your robot and launch the new mission:',
    promptVi: 'Nhập các thông số cho robot và khởi động nhiệm vụ mới:',
    defaultSpeed: 5,
    defaultTime: 7,
    canEditSpeed: true,
    canEditTime: true
  },

  // Step 4: Look Back
  step4: {
    checkQuestionEn: 'Did the robot reach the 35m marker accurately?',
    checkQuestionVi: 'Robot có đến chính xác mốc 35m không?',
    discrepancyQuestionEn: 'Verification of calculation vs simulation outcome:',
    discrepancyQuestionVi: 'Kiểm chứng kết quả tính toán so với mô phỏng thực tế:',
    discrepancyOptions: [
      { id: 'reached_35', label: 'Exact match: 5 m/s × 7 s = 35 m', correctForSuccess: true },
      { id: 'under_35', label: 'Stopped short of 35 m', correctForShort: true },
      { id: 'over_35', label: 'Traveled beyond 35 m', correctForFar: true }
    ],
    reflectionPromptEn: 'Compare this mission with Task 1: How did changing the speed from 6 m/s to 5 m/s affect the required time?',
    reflectionPromptVi: 'So sánh với Nhiệm vụ 1: Việc giảm vận tốc từ 6 m/s xuống 5 m/s ảnh hưởng thế nào đến thời gian cần để đi hết quãng đường?'
  },

  // Tiered Hints
  hints: [
    {
      level: 1,
      title: 'Đếm theo bội số của 5',
      en: 'With speed 5 m/s, count by 5s for each second: 5, 10, 15, 20, 25, 30, 35. How many seconds?',
      vi: 'Với vận tốc 5 m/s, hãy đếm theo bội của 5 cho mỗi giây: 5, 10, 15, 20, 25, 30, 35. Cần bao nhiêu giây?'
    },
    {
      level: 2,
      title: 'Áp dụng công thức thời gian',
      en: 'Apply the same formula: Time = Distance ÷ Speed = 35 ÷ 5.',
      vi: 'Áp dụng công thức tương tự: Thời gian = Quãng đường ÷ Vận tốc = 35 ÷ 5.'
    },
    {
      level: 3,
      title: 'Kết quả tính',
      en: '35 ÷ 5 = 7 seconds. Enter 7 for time.',
      vi: '35 chia 5 bằng 7 giây. Nhập 7 vào ô thời gian.'
    }
  ]
};
