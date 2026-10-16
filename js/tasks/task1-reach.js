/**
 * TASK 1: REACH THE GOAL (🎯 Nhiệm vụ 1: Hành trình đến đích)
 * Baseline single-variable Polya problem solving task.
 * Mathematical scenario: Robot travels 42m at constant speed 7 m/s. Student finds time.
 */

window.Task1Reach = {
  id: 'task1-reach',
  title: 'Task 1: Reach the Goal',
  titleVi: 'Nhiệm vụ 1: Hành trình đến đích',
  badge: '🎯 Level 1',
  tagline: 'Understand the problem, plan, and carry out',
  taglineVi: 'Hiểu vấn đề, lập kế hoạch và thực hiện',

  // Problem description with bracketed vocab terms
  descriptionEn: 'A robot moves at a constant [speed]* of 7 [meter]* per second (7 m/s). It needs to travel a [distance]* of 42 [meter]*. How many seconds does the [robot]* need to [reach]* the [destination]*?',
  descriptionVi: 'Một rô-bốt di chuyển với vận tốc không đổi 7 m/s. Rô-bốt cần đi quãng đường 42 m. Hỏi rô-bốt cần bao nhiêu giây để đến đích?',

  // Problem parameters
  trackLength: 50, // 50m track on canvas so 42m marker is clearly visible
  targetDistance: 42, // 42m target
  robotSpeed: 7, // 7 m/s
  correctTime: 6, // 42 / 7 = 6 seconds
  unit: 'm',
  speedUnit: 'm/s',
  timeUnit: 's',
  timeScale: 1.0,

  // Step 1: Understand
  step1: {
    promptEn: 'Identify the information given in the problem:',
    promptVi: 'Xác định các dữ kiện đã cho trong đề bài:',
    fields: [
      { key: 'speed', label: 'Speed (v)', unit: 'm/s', expected: 7, placeholder: '' },
      { key: 'distance', label: 'Distance (s)', unit: 'm', expected: 42, placeholder: '' }
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
    promptEn: 'Choose the correct formula and calculate the required time:',
    promptVi: 'Chọn công thức đúng và tính thời gian cần thiết:',
    formulaOptions: [
      { id: 'f1', text: 'Time = Distance ÷ Speed  (t = s ÷ v = 42 ÷ 7)', formula: 't = s ÷ v', correct: true },
      { id: 'f2', text: 'Time = Distance × Speed  (t = s × v = 42 × 7)', formula: 't = s × v', correct: false },
      { id: 'f3', text: 'Time = Speed ÷ Distance  (t = v ÷ s = 7 ÷ 42)', formula: 't = v ÷ s', correct: false }
    ],
    calcPromptEn: 'Enter your calculation result for time (in seconds):',
    calcPromptVi: 'Nhập kết quả tính thời gian của bạn (đơn vị: giây):',
    expectedResult: 6,
    resultUnit: 's',
    projectedParamsEn: 'Parameters you will send to the robot:',
    projectedParamsVi: 'Thông số dự kiến nạp cho rô-bốt:'
  },

  // Step 3: Execute
  step3: {
    promptEn: 'Check the calculated running time, confirm the given speed, and open the Virtual Robot Track:',
    promptVi: 'Kiểm tra thời gian đã tính, xác nhận vận tốc đề bài và mở Virtual Robot Track:',
    defaultSpeed: 7,
    canEditSpeed: false, // In task 1, speed is fixed by problem (7 m/s)
    canEditTime: true,
    targetParam: 'time'
  },

  // Step 4: Look Back
  step4: {
    checkQuestionEn: 'Did the robot reach the exact 42m destination?',
    checkQuestionVi: 'Rô-bốt có đến đúng vạch đích 42 m không?',
    discrepancyQuestionEn: 'Compare the actual distance and target distance:',
    discrepancyQuestionVi: 'So sánh quãng đường thực tế và quãng đường yêu cầu:',
    discrepancyOptions: [
      { id: 'reached', label: 'Robot reached 42m exactly', correctForSuccess: true },
      { id: 'too_short', label: 'Robot stopped before 42m (Too short)', correctForShort: true },
      { id: 'too_far', label: 'Robot went past 42m (Too far)', correctForFar: true }
    ],
    reflectionPromptEn: 'How does checking with the simulation help you verify your mathematical calculation (t = 42 ÷ 7 = 6 seconds)?',
    reflectionPromptVi: 'Việc kiểm tra bằng mô phỏng đường chạy giúp em xác nhận kết quả tính toán t = 42 ÷ 7 = 6 giây như thế nào?',
    getMathProof: (inputs, isVi) => {
      const v = inputs.step3?.speed !== undefined ? inputs.step3.speed : 7;
      const t = inputs.step3?.time !== undefined ? inputs.step3.time : 6;
      const s = Number((v * t).toFixed(1));
      return `<strong>s = v × t</strong> = ${v} m/s × ${t} s = <strong>${s} m</strong> &nbsp; (t = 42 ÷ 7 = 6 s)`;
    }
  },

  // Tiered Hints
  hints: [
    {
      level: 1,
      title: 'Tư duy về ý nghĩa vận tốc',
      en: 'Speed = 7 m/s means every 1 second, the robot moves 7 meters. In 2 seconds it moves 14m, in 3 seconds 21m. How many seconds for 42m?',
      vi: 'Vận tốc 7 m/s nghĩa là cứ mỗi 1 giây rô-bốt đi được 7 mét. Sau 2 giây đi được 14m, sau 3 giây đi được 21m... Vậy cần bao nhiêu giây để đi hết 42m?'
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
      en: 'Divide 42 by 7: 42 ÷ 7 = 6 seconds. The robot needs 6 seconds to reach the 42m destination.',
      vi: 'Lấy 42 chia cho 7: 42 ÷ 7 = 6 giây. Rô-bốt cần chạy trong 6 giây để đến đúng vạch đích 42m.'
    }
  ]
};
