/**
<<<<<<< HEAD
 * TASK 2: THE UNEXPECTED JOURNEY (🎯 Nhiệm vụ 2: Chuyến đi bất ngờ)
 * Problem scenario: Robot travels 1.2 km at constant speed 4 m/s. Student finds time in minutes.
 * Standardized initial trial run: 4 m/s in 240 s -> stops at 960 m (short of 1200 m).
 * Follow-up lookback uses open, neutral questions without spoiler guidance:
 * - What do you observe?
 * - Did the result reach the target?
 * - Why do you think this happened?
 * - What would you like to adjust?
 * Adjusted run: 4 m/s for 300 s -> reaches 1200 m (1.2 km = 1200 m, 300 s = 5 minutes).
=======
 * TASK 2: TEST THE PLAN (Nhiệm vụ 2: Kiểm tra phương án)
 * Neutral situational scenario: test a proposed plan, observe robot movement on the track, and verify.
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
 */

window.Task2Fix = {
  id: 'task2-fix',
<<<<<<< HEAD
  title: 'Task 2: The Unexpected Journey',
  titleVi: 'Nhiệm vụ 2: Chuyến đi bất ngờ',
  badge: '🎯 Level 2',
  tagline: 'Check, detect, explain, and adjust',
  taglineVi: 'Kiểm tra, phát hiện, giải thích và điều chỉnh',

  // Problem description: neutral, accurate
  descriptionEn: 'A robot travels a [distance]* of 1.2 [kilometer]* (1,2 km) at a constant [speed]* of 4 [meter]* per second (4 m/s). How many minutes does the [robot]* need to [reach]* the [destination]*? First, test the proposed plan ([time]* = 240 s) on the Virtual Robot Track, observe where the robot stops, and verify the outcome!',
  descriptionVi: 'Một rô-bốt đi quãng đường 1,2 km với vận tốc không đổi 4 m/s. Hỏi rô-bốt cần bao nhiêu phút để đến đích? Trước tiên, hãy chạy thử phương án đề xuất (thời gian 240 giây) trên Virtual Robot Track, quan sát điểm dừng của rô-bốt và kiểm chứng kết quả!',

  // Problem parameters
  trackLength: 1400, // 1400m track on canvas (allows clear view of 960m stop and 1200m target)
  targetDistance: 1200, // 1.2 km = 1200 m
  robotSpeed: 4, // 4 m/s
  trialTime: 240, // standardized initial simulation: 4 * 240 = 960 m
  correctTime: 300, // 1200 / 4 = 300 s = 5 minutes
  unit: 'm',
  speedUnit: 'm/s',
  timeUnit: 's',
  timeScale: 50.0, // 240s runs in 4.8s, 300s runs in 6s real time

  // Step 1: Understand
  step1: {
    promptEn: 'Identify the given quantities and unit conversions from the problem:',
    promptVi: 'Xác định các dữ kiện và phép đổi đơn vị từ đề bài:',
    fields: [
      { key: 'distance_km', label: 'Given Distance (km)', unit: 'km', expected: 1.2, placeholder: '1.2' },
      { key: 'distance_m', label: 'Convert to meters (1,2 km = ? m)', unit: 'm', expected: 1200, placeholder: '1200' },
      { key: 'speed', label: 'Speed (v)', unit: 'm/s', expected: 4, placeholder: '4' }
    ],
    targetQuestionEn: 'What is the required target quantity and unit to find?',
    targetQuestionVi: 'Đại lượng và đơn vị cần tìm trong đề bài là gì?',
    targetOptions: [
      { id: 'time_minutes', label: 'Time in minutes (Thời gian tính bằng phút)', correct: true },
      { id: 'speed_ms', label: 'Speed in m/s (Vận tốc tính bằng m/s)', correct: false },
      { id: 'distance_km', label: 'Distance in km (Quãng đường tính bằng km)', correct: false }
=======
  title: 'Task 2: Test the Plan',
  titleVi: 'Nhiệm vụ 2: Kiểm tra phương án',
  badge: '🎯 Level 2',
  tagline: 'Test a proposed motion plan and verify the robot outcome',
  taglineVi: 'Chạy thử phương án đề xuất và kiểm chứng kết quả chuyển động của robot',

  // Problem description: neutral, zero spoilers
  descriptionEn: 'A classmate created a [plan]* for the [robot]* to [reach]* a 24 [meter]* [destination]* at a [speed]* of 6 [meter]* per second (6 m/s), setting [time]* = 3 [second]*. Run the simulation to test this plan, observe where the robot stops, and verify the result!',
  descriptionVi: 'Một bạn học sinh đã lập một phương án cho robot đi đến đích 24 m với vận tốc 6 m/s trong thời gian 3 giây. Hãy chạy thử mô phỏng để kiểm tra phương án này, quan sát điểm dừng của robot và đối chiếu với yêu cầu đề bài!',

  // Problem parameters
  trackLength: 30,
  targetDistance: 24,
  robotSpeed: 6,
  flawedTime: 3, // initial plan value to test
  correctTime: 4, // time needed for 24m
  unit: 'm',
  speedUnit: 'm/s',
  timeUnit: 's',

  // Step 1: Understand
  step1: {
    promptEn: 'Identify the given specifications of the proposed plan:',
    promptVi: 'Xác định các dữ kiện của phương án đề xuất:',
    fields: [
      { key: 'speed', label: 'Speed (v)', unit: 'm/s', expected: 6, placeholder: '' },
      { key: 'distance', label: 'Target Destination (s)', unit: 'm', expected: 24, placeholder: '' }
    ],
    targetQuestionEn: 'What is our main goal in this mission?',
    targetQuestionVi: 'Mục tiêu chính của chúng ta trong nhiệm vụ này là gì?',
    targetOptions: [
      { id: 'fix_reach', label: 'Test the plan and verify if the robot reaches 24m', correct: true },
      { id: 'make_faster', label: 'Make the robot run faster than 6 m/s', correct: false },
      { id: 'stop_at_18', label: 'Change the target distance to 100m', correct: false }
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
    ]
  },

  // Step 2: Plan
  step2: {
<<<<<<< HEAD
    promptEn: 'Calculate the mathematical time required to travel 1200 m (1.2 km):',
    promptVi: 'Tính toán thời gian lý thuyết cần thiết để đi hết 1200 m (1,2 km):',
    proposedNoteEn: '📋 Unit conversion: 1.2 km = 1200 m.',
    proposedNoteVi: '📋 Phép đổi đơn vị: 1,2 km = 1200 m.',
    formulaOptions: [
      { id: 'f1', text: 'Time = 1200 ÷ 4 = 300 s = 5 minutes  (t = s ÷ v)', formula: 't = s ÷ v', correct: true },
      { id: 'f2', text: 'Time = 1200 × 4 = 4800 s  (t = s × v)', formula: 't = s × v', correct: false },
      { id: 'f3', text: 'Time = 1200 - 4 = 1196 s  (t = s - v)', formula: 't = s - v', correct: false }
    ],
    calcPromptEn: 'Enter the calculated time in seconds (1200 ÷ 4):',
    calcPromptVi: 'Nhập thời gian tính bằng giây (1200 ÷ 4):',
    expectedResult: 300,
    resultUnit: 's (300 s = 5 phút)',
    projectedParamsEn: 'Theoretical time needed for 1200m:',
    projectedParamsVi: 'Thời gian lý thuyết cần để tới mốc 1200m:'
  },

  // Step 3: Execute (Initial Trial Run)
  step3: {
    promptEn: 'Test the proposed trial run (Time = 240 s) on the Virtual Robot Track to observe the outcome:',
    promptVi: 'Chạy thử phương án đề xuất (Thời gian = 240 giây) trên Virtual Robot Track để quan sát kết quả:',
    defaultSpeed: 4,
    defaultTime: 240, // 240 seconds standardized trial run
    canEditSpeed: false,
    canEditTime: false,
    noteEn: 'Watch the track ruler carefully: observe where the robot stops and compare it with the 1200m destination marker.',
    noteVi: 'Quan sát kỹ thước đo đường chạy: xem rô-bốt dừng lại ở mốc nào và đối chiếu với vạch đích 1200 m.'
=======
    promptEn: 'Examine the proposed plan and calculate the projected distance:',
    promptVi: 'Xem xét phương án đề xuất và tính quãng đường dự kiến:',
    proposedNoteEn: '📋 Proposed Plan: Speed = 6 m/s, Time = 3 s.',
    proposedNoteVi: '📋 Phương án đề xuất: Vận tốc = 6 m/s, Thời gian = 3 s.',
    formulaOptions: [
      { id: 'f1', text: 'Distance = Speed × Time  (s = 6 × 3 = 18 m)', formula: 's = v × t', correct: true },
      { id: 'f2', text: 'Distance = Speed ÷ Time  (s = 6 ÷ 3 = 2 m)', formula: 's = v ÷ t', correct: false }
    ],
    calcPromptEn: 'Enter the distance the robot will travel according to this plan:',
    calcPromptVi: 'Nhập quãng đường robot sẽ đi theo phương án này:',
    expectedResult: 18,
    resultUnit: 'm'
  },

  // Step 3: Execute
  step3: {
    promptEn: 'Run the robot using the proposed plan (Time = 3s) to observe the outcome:',
    promptVi: 'Khởi động robot theo phương án đề xuất (3 giây) để quan sát kết quả thực tế:',
    defaultSpeed: 6,
    defaultTime: 3,
    canEditSpeed: false,
    canEditTime: false,
    noteEn: 'Watch the track carefully: observe the exact position where the robot stops.'
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  },

  // Step 4: Look Back
  step4: {
<<<<<<< HEAD
    checkQuestionEn: 'Did the robot reach the 1200m destination on this run?',
    checkQuestionVi: 'Kết quả có đạt mục tiêu (đích 1200 m) không?',

    // Neutral observation questions after run
    observationQuestionEn: 'What do you observe on the track?',
    observationQuestionVi: 'Em nhận thấy điều gì trên đường chạy?',
    discrepancyQuestionEn: 'What do you observe on the track?',
    discrepancyQuestionVi: 'Em nhận thấy điều gì trên đường chạy?',
    discrepancyOptions: [
      { id: 'shortfall_960m', label: 'The robot stopped at 960m (before the 1200m marker)', correct: true },
      { id: 'overshot_1200m', label: 'The robot traveled beyond the 1200m marker', correct: false },
      { id: 'stopped_start', label: 'The robot stopped at the start line', correct: false }
    ],

    reasonQuestionEn: 'Why do you think this happened?',
    reasonQuestionVi: 'Theo em, tại sao điều này xảy ra?',
    diagnosisQuestionEn: 'Why do you think this happened?',
    diagnosisQuestionVi: 'Theo em, tại sao điều này xảy ra?',
    diagnosisOptions: [
      { id: 'ran_240s_only', label: 'At 4 m/s for only 240s, the robot travels 4 × 240 = 960m (short of 1200m)', correct: true },
      { id: 'target_moved', label: 'The target destination moved further away', correct: false },
      { id: 'speed_slowed', label: 'The robot stopped because the battery drained', correct: false }
    ],

    adjustmentQuestionEn: 'What would you like to adjust?',
    adjustmentQuestionVi: 'Em muốn thay đổi điều gì?',
    revisionPromptEn: 'Enter the adjusted Time parameter for the robot (in seconds):',
    revisionPromptVi: 'Nhập giá trị Thời gian đã điều chỉnh cho rô-bốt (đơn vị: giây):',
    correctedTimeExpected: 300,

    reflectionPromptEn: 'How did adjusting the time parameter from 240s to 300s (5 minutes) allow the robot to reach the 1200m destination?',
    reflectionPromptVi: 'Việc điều chỉnh thời gian từ 240 giây lên 300 giây (5 phút) đã giúp rô-bốt đi đến đúng đích 1200 m như thế nào?',

    getMathProof: (inputs, isVi) => {
      const v = inputs.step3?.speed !== undefined ? inputs.step3.speed : 4;
      const t = inputs.step3?.time !== undefined ? inputs.step3.time : 300;
      const s = Number((v * t).toFixed(1));
      return `<strong>s = v × t</strong> = ${v} m/s × ${t} s = <strong>${s} m = 1,2 km</strong> &nbsp; (300 s = 5 phút)`;
    }
=======
    checkQuestionEn: 'Did the robot reach the 24m destination marker on this attempt?',
    checkQuestionVi: 'Robot có đến được mốc đích 24m trong lần chạy này không?',
    
    discrepancyQuestionEn: 'Compare the robot stopping position with the 24m target:',
    discrepancyQuestionVi: 'So sánh vị trí robot dừng lại với mốc đích 24m:',
    discrepancyOptions: [
      { id: 'shortfall_6m', label: 'The robot stopped at 18m (before the 24m target marker)', correct: true },
      { id: 'overshot', label: 'The robot ran past 24m', correct: false },
      { id: 'too_fast', label: 'The robot stopped at the start line', correct: false }
    ],

    diagnosisQuestionEn: 'How should the running time be adjusted so the robot reaches 24m?',
    diagnosisQuestionVi: 'Cần điều chỉnh thời gian chạy như thế nào để robot đi đến đúng 24m?',
    diagnosisOptions: [
      { id: 'increase_time', label: 'Calculate time needed: t = 24 ÷ 6 = 4 seconds', correct: true },
      { id: 'decrease_time', label: 'Decrease time to 2 seconds', correct: false },
      { id: 'change_distance', label: 'Keep time at 3 seconds', correct: false }
    ],

    revisionPromptEn: 'Enter the adjusted Time parameter for the robot:',
    revisionPromptVi: 'Nhập giá trị Thời gian đã điều chỉnh cho robot:',
    correctedTimeExpected: 4
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  },

  // Tiered Hints
  hints: [
    {
      level: 1,
<<<<<<< HEAD
      title: 'Đổi đơn vị và quan sát điểm dừng',
      en: '1.2 km = 1200 m. Look at the canvas ruler: The robot stopped at 960m. Did it reach the 1200m destination marker?',
      vi: '1,2 km = 1200 m. Nhìn vào thước đo đường chạy: Rô-bốt dừng ở mốc 960 m. Đã đến vạch đích 1200 m chưa?'
    },
    {
      level: 2,
      title: 'Khoảng cách còn thiếu',
      en: 'With speed = 4 m/s in 240 seconds, the robot travels: 4 × 240 = 960m. It is still 1200 - 960 = 240m short. How many seconds does it need for all 1200m?',
      vi: 'Với vận tốc 4 m/s trong 240 giây, rô-bốt đi được: 4 × 240 = 960 m. Còn thiếu 1200 - 960 = 240 m. Cần bao nhiêu giây để rô-bốt đi hết 1200 m?'
    },
    {
      level: 3,
      title: 'Thời gian chính xác và điều chỉnh',
      en: 'Time needed: t = 1200 ÷ 4 = 300 seconds = 5 minutes. Adjust the robot running time to 300 seconds to reach the 1200m goal!',
      vi: 'Thời gian cần thiết: t = 1200 ÷ 4 = 300 giây = 5 phút. Hãy điều chỉnh thời gian chạy thành 300 giây để rô-bốt đến đúng mốc 1200 m!'
=======
      title: 'Quan sát điểm dừng của robot',
      en: 'Look at the canvas ruler. Where did the robot stop? Did it reach the 24m flag?',
      vi: 'Nhìn vào thước đo trên đường chạy. Robot đã dừng lại ở vạch nào? Đã đến lá cờ 24m chưa?'
    },
    {
      level: 2,
      title: 'Mối quan hệ thời gian và quãng đường',
      en: 'The destination is 24 meters away and the robot speed is 6 m/s. How many seconds does it need to travel 24m?',
      vi: 'Đích đến cách 24 mét và vận tốc robot là 6 m/s. Cần bao nhiêu giây để robot đi hết quãng đường 24m?'
    },
    {
      level: 3,
      title: 'Công thức tính thời gian',
      en: 'Use Time = Distance ÷ Speed: 24 ÷ 6 = 4 seconds.',
      vi: 'Dùng công thức Thời gian = Quãng đường ÷ Vận tốc: 24 ÷ 6 = 4 giây.'
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
    }
  ]
};
