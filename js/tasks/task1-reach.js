/**
 * TASK 1: REACH THE GOAL (🎯 Đạt mục tiêu)
 * Baseline single-variable Polya problem solving task.
 */

window.Task1Reach = {
  id: 'task1-reach',
  title: 'Task 1: Reach the Goal',
  titleVi: 'Nhiệm vụ 1: Đạt mục tiêu',
  badge: '🎯 Level 1',
  tagline: 'Plan and get the robot to reach the exact destination',
  taglineVi: 'Lập kế hoạch để robot di chuyển đến đúng đích',

  // Problem description with bracketed vocab terms
  descriptionEn: 'A robot moves at a [speed]* of 6 [meter]* per second (6 m/s). It needs to travel a [distance]* of 24 [meter]*. How many seconds does the [robot]* need to [reach]* the [destination]*?',
  descriptionVi: 'Một robot di chuyển với vận tốc 6 m/s. Robot cần đi quãng đường 24 m. Hỏi robot cần bao nhiêu giây để đến đích?',

  // Problem parameters
  trackLength: 30, // meters total on canvas
  targetDistance: 24, // meters required
  robotSpeed: 6, // m/s
  correctTime: 4, // seconds (24 / 6)
  unit: 'm',
  speedUnit: 'm/s',
  timeUnit: 's',

  // Step 1: Understand
  step1: {
    promptEn: 'Identify the information given in the problem:',
    promptVi: 'Xác định các dữ kiện đã cho trong đề bài:',
    fields: [
      { key: 'speed', label: 'Speed (v)', unit: 'm/s', expected: 6, placeholder: '' },
      { key: 'distance', label: 'Distance (s)', unit: 'm', expected: 24, placeholder: '' }
    ],
    targetQuestionEn: 'What quantity do you need to find?',
    targetQuestionVi: 'Đại lượng nào cần phải tìm?',
    targetOptions: [
      { id: 'speed', label: 'Speed (vận tốc)', correct: false },
      { id: 'time', label: 'Time (thời gian)', correct: true },
      { id: 'distance', label: 'Distance (quãng đường)', correct: false }
    ]
  },

  // Step 2: Plan
  step2: {
    promptEn: 'Choose the correct formula and calculate:',
    promptVi: 'Chọn công thức đúng và thực hiện phép tính:',
    formulaOptions: [
      { id: 'f1', text: 'Time = Distance ÷ Speed  (t = s ÷ v)', formula: 't = s ÷ v', correct: true },
      { id: 'f2', text: 'Time = Distance × Speed  (t = s × v)', formula: 't = s × v', correct: false },
      { id: 'f3', text: 'Time = Speed ÷ Distance  (t = v ÷ s)', formula: 't = v ÷ s', correct: false }
    ],
    calcPromptEn: 'Enter your calculation result:',
    calcPromptVi: 'Nhập kết quả tính toán của bạn:',
    expectedResult: 4,
    resultUnit: 's',
    projectedParamsEn: 'Parameters you will send to the robot:',
    projectedParamsVi: 'Thông số dự kiến nạp cho robot:'
  },

  // Step 3: Execute
  step3: {
    promptEn: 'Set the parameters for your robot and test the plan:',
    promptVi: 'Thiết lập thông số cho robot và chạy thử nghiệm:',
    defaultSpeed: 6,
    defaultTime: 4,
    canEditSpeed: false, // In task 1, speed is fixed by problem
    canEditTime: true
  },

  // Step 4: Look Back
  step4: {
    checkQuestionEn: 'Did the robot reach the exact 24m destination?',
    checkQuestionVi: 'Robot có đến đúng vạch đích 24m không?',
    discrepancyQuestionEn: 'Compare the actual distance and required distance:',
    discrepancyQuestionVi: 'So sánh quãng đường thực tế và quãng đường yêu cầu:',
    discrepancyOptions: [
      { id: 'reached', label: 'Robot reached 24m exactly', correctForSuccess: true },
      { id: 'too_short', label: 'Robot stopped before 24m (Too short)', correctForShort: true },
      { id: 'too_far', label: 'Robot went past 24m (Too far)', correctForFar: true }
    ],
    reflectionPromptEn: 'How does checking with the simulation help you verify your mathematical calculation?',
    reflectionPromptVi: 'Việc kiểm tra bằng mô phỏng robot giúp bạn xác nhận kết quả tính toán như thế nào?'
  },

  // Tiered Hints
  hints: [
    {
      level: 1,
      title: 'Tư duy về ý nghĩa vận tốc',
      en: 'Speed = 6 m/s means every 1 second, the robot moves 6 meters. In 2 seconds it moves 12m. How many seconds for 24m?',
      vi: 'Vận tốc 6 m/s nghĩa là cứ mỗi 1 giây robot đi được 6 mét. Sau 2 giây đi được 12m. Vậy cần mấy giây để đi hết 24m?'
    },
    {
      level: 2,
      title: 'Mối quan hệ và công thức',
      en: 'To find Time when you know Distance and Speed, use: Time = Distance ÷ Speed (t = s ÷ v).',
      vi: 'Để tìm Thời gian khi đã biết Quãng đường và Vận tốc, dùng công thức: Thời gian = Quãng đường ÷ Vận tốc (t = s ÷ v).'
    },
    {
      level: 3,
      title: 'Phép tính chi tiết',
      en: 'Divide 24 by 6: 24 ÷ 6 = 4 seconds. The robot needs 4 seconds.',
      vi: 'Lấy 24 chia cho 6: 24 ÷ 6 = 4 giây. Robot cần chạy trong 4 giây.'
    }
  ]
};
