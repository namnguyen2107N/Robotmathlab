/**
 * TASK 2: TEST THE PLAN (Nhiệm vụ 2: Kiểm tra phương án)
 * Neutral situational scenario: test a proposed plan, observe robot movement on the track, and verify.
 */

window.Task2Fix = {
  id: 'task2-fix',
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
    ]
  },

  // Step 2: Plan
  step2: {
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
  },

  // Step 4: Look Back
  step4: {
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
  },

  // Tiered Hints
  hints: [
    {
      level: 1,
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
    }
  ]
};
