/**
<<<<<<< HEAD
 * TASK 3: THE ON-TIME CHALLENGE (🎯 Nhiệm vụ 3: Thử thách đúng giờ)
 * Problem scenario: Robot travels 1.5 km in 5 minutes at constant speed. Student finds speed in m/s.
 * Conversions: 1.5 km = 1500 m, 5 minutes = 300 s.
 * Formula & Solution: v = s / t = 1500 / 300 = 5 m/s.
 * Running parameters: v = 5 m/s, t = 300 s, s = 1500 m.
 * Target parameter: Speed (v), not time!
=======
 * TASK 3: NEW MISSION (🆕 Nhiệm vụ mới - Thay đổi điều kiện)
 * Transfer and adaptation of Polya problem-solving skills to new environmental constraints.
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
 */

window.Task3New = {
  id: 'task3-new',
<<<<<<< HEAD
  title: 'Task 3: The On-Time Challenge',
  titleVi: 'Nhiệm vụ 3: Thử thách đúng giờ',
  badge: '🆕 Level 3',
  tagline: 'Calculate required speed under new conditions',
  taglineVi: 'Tính toán vận tốc cần thiết theo điều kiện mới',

  // Problem description with bracketed vocab terms
  descriptionEn: 'A robot needs to travel a [distance]* of 1.5 [kilometer]* (1,5 km) in exactly 5 [minute]*. At what constant [speed]* (in meters per second, m/s) must the [robot]* move to [reach]* the [destination]* on time?',
  descriptionVi: 'Một rô-bốt cần đi quãng đường 1,5 km trong đúng 5 phút. Hỏi rô-bốt phải di chuyển với vận tốc không đổi là bao nhiêu mét trên giây (m/s) để đến đích đúng giờ?',

  // Problem parameters
  trackLength: 1700, // 1700m track on canvas
  targetDistance: 1500, // 1.5 km = 1500 m
  robotSpeed: 5, // 5 m/s
  correctTime: 300, // 5 minutes = 300 seconds
  unit: 'm',
  speedUnit: 'm/s',
  timeUnit: 's',
  timeScale: 50.0, // 300s simulated runs in 6s real time

  // Step 1: Understand
  step1: {
    promptEn: 'Identify the given conditions and unit conversions from the mission briefing:',
    promptVi: 'Xác định các dữ kiện và phép đổi đơn vị từ đề bài:',
    fields: [
      { key: 'distance_km', label: 'Distance (km)', unit: 'km', expected: 1.5, placeholder: '1.5' },
      { key: 'distance_m', label: 'Convert to meters (1,5 km = ? m)', unit: 'm', expected: 1500, placeholder: '1500' },
      { key: 'time_min', label: 'Time in minutes', unit: 'min', expected: 5, placeholder: '5' },
      { key: 'time_s', label: 'Convert to seconds (5 min = ? s)', unit: 's', expected: 300, placeholder: '300' }
    ],
    targetQuestionEn: 'What is the target quantity you need to calculate for this mission?',
    targetQuestionVi: 'Đại lượng nào cần phải tính toán trong nhiệm vụ này?',
    targetOptions: [
      { id: 'speed', label: 'Speed in m/s (Vận tốc tính bằng m/s)', correct: true },
      { id: 'time', label: 'Time in seconds (Thời gian tính bằng giây)', correct: false },
      { id: 'distance', label: 'Distance already given (Quãng đường đã cho)', correct: false }
    ]
  },

  // Step 2: Plan (Calculate Speed: v = s / t)
  step2: {
    promptEn: 'Formulate the mathematical formula to find speed and calculate:',
    promptVi: 'Thiết lập công thức tính vận tốc và thực hiện phép tính:',
    proposedNoteEn: '📋 Unit conversions: 1.5 km = 1500 m; 5 minutes = 300 s.',
    proposedNoteVi: '📋 Phép đổi đơn vị: 1,5 km = 1500 m; 5 phút = 300 s.',
    formulaOptions: [
      { id: 'f1', text: 'Speed = Distance ÷ Time  (v = s ÷ t = 1500 ÷ 300)', formula: 'v = s ÷ t', correct: true },
      { id: 'f2', text: 'Speed = Distance × Time  (v = s × t = 1500 × 300)', formula: 'v = s × t', correct: false },
      { id: 'f3', text: 'Speed = Time ÷ Distance  (v = t ÷ s = 300 ÷ 1500)', formula: 'v = t ÷ s', correct: false }
    ],
    calcPromptEn: 'Calculate the required speed in m/s (1500 ÷ 300):',
    calcPromptVi: 'Tính vận tốc cần thiết theo đơn vị m/s (1500 ÷ 300):',
    expectedResult: 5,
    resultUnit: 'm/s',
    projectedParamsEn: 'Calculated Speed parameter to set on robot:',
    projectedParamsVi: 'Vận tốc đã tính để cài đặt cho rô-bốt:'
  },

  // Step 3: Execute (Student enters the calculated speed; time is given as 300s)
  step3: {
    promptEn: 'Check the calculated speed parameter (v) for your robot (Time is fixed at 300 s):',
    promptVi: 'Kiểm tra thông số vận tốc (v) đã tính cho rô-bốt (Thời gian đã cho là 300 s):',
    defaultTime: 300,
    canEditSpeed: true, // Editable speed parameter
    canEditTime: false, // Time is fixed by the problem (5 min = 300 s)
    targetParam: 'speed',
    noteEn: 'Time is given as 5 minutes (300 s). Set speed = 5 m/s to test if the robot reaches 1500 m on schedule!',
    noteVi: 'Thời gian đã cho là 5 phút (300 s). Hãy cài đặt vận tốc = 5 m/s để kiểm tra rô-bốt có tới đích 1500 m đúng giờ không!'
=======
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
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  },

  // Step 4: Look Back
  step4: {
<<<<<<< HEAD
    checkQuestionEn: 'Did the robot reach the 1500m destination accurately in 300 seconds (5 minutes)?',
    checkQuestionVi: 'Rô-bốt có đến chính xác mốc 1500 m trong 300 giây (5 phút) không?',
    discrepancyQuestionEn: 'Verify your calculated speed against the simulation outcome:',
    discrepancyQuestionVi: 'Kiểm chứng kết quả tính vận tốc với kết quả mô phỏng thực tế:',
    discrepancyOptions: [
      { id: 'reached_1500', label: 'Exact match: 5 m/s × 300 s = 1500 m (1.5 km in 5 minutes)', correctForSuccess: true },
      { id: 'under_1500', label: 'Stopped short of 1500 m (Speed was too slow)', correctForShort: true },
      { id: 'over_1500', label: 'Traveled beyond 1500 m (Speed was too fast)', correctForFar: true }
    ],
    reflectionPromptEn: 'Reflect on this mission: To travel 1.5 km in 5 minutes, why did we convert units to meters and seconds before calculating speed (v = s ÷ t)?',
    reflectionPromptVi: 'Suy ngẫm: Để đi quãng đường 1,5 km trong 5 phút, tại sao chúng ta cần đổi đơn vị sang mét và giây trước khi tính vận tốc (v = s ÷ t)?',

    getMathProof: (inputs, isVi) => {
      const v = inputs.step3?.speed !== undefined ? inputs.step3.speed : 5;
      const t = inputs.step3?.time !== undefined ? inputs.step3.time : 300;
      const s = Number((v * t).toFixed(1));
      return `<strong>s = v × t</strong> = ${v} m/s × ${t} s = <strong>${s} m = 1,5 km</strong> &nbsp; (v = 1500 ÷ 300 = 5 m/s trong 5 phút)`;
    }
=======
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
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  },

  // Tiered Hints
  hints: [
    {
      level: 1,
<<<<<<< HEAD
      title: 'Đổi đơn vị chuẩn',
      en: 'First convert: 1.5 km = 1500 m, and 5 minutes = 300 seconds. The target quantity to find is Speed (v) in m/s.',
      vi: 'Đổi đơn vị trước: 1,5 km = 1500 m, và 5 phút = 300 giây. Đại lượng cần tìm là Vận tốc (v) theo đơn vị m/s.'
    },
    {
      level: 2,
      title: 'Công thức tính vận tốc',
      en: 'To find Speed when you know Distance and Time, use: Speed = Distance ÷ Time (v = s ÷ t = 1500 ÷ 300).',
      vi: 'Muốn tìm Vận tốc khi biết Quãng đường và Thời gian, dùng công thức: Vận tốc = Quãng đường ÷ Thời gian (v = s ÷ t = 1500 ÷ 300).'
    },
    {
      level: 3,
      title: 'Thực hiện phép chia',
      en: '1500 ÷ 300 = 5 m/s. Set speed = 5 m/s on your robot to reach 1500m in exactly 5 minutes.',
      vi: '1500 ÷ 300 = 5 m/s. Cài đặt vận tốc = 5 m/s cho rô-bốt để đi hết 1500 m trong đúng 5 phút.'
=======
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
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
    }
  ]
};
