/**
 * ROBOT MATH LAB - INTERNATIONALIZATION (I18N) ENGINE
 * Manages UI language switching (English / Tiếng Việt).
 * 
 * Rules:
 * 1. Default UI language is English ('en') on first launch.
 * 2. Switching language updates all interface controls, buttons, headers, steppers, and feedback.
 * 3. The mathematical problem statement itself ALWAYS remains in English (with interactive bilingual vocab popovers).
 *    A toggle button allows students to view the Vietnamese translation when needed.
 */

(function () {
  const STORAGE_KEY = 'rml_ui_language';
  let currentLang = 'en'; // Default to English as requested
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
      currentLang = localStorage.getItem(STORAGE_KEY);
    }
  } catch (_) { }

  const translations = {
    en: {
      // App Header
      brand_sub: 'KIDS FUN MATH & ROBOTICS LAB',
      student_tag_title: 'Active Student',
      student_default_name: 'Math Explorer',
      sound_btn: 'Sound',
      sound_muted: 'Muted',
      fullscreen_enter: 'Fullscreen',
      fullscreen_exit: 'Windowed',
      export_data: 'Export Data',
      lang_switch_title: 'Switch Interface Language',

      // Welcome Hero & Robot Signboard
      hero_eyebrow: 'PROBLEM SOLVING & VIRTUAL ROBOTICS',
      hero_title: 'Robot Math Lab',
      hero_subtitle: 'Virtual Robotics Math Learning Environment for Elementary Students.',
      signboard_badge: 'INTERACTIVE CONTROL BOARD',
      signboard_title: 'Choose Interface Language',
      signboard_subtitle: 'Select how you want buttons and tools displayed:',
      lang_en: '🇬🇧 English',
      lang_vi: '🇻🇳 Tiếng Việt',
      btn_start: 'Start 🚀',
      student_name_label: 'Student Name / ID:',
      student_name_placeholder: 'Enter your name...',
      robot_bubble_welcome: "Hi! I'm Sparky the Robot 🤖 Choose your language on my tablet and click Start to explore! ✨",
      robot_easter_egg: 'Yay! Let\'s learn Math and code robots together! 🚀',
      scroll_down_hint: 'Click Start to enter missions!',
      btn_enter_missions: 'Start Exploring Missions ➔',
      hub_greeting: "Welcome, Explorer! Let's choose your learning mission:",
      btn_back_to_start: '⚙️ Welcome & Language Screen',

      // Tasks Hub
      hub_section_title: 'Choose Your Mission',
      hub_section_desc: 'Each mission focuses on key problem-solving strategies in uniform motion mathematics.',

      // Task 1 Card
      task1_badge: '🎯 Task 1',
      task1_diff: 'Basic',
      task1_title: 'Reach the Goal',
      task1_sub: 'Single-variable movement planning',
      task1_desc: 'Calculate the time needed for a 6 m/s robot to travel 24 m. Experience the complete 4-step problem-solving cycle.',
      task1_btn: 'Start Mission 1 ➔',

      // Task 2 Card: Neutral name, zero error spoilers, no research labels
      task2_badge: '🔧 Task 2',
      task2_diff: 'Level 2',
      task2_title: 'Test the Plan',
      task2_sub: 'Testing a proposed motion plan',
      task2_desc: 'A classmate prepared a movement plan for 24m with speed 6 m/s and time 3s. Run the simulation, observe where the robot stops, and evaluate the result.',
      task2_btn: 'Start Mission 2 ➔',

      // Task 3 Card
      task3_badge: '🆕 Task 3',
      task3_diff: 'Level 3',
      task3_title: 'New Mission',
      task3_sub: 'Adapting to changed distance and speed',
      task3_desc: 'Apply problem-solving when conditions change: new distance 35 m and energy-saving speed 5 m/s.',
      task3_btn: 'Start Mission 3 ➔',

      // Workspace Common
      btn_back_hub: '← Missions Hub',
      btn_hint: '💡 Hint',
      btn_dict: '📖 Dictionary',
      btn_feedback: '📋 Feedback',
      confirm_leave_task: 'Are you sure you want to return to Missions Hub? Your progress has been logged.',

      // Stepper
      step_1_name: 'Understand',
      step_2_name: 'Plan',
      step_3_name: 'Execute',
      step_4_name: 'Look Back',

      // Problem Statement Card
      problem_card_title: 'Problem Statement',
      btn_trans_show: '🌐 Vietnamese Translation',
      btn_trans_hide: '🌐 Hide Translation',
      problem_hint_meta: '💡 Tip: Click or tap any underlined word to view pronunciation & Vietnamese translation.',

      // Simulation Card
      sim_track_title: 'Virtual Robot Track',
      sim_target_label: 'Target:',
      sim_speed_label: 'Speed (v)',
      sim_time_label: 'Time (t)',
      sim_dist_label: 'Distance (s)',
      sim_ready: 'Ready. Configure parameters on the left and run the robot!',
      sim_moving: 'Robot is moving at {speed} m/s for {time} seconds...',
      sim_stopped: 'Robot stopped after traveling {dist} m.',

      // Step 1: Understand
      s1_badge: 'Step 1: Understand',
      s1_title: 'Understand the Problem',
      s1_given_heading: 'Given Information in Problem:',
      s1_error_missing: 'Please enter all given quantities and choose the target to find!',
      s1_btn_next: 'Check Understanding & Next (Step 2 →)',

      // Step 2: Plan
      s2_badge: 'Step 2: Plan',
      s2_title: 'Devise a Plan',
      s2_error_missing: 'Please choose a formula and enter your calculation result!',
      s2_btn_back: '← Back to Step 1',
      s2_btn_next: 'Confirm Plan (Step 3 →)',

      // Step 3: Execute
      s3_badge: 'Step 3: Execute',
      s3_title: 'Execute the Plan on Robot',
      s3_speed_label: 'Robot Speed:',
      s3_speed_locked: '🔒 Fixed by problem',
      s3_time_label: 'Running Time:',
      s3_time_flawed_note: 'Proposed plan time for testing',
      s3_btn_back: '← Back to Step 2',
      s3_btn_run: '🚀 Run Robot',
      s3_btn_running: '⏳ Robot Running...',
      s3_btn_rerun: '🔁 Re-run Robot',
      s3_btn_next: 'Look Back & Verify (Step 4 →)',
      s3_obs_title: '📊 Simulation Observation:',
      s3_obs_traveled: 'The robot traveled <strong>{dist} m</strong> in {time} seconds.',
      s3_obs_target: 'Target destination: <strong>{target} m</strong>.',
      s3_val_error: 'Please enter a valid positive running time for the robot!',

      // Step 4: Look Back
      s4_badge: 'Step 4: Look Back',
      s4_title: 'Look Back & Verify',
      s4_banner_success: '🎉 Robot reached the destination!',
      s4_banner_retry: '⚠️ Robot did not land exactly on the target!',
      s4_btn_yes: '✅ Yes, reached {target}m exactly',
      s4_btn_no: '❌ No, did not reach {target}m',
      s4_btn_back: '← Back to Step 3',
      s4_math_proof_title: 'Mathematical Verification:',
      s4_refl_placeholder: 'Share your thoughts or strategies about this problem...',
      s4_btn_complete: '🎉 Complete Mission!',
      s4_btn_retry: '🔁 Test New Plan ➔',
      s4_testing_new: '⏳ Robot Testing New Plan...',
      s4_testing_status: 'Verifying with revised parameters: {speed} m/s × {time} s...',
      s4_success_status: '🎉 Awesome! The robot reached the exact target <strong>{target} m</strong>!',
      s4_input_error: 'Please enter a valid revised running time for the robot!',
      s4_obs_prompt: '👀 Look at where the robot stopped on the track on the right, then select your answer above.',
      s4_obs_accurate: 'Accurate Observation!',
      s4_obs_shortfall: 'The robot stopped before reaching the target. Let us analyze and adjust the plan:',
      s4_obs_recheck: 'Take another close look at the track ruler! The robot stopped at 18m, while the target flag is at 24m. Did the robot reach the destination marker?',

      // Mascot Sparky Cheer Messages
      sparky_step_1: "Read the problem carefully! Find what numbers are given! 🧐",
      sparky_step_2: "Choose the correct formula and calculate! You can do it! 📐",
      sparky_step_3: "Exciting! Check your parameters and click '🚀 Run Robot' to see it go! 🤖💨",
      sparky_step_4: "Check if the robot landed exactly on the target line! 🔍",
      sparky_victory: "Splendid! The robot hit the target! Click 'Step 4' to verify! 🏆✨",
      sparky_oops: "The robot stopped before the target marker! Click 'Step 4' to observe and analyze! 🔍",

      // Dictionary Modal
      dict_title: 'Math & Robotics Dictionary',
      dict_subtitle: 'English - Vietnamese terms with pronunciation audio',
      dict_search_placeholder: 'Type word to search (e.g. speed, distance)...',
      dict_count: 'Showing {count} words',
      dict_listen: 'Listen',

      // Hints Modal
      hints_title: 'Math Support Hints',
      hints_subtitle: 'Tiered scaffolding hints for mathematical problem solving',
      hints_intro: 'Try thinking on your own before unlocking each hint level! Every hint access is saved in the learning log.',
      hints_unlock_btn: '🔓 Unlock Level {level}',
      hints_level_prefix: 'Level {level}:'
    },

    vi: {
      // App Header
      brand_sub: 'BÉ VUI HỌC TOÁN & ROBOTICS',
      student_tag_title: 'Học sinh đang tham gia',
      student_default_name: 'Bé Yêu Toán',
      sound_btn: 'Âm thanh',
      sound_muted: 'Đã tắt tiếng',
      fullscreen_enter: 'Toàn màn hình',
      fullscreen_exit: 'Thu nhỏ',
      export_data: 'Xuất dữ liệu',
      lang_switch_title: 'Chuyển đổi ngôn ngữ giao diện',

      // Welcome Hero & Robot Signboard
      hero_eyebrow: 'TƯ DUY GIẢI QUYẾT VẤN ĐỀ & ROBOTICS ẢO',
      hero_title: 'Robot Math Lab',
      hero_subtitle: `Môi trường học tập Toán - Tiếng Anh qua mô phỏng Robotics dành cho học sinh tiểu học.`,
      signboard_badge: 'BẢNG ĐIỀU KHIỂN TƯƠNG TÁC',
      signboard_title: 'Chọn Ngôn Ngữ Giao Diện',
      signboard_subtitle: 'Chọn ngôn ngữ hiển thị cho các nút bấm và chức năng:',
      lang_en: '🇬🇧 English',
      lang_vi: '🇻🇳 Tiếng Việt',
      btn_start: 'Bắt đầu 🚀',
      student_name_label: 'Tên học sinh / Mã số:',
      student_name_placeholder: 'Nhập họ và tên...',
      robot_bubble_welcome: 'Xin chào bạn! Mình là robot Sparky 🤖 Hãy chọn ngôn ngữ trên bảng và bấm Bắt đầu nhé! ✨',
      robot_easter_egg: 'Tuyệt vời! Chúng mình cùng học Toán và lập trình robot nào! 🚀',
      scroll_down_hint: 'Bấm Bắt đầu để vào làm nhiệm vụ!',
      btn_enter_missions: 'Bắt đầu Khám phá Nhiệm vụ ➔',
      hub_greeting: 'Chào mừng bạn! Hãy chọn một nhiệm vụ học tập để bắt đầu:',
      btn_back_to_start: '⚙️ Màn hình Chào mừng & Cài đặt',

      // Tasks Hub
      hub_section_title: 'Chọn Nhiệm Vụ Học Tập',
      hub_section_desc: 'Mỗi nhiệm vụ tập trung vào các khía cạnh giải quyết vấn đề toán chuyển động đều.',

      // Task 1 Card
      task1_badge: '🎯 Nhiệm vụ 1',
      task1_diff: 'Cơ bản',
      task1_title: 'Reach the Goal',
      task1_sub: 'Đạt mục tiêu chuyển động',
      task1_desc: 'Tính toán thời gian cần thiết để robot vận tốc 6 m/s đến đích 24 m. Trải nghiệm trọn vẹn quy trình giải quyết vấn đề thực tế.',
      task1_btn: 'Bắt đầu Nhiệm vụ 1 ➔',

      // Task 2 Card: Tên trung tính tình huống, không báo trước lỗi, không nhãn nghiên cứu
      task2_badge: '🔧 Nhiệm vụ 2',
      task2_diff: 'Mức độ 2',
      task2_title: 'Kiểm tra phương án',
      task2_sub: 'Thử nghiệm phương án di chuyển',
      task2_desc: 'Một bạn học sinh lập phương án cho robot đi 24m với vận tốc 6 m/s trong 3 giây. Hãy chạy mô phỏng, quan sát điểm dừng của robot và đánh giá kết quả.',
      task2_btn: 'Bắt đầu Nhiệm vụ 2 ➔',

      // Task 3 Card
      task3_badge: '🆕 Nhiệm vụ 3',
      task3_diff: 'Mức độ 3',
      task3_title: 'Nhiệm vụ mới',
      task3_sub: 'Thử thách với quãng đường và vận tốc mới',
      task3_desc: 'Áp dụng quy trình giải quyết vấn đề khi điều kiện bài toán thay đổi: quãng đường mới 35 m và vận tốc tiết kiệm pin 5 m/s.',
      task3_btn: 'Bắt đầu Nhiệm vụ 3 ➔',

      // Workspace Common
      btn_back_hub: '← Danh sách Nhiệm vụ',
      btn_hint: '💡 Gợi ý',
      btn_dict: '📖 Từ điển',
      btn_feedback: '📋 Xem nhận xét',
      confirm_leave_task: 'Bạn có chắc muốn quay lại danh sách nhiệm vụ? Tiến trình hiện tại đã được lưu vào nhật ký.',

      // Stepper
      step_1_name: 'Tìm hiểu đề',
      step_2_name: 'Lập kế hoạch',
      step_3_name: 'Thực thi robot',
      step_4_name: 'Kiểm tra lại',

      // Problem Statement Card
      problem_card_title: 'Đề bài nhiệm vụ (Problem Statement)',
      btn_trans_show: '🌐 Xem dịch tiếng Việt',
      btn_trans_hide: '🌐 Ẩn bản dịch',
      problem_hint_meta: '💡 Gợi ý: Nhấp vào từ tiếng Anh có gạch chân để nghe phát âm & xem giải thích nghĩa tiếng Việt.',

      // Simulation Card
      sim_track_title: 'Đường chạy Robot Ảo',
      sim_target_label: 'Đích đến:',
      sim_speed_label: 'Vận tốc (v)',
      sim_time_label: 'Thời gian (t)',
      sim_dist_label: 'Quãng đường (s)',
      sim_ready: 'Sẵn sàng. Thiết lập thông số ở các bước bên trái rồi cho robot chạy!',
      sim_moving: 'Robot đang di chuyển với vận tốc {speed} m/s trong {time} giây...',
      sim_stopped: 'Robot đã dừng lại sau khi đi được {dist} m.',

      // Step 1: Understand
      s1_badge: 'Bước 1: Tìm hiểu',
      s1_title: 'Tìm hiểu Đề bài (Understand the Problem)',
      s1_given_heading: 'Xác định các dữ kiện đề bài đã cho:',
      s1_error_missing: 'Vui lòng điền đầy đủ các số liệu đã cho và chọn đại lượng cần tìm!',
      s1_btn_next: 'Kiểm tra & Tiếp tục (Bước 2 →)',

      // Step 2: Plan
      s2_badge: 'Bước 2: Kế hoạch',
      s2_title: 'Lập Kế hoạch Giải (Devise a Plan)',
      s2_error_missing: 'Vui lòng chọn công thức và điền kết quả tính toán!',
      s2_btn_back: '← Quay lại Bước 1',
      s2_btn_next: 'Xác nhận Kế hoạch (Bước 3 →)',

      // Step 3: Execute
      s3_badge: 'Bước 3: Thực thi',
      s3_title: 'Thực thi Kế hoạch trên Robot (Execute)',
      s3_speed_label: 'Vận tốc Robot:',
      s3_speed_locked: '🔒 Cố định theo bài toán',
      s3_time_label: 'Thời gian chạy:',
      s3_time_flawed_note: 'Thời gian theo phương án đề xuất',
      s3_btn_back: '← Quay lại Bước 2',
      s3_btn_run: '🚀 Chạy Robot',
      s3_btn_running: '⏳ Robot đang chạy...',
      s3_btn_rerun: '🔁 Chạy lại Robot',
      s3_btn_next: 'Kiểm tra & Đánh giá (Bước 4 →)',
      s3_obs_title: '📊 Kết quả quan sát mô phỏng:',
      s3_obs_traveled: 'Robot đã di chuyển được <strong>{dist} m</strong> trong {time} giây.',
      s3_obs_target: 'Vạch đích yêu cầu: <strong>{target} m</strong>.',
      s3_val_error: 'Vui lòng nhập giá trị hợp lệ cho Thời gian chạy!',

      // Step 4: Look Back
      s4_badge: 'Bước 4: Kiểm tra',
      s4_title: 'Kiểm tra & Đánh giá (Look Back & Verify)',
      s4_banner_success: '🎉 Robot đã đến đúng vạch đích!',
      s4_banner_retry: '⚠️ Robot chưa đến đúng vạch đích yêu cầu!',
      s4_btn_yes: '✅ Có, đến chính xác đích {target}m',
      s4_btn_no: '❌ Không, chưa đến đích {target}m',
      s4_btn_back: '← Quay lại Bước 3',
      s4_math_proof_title: 'Kiểm chứng Toán học (Mathematical Verification):',
      s4_refl_placeholder: 'Chia sẻ suy nghĩ hoặc bài học rút ra của bạn về bài toán này...',
      s4_btn_complete: '🎉 Hoàn thành Nhiệm vụ!',
      s4_btn_retry: '🔁 Thử nghiệm phương án mới ➔',
      s4_testing_new: '⏳ Robot đang thử nghiệm phương án mới...',
      s4_testing_status: 'Đang kiểm chứng với thông số mới: {speed} m/s × {time} s...',
      s4_success_status: '🎉 Tuyệt vời! Robot đã đến đúng mốc <strong>{target} m</strong>!',
      s4_input_error: 'Vui lòng nhập giá trị thời gian đã điều chỉnh cho robot!',
      s4_obs_prompt: '👀 Hãy quan sát vị trí dừng của robot trên đường chạy bên phải rồi chọn câu trả lời ở trên nhé!',
      s4_obs_accurate: 'Nhận định chính xác!',
      s4_obs_shortfall: 'Robot chưa đến vạch đích. Hãy cùng phân tích và điều chỉnh phương án:',
      s4_obs_recheck: 'Hãy quan sát kỹ lại thước đo trên đường chạy nhé! Robot dừng lại ở vạch 18m, còn lá cờ đích ở vạch 24m. Như vậy robot đã đến đúng đích chưa?',

      // Mascot Sparky Cheer Messages
      sparky_step_1: 'Hãy đọc kỹ đề bài và tìm xem bài toán cho những số liệu nào nhé! 🧐',
      sparky_step_2: 'Chọn công thức và tính toán thật chuẩn xác nào! Bạn làm được mà! 📐',
      sparky_step_3: "Hồi hộp quá! Hãy kiểm tra thông số rồi bấm '🚀 Chạy Robot' để xem nhé! 🤖💨",
      sparky_step_4: 'Kiểm tra lại xem robot có về đúng vạch đích không nhé! 🔍',
      sparky_victory: "Tuyệt đỉnh! Robot đã đi đúng đích rồi! Hãy bấm 'Bước 4' để kiểm tra lại nào! 🏆✨",
      sparky_oops: "Robot đã dừng trước vạch đích rồi! Bấm 'Bước 4' để chúng mình cùng quan sát và đánh giá nhé! 🔍",

      // Dictionary Modal
      dict_title: 'Từ điển Toán - Tiếng Anh Robotics',
      dict_subtitle: 'Kho từ vựng song ngữ kèm phát âm audio giọng chuẩn bản ngữ',
      dict_search_placeholder: 'Gõ từ tiếng Anh cần tra (ví dụ: speed, distance)...',
      dict_count: 'Đang hiển thị {count} từ vựng',
      dict_listen: 'Nghe phát âm',

      // Hints Modal
      hints_title: 'Gợi Ý Hỗ Trợ Tư Duy Toán Học',
      hints_subtitle: 'Hệ thống gợi ý giàn giáo theo từng mức độ nhận thức',
      hints_intro: 'Hãy cố gắng tự suy nghĩ trước khi mở từng mức gợi ý nhé! Mỗi lần mở gợi ý sẽ được ghi nhận vào nhật ký học tập.',
      hints_unlock_btn: '🔓 Mở Gợi Ý Mức {level}',
      hints_level_prefix: 'Mức {level}:'
    }
  };

  const I18N = {
    get currentLang() {
      return currentLang;
    },

    isVietnamese() {
      return currentLang === 'vi';
    },

    isEnglish() {
      return currentLang === 'en';
    },

    t(key, params = {}) {
      const dict = translations[currentLang] || translations.en;
      let str = dict[key] || translations.en[key] || key;
      if (typeof str === 'string') {
        Object.keys(params).forEach(k => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
        });
      }
      return str;
    },

    setLang(lang) {
      if (lang !== 'en' && lang !== 'vi') return;
      if (lang === currentLang) return;

      currentLang = lang;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, currentLang);
        }
      } catch (_) { }

      // Play cute click audio
      if (typeof window !== 'undefined' && window.SoundFX) {
        window.SoundFX.playPop();
      }

      // Notify entire app of language change
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
      }
    },

    toggleLang() {
      this.setLang(currentLang === 'en' ? 'vi' : 'en');
    }
  };

  if (typeof window !== 'undefined') {
    window.I18N = I18N;
  }
  if (typeof global !== 'undefined') {
    global.I18N = I18N;
  }
})();
