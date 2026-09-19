/**
 * ROBOT MATH LAB - CHATBOT ASSISTANT ("Sparky Bot")
 * Admin-manageable Q&A knowledge base with fuzzy matching.
 * Teachers/Researchers can add, edit, delete Q&A pairs via the Admin panel.
 * Students see a floating chat widget for instant help.
 */

const Chatbot = {
  STORAGE_KEY: 'rml_chatbot_qa',
  isOpen: false,
  messages: [],

  /**
   * Default Q&A knowledge base (seeded on first load)
   */
  DEFAULT_QA: [
    {
      id: 'qa_001',
      keywords: ['xin chào', 'hello', 'hi', 'chào', 'hey', 'alo'],
      question: 'Xin chào / Hello',
      answer_vi: 'Xin chào bạn! 🤖 Mình là Sparky - trợ lý robot thông minh của Robot Math Lab. Bạn cần mình giúp gì nào?',
      answer_en: 'Hello! 🤖 I\'m Sparky - your smart robot assistant at Robot Math Lab. How can I help you today?',
      category: 'general'
    },
    {
      id: 'qa_002',
      keywords: ['polya', 'pólya', '4 bước', 'bốn bước', '4 steps', 'problem solving', 'giải quyết vấn đề'],
      question: 'Quy trình 4 bước Pólya là gì?',
      answer_vi: '🧠 <strong>Quy trình Pólya gồm 4 bước:</strong><br><br>① <strong>Hiểu vấn đề</strong> – Đọc kĩ đề, tìm dữ kiện ĐÃ BIẾT và CẦN TÌM.<br>② <strong>Lập kế hoạch</strong> – Chọn công thức phù hợp (s = v × t, v = s ÷ t, t = s ÷ v).<br>③ <strong>Thực hiện</strong> – Tính toán và chạy mô phỏng robot kiểm tra.<br>④ <strong>Kiểm tra & Điều chỉnh</strong> – Xem lại kết quả, đánh giá tính hợp lý.<br><br>💡 <em>Bạn có thể quay lại bất kỳ bước nào nếu phát hiện sai sót nhé!</em>',
      answer_en: '🧠 <strong>Pólya\'s 4-Step Framework:</strong><br><br>① <strong>Understand</strong> – Read carefully, identify KNOWN and UNKNOWN data.<br>② <strong>Plan</strong> – Choose the right formula (s = v × t, v = s ÷ t, t = s ÷ v).<br>③ <strong>Execute</strong> – Calculate and run the robot simulation to verify.<br>④ <strong>Review & Adjust</strong> – Check results for reasonableness.<br><br>💡 <em>You can go back to any step if you spot a mistake!</em>',
      category: 'polya'
    },
    {
      id: 'qa_003',
      keywords: ['vận tốc', 'velocity', 'speed', 'tốc độ', 'nhanh', 'chậm'],
      question: 'Vận tốc là gì? Công thức tính vận tốc?',
      answer_vi: '🏎️ <strong>Vận tốc (v)</strong> cho biết mức độ nhanh hay chậm của chuyển động.<br><br>📐 <strong>Công thức:</strong> <code>v = s ÷ t</code><br><br>Trong đó:<br>• <strong>v</strong> = vận tốc (km/h hoặc m/s)<br>• <strong>s</strong> = quãng đường (km hoặc m)<br>• <strong>t</strong> = thời gian (giờ hoặc giây)<br><br>📝 <em>Ví dụ: Robot chạy 100m trong 5 giây → v = 100 ÷ 5 = 20 m/s</em>',
      answer_en: '🏎️ <strong>Velocity (v)</strong> tells us how fast or slow an object moves.<br><br>📐 <strong>Formula:</strong> <code>v = s ÷ t</code><br><br>Where:<br>• <strong>v</strong> = velocity (km/h or m/s)<br>• <strong>s</strong> = distance (km or m)<br>• <strong>t</strong> = time (hours or seconds)<br><br>📝 <em>Example: Robot runs 100m in 5 seconds → v = 100 ÷ 5 = 20 m/s</em>',
      category: 'motion'
    },
    {
      id: 'qa_004',
      keywords: ['quãng đường', 'distance', 'đường', 'đoạn đường', 'bao xa', 'dài'],
      question: 'Công thức tính quãng đường?',
      answer_vi: '📏 <strong>Quãng đường (s)</strong> là độ dài đoạn đường mà vật di chuyển được.<br><br>📐 <strong>Công thức:</strong> <code>s = v × t</code><br><br>• <strong>s</strong> = quãng đường<br>• <strong>v</strong> = vận tốc<br>• <strong>t</strong> = thời gian<br><br>📝 <em>Ví dụ: Robot chạy với vận tốc 15 m/s trong 4 giây → s = 15 × 4 = 60 m</em>',
      answer_en: '📏 <strong>Distance (s)</strong> is the length of the path traveled by an object.<br><br>📐 <strong>Formula:</strong> <code>s = v × t</code><br><br>• <strong>s</strong> = distance<br>• <strong>v</strong> = velocity<br>• <strong>t</strong> = time<br><br>📝 <em>Example: Robot runs at 15 m/s for 4 seconds → s = 15 × 4 = 60 m</em>',
      category: 'motion'
    },
    {
      id: 'qa_005',
      keywords: ['thời gian', 'time', 'bao lâu', 'mất bao lâu', 'giờ', 'phút', 'giây'],
      question: 'Công thức tính thời gian?',
      answer_vi: '⏱️ <strong>Thời gian (t)</strong> là khoảng thời gian vật di chuyển.<br><br>📐 <strong>Công thức:</strong> <code>t = s ÷ v</code><br><br>• <strong>t</strong> = thời gian<br>• <strong>s</strong> = quãng đường<br>• <strong>v</strong> = vận tốc<br><br>📝 <em>Ví dụ: Quãng đường 200m, vận tốc 25 m/s → t = 200 ÷ 25 = 8 giây</em>',
      answer_en: '⏱️ <strong>Time (t)</strong> is the duration of movement.<br><br>📐 <strong>Formula:</strong> <code>t = s ÷ v</code><br><br>• <strong>t</strong> = time<br>• <strong>s</strong> = distance<br>• <strong>v</strong> = velocity<br><br>📝 <em>Example: Distance 200m, velocity 25 m/s → t = 200 ÷ 25 = 8 seconds</em>',
      category: 'motion'
    },
    {
      id: 'qa_006',
      keywords: ['tam giác', 'triangle', 'công thức', 'formula', 'liên hệ', 'mẹo', 'tip'],
      question: 'Tam giác công thức (s, v, t) là gì?',
      answer_vi: '📐 <strong>Tam giác công thức</strong> là cách nhớ nhanh mối quan hệ giữa 3 đại lượng:<br><br><pre style="text-align:center; font-size: 1.1em; background: #EEF2FF; padding: 1rem; border-radius: 8px;">     [ s ]<br>   -------<br>  [ v ] × [ t ]</pre><br>• Che <strong>s</strong> → còn lại <strong>v × t</strong> → <code>s = v × t</code><br>• Che <strong>v</strong> → còn lại <strong>s ÷ t</strong> → <code>v = s ÷ t</code><br>• Che <strong>t</strong> → còn lại <strong>s ÷ v</strong> → <code>t = s ÷ v</code><br><br>💡 <em>Cứ che đại lượng cần tìm, phần còn lại chính là công thức!</em>',
      answer_en: '📐 <strong>Formula Triangle</strong> is a quick way to remember the relationships:<br><br><pre style="text-align:center; font-size: 1.1em; background: #EEF2FF; padding: 1rem; border-radius: 8px;">     [ s ]<br>   -------<br>  [ v ] × [ t ]</pre><br>• Cover <strong>s</strong> → <code>s = v × t</code><br>• Cover <strong>v</strong> → <code>v = s ÷ t</code><br>• Cover <strong>t</strong> → <code>t = s ÷ v</code><br><br>💡 <em>Cover the unknown, and the remaining symbols give you the formula!</em>',
      category: 'motion'
    },
    {
      id: 'qa_007',
      keywords: ['chuyển động đều', 'uniform motion', 'đều', 'không đổi'],
      question: 'Chuyển động đều là gì?',
      answer_vi: '🚗 <strong>Chuyển động đều</strong> là chuyển động mà vận tốc <strong>không thay đổi</strong> theo thời gian.<br><br>Đặc điểm:<br>• Quãng đường tỷ lệ thuận với thời gian<br>• Đồ thị s-t là đường thẳng<br>• Robot đi cùng một đoạn đường trong mỗi giây<br><br>📝 <em>Trong Robot Math Lab, tất cả bài tập mô phỏng chuyển động đều để giúp bạn nắm vững nền tảng!</em>',
      answer_en: '🚗 <strong>Uniform motion</strong> is movement with <strong>constant velocity</strong> over time.<br><br>Features:<br>• Distance is directly proportional to time<br>• The s-t graph is a straight line<br>• Robot covers the same distance every second<br><br>📝 <em>In Robot Math Lab, all exercises simulate uniform motion to help you master the fundamentals!</em>',
      category: 'motion'
    },
    {
      id: 'qa_008',
      keywords: ['gặp nhau', 'ngược chiều', 'hai robot', 'two robots', 'meet', 'opposite'],
      question: 'Hai robot chạy ngược chiều gặp nhau?',
      answer_vi: '🤝 Khi <strong>hai robot chạy ngược chiều</strong> trên cùng một đường thẳng:<br><br>📐 <strong>Công thức:</strong><br>• Thời gian gặp nhau: <code>t = s ÷ (v₁ + v₂)</code><br>• Vị trí gặp: <code>Điểm gặp = v₁ × t</code> (tính từ robot 1)<br><br>Trong đó:<br>• <strong>s</strong> = khoảng cách ban đầu giữa 2 robot<br>• <strong>v₁, v₂</strong> = vận tốc của robot 1 và robot 2<br><br>💡 <em>Tổng vận tốc (v₁ + v₂) chính là tốc độ "tiến gần" giữa hai robot!</em>',
      answer_en: '🤝 When <strong>two robots move toward each other</strong> on the same track:<br><br>📐 <strong>Formula:</strong><br>• Meeting time: <code>t = s ÷ (v₁ + v₂)</code><br>• Meeting point: <code>Position = v₁ × t</code> (from robot 1)<br><br>Where:<br>• <strong>s</strong> = initial distance between them<br>• <strong>v₁, v₂</strong> = velocities of robot 1 and 2<br><br>💡 <em>The combined speed (v₁ + v₂) is how fast they approach each other!</em>',
      category: 'motion'
    },
    {
      id: 'qa_009',
      keywords: ['bài 1', 'lesson 1', 'bài học 1', 'đua', 'race'],
      question: 'Bài 1 học gì?',
      answer_vi: '🏁 <strong>Bài 1: Robot Chạy Đua</strong><br><br>Bạn sẽ học khái niệm <strong>vận tốc</strong> bằng cách quan sát cuộc đua giữa 2 robot trên đường đua 100m.<br><br>Nhiệm vụ: Tính vận tốc mỗi robot dựa trên quãng đường và thời gian quan sát được.<br><br>👉 <a href="#lesson/motion-1" style="color: #4F46E5; font-weight: 900;">Vào bài 1 ngay!</a>',
      answer_en: '🏁 <strong>Lesson 1: Robot Race</strong><br><br>Learn the concept of <strong>velocity</strong> by watching 2 robots race on a 100m track.<br><br>Task: Calculate each robot\'s velocity based on the observed distance and time.<br><br>👉 <a href="#lesson/motion-1" style="color: #4F46E5; font-weight: 900;">Start Lesson 1!</a>',
      category: 'lesson'
    },
    {
      id: 'qa_010',
      keywords: ['bài 2', 'lesson 2', 'bài học 2', 'giao hàng', 'delivery'],
      question: 'Bài 2 học gì?',
      answer_vi: '📦 <strong>Bài 2: Robot Giao Hàng</strong><br><br>Bạn sẽ tính <strong>quãng đường</strong> mà robot cần đi để giao kiện hàng, khi biết vận tốc và thời gian.<br><br>Công thức áp dụng: <code>s = v × t</code><br><br>👉 <a href="#lesson/motion-2" style="color: #4F46E5; font-weight: 900;">Vào bài 2 ngay!</a>',
      answer_en: '📦 <strong>Lesson 2: Delivery Robot</strong><br><br>Calculate the <strong>distance</strong> a robot needs to travel for delivery, given velocity and time.<br><br>Formula: <code>s = v × t</code><br><br>👉 <a href="#lesson/motion-2" style="color: #4F46E5; font-weight: 900;">Start Lesson 2!</a>',
      category: 'lesson'
    },
    {
      id: 'qa_011',
      keywords: ['bài 3', 'lesson 3', 'bài học 3', 'cứu hộ', 'rescue'],
      question: 'Bài 3 học gì?',
      answer_vi: '🚑 <strong>Bài 3: Robot Cứu Hộ</strong><br><br>Tính <strong>thời gian</strong> robot cứu hộ cần để đến vị trí sự cố, khi biết quãng đường và vận tốc.<br><br>Công thức áp dụng: <code>t = s ÷ v</code><br><br>👉 <a href="#lesson/motion-3" style="color: #4F46E5; font-weight: 900;">Vào bài 3 ngay!</a>',
      answer_en: '🚑 <strong>Lesson 3: Rescue Robot</strong><br><br>Calculate the <strong>time</strong> a rescue robot needs to reach the incident, given distance and velocity.<br><br>Formula: <code>t = s ÷ v</code><br><br>👉 <a href="#lesson/motion-3" style="color: #4F46E5; font-weight: 900;">Start Lesson 3!</a>',
      category: 'lesson'
    },
    {
      id: 'qa_012',
      keywords: ['đăng nhập', 'login', 'tài khoản', 'account', 'đổi', 'switch'],
      question: 'Làm sao để đăng nhập / đổi tài khoản?',
      answer_vi: '👤 Bấm vào <strong>ảnh đại diện</strong> ở góc trên bên phải để:<br><br>• Chọn tài khoản học sinh có sẵn<br>• Tạo tài khoản mới với robot yêu thích<br>• Đăng nhập bằng Tên hoặc Mã học sinh<br><br>💡 <em>Tài khoản giúp lưu lại tiến trình và sao thưởng của bạn!</em>',
      answer_en: '👤 Click on your <strong>profile avatar</strong> at the top right corner to:<br><br>• Select an existing student account<br>• Create a new account with your favorite robot<br>• Login by Name or Student ID<br><br>💡 <em>Your account saves your progress and reward stars!</em>',
      category: 'general'
    },
    {
      id: 'qa_013',
      keywords: ['sao', 'star', 'stars', 'thưởng', 'reward', 'điểm', 'point'],
      question: 'Làm sao để nhận sao thưởng?',
      answer_vi: '⭐ Bạn nhận <strong>sao thưởng</strong> khi:<br><br>• Hoàn thành mỗi bước Pólya: <strong>+5 sao</strong><br>• Giải đúng bài toán: <strong>+15 sao</strong><br>• Hoàn thành cả 4 bước mà không dùng gợi ý: <strong>+25 sao bonus</strong><br><br>🏆 Tích lũy đủ sao để lên cấp và mở khóa huy hiệu mới!',
      answer_en: '⭐ You earn <strong>reward stars</strong> when:<br><br>• Completing each Polya step: <strong>+5 stars</strong><br>• Solving problems correctly: <strong>+15 stars</strong><br>• Completing all 4 steps without hints: <strong>+25 bonus stars</strong><br><br>🏆 Collect enough stars to level up and unlock new badges!',
      category: 'general'
    },
    {
      id: 'qa_014',
      keywords: ['cảm ơn', 'thanks', 'thank you', 'thank', 'cám ơn', 'ok', 'okay', 'được rồi'],
      question: 'Cảm ơn / Thanks',
      answer_vi: 'Không có gì! 😊 Sparky luôn sẵn sàng giúp bạn. Chúc bạn học vui và đạt nhiều sao thưởng nhé! ⭐🚀',
      answer_en: 'You\'re welcome! 😊 Sparky is always here to help. Have fun learning and earn lots of stars! ⭐🚀',
      category: 'general'
    },
    {
      id: 'qa_015',
      keywords: ['ngôn ngữ', 'language', 'tiếng anh', 'english', 'tiếng việt', 'vietnamese', 'chuyển'],
      question: 'Làm sao đổi ngôn ngữ?',
      answer_vi: '🌍 Bấm vào nút <strong>VI / EN</strong> ở thanh trên cùng để chuyển đổi giữa Tiếng Việt và Tiếng Anh.<br><br>Giao diện sẽ tự động cập nhật ngay lập tức!',
      answer_en: '🌍 Click the <strong>VI / EN</strong> button on the top bar to switch between Vietnamese and English.<br><br>The interface will update automatically!',
      category: 'general'
    }
  ],

  /**
   * Initialize Chatbot
   */
  init() {
    this.loadQA();
    this.setupChatUI();
  },

  /**
   * Load Q&A from localStorage or seed defaults
   */
  loadQA() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.qaList = JSON.parse(stored);
      } catch (e) {
        this.qaList = [...this.DEFAULT_QA];
        this.saveQA();
      }
    } else {
      this.qaList = [...this.DEFAULT_QA];
      this.saveQA();
    }
  },

  saveQA() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.qaList));
  },

  getQA() {
    return this.qaList || [];
  },

  /**
   * Add a new Q&A pair (Admin only)
   */
  addQA({ question, keywords, answer_vi, answer_en, category }) {
    const newQA = {
      id: 'qa_' + Date.now(),
      keywords: keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k),
      question: question.trim(),
      answer_vi: answer_vi.trim(),
      answer_en: (answer_en || answer_vi).trim(),
      category: category || 'custom'
    };
    this.qaList.push(newQA);
    this.saveQA();
    return newQA;
  },

  /**
   * Update an existing Q&A pair
   */
  updateQA(id, updates) {
    const idx = this.qaList.findIndex(q => q.id === id);
    if (idx === -1) return null;

    if (updates.keywords && typeof updates.keywords === 'string') {
      updates.keywords = updates.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    }

    this.qaList[idx] = { ...this.qaList[idx], ...updates };
    this.saveQA();
    return this.qaList[idx];
  },

  /**
   * Delete a Q&A pair
   */
  deleteQA(id) {
    this.qaList = this.qaList.filter(q => q.id !== id);
    this.saveQA();
  },

  /**
   * Reset Q&A to defaults
   */
  resetToDefaults() {
    this.qaList = [...this.DEFAULT_QA];
    this.saveQA();
  },

  /**
   * Fuzzy match user input to Q&A knowledge base
   */
  findAnswer(userMessage) {
    const input = userMessage.toLowerCase().trim();
    if (!input) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const qa of this.qaList) {
      let score = 0;

      // Check keywords
      for (const keyword of qa.keywords) {
        if (input.includes(keyword)) {
          score += keyword.length * 2; // Longer keyword matches weighted higher
        }
        // Partial match bonus
        const words = keyword.split(' ');
        for (const word of words) {
          if (word.length > 2 && input.includes(word)) {
            score += word.length;
          }
        }
      }

      // Direct question substring match
      if (input.includes(qa.question.toLowerCase())) {
        score += 20;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    }

    // Minimum threshold for a match
    if (bestScore >= 3) {
      return bestMatch;
    }

    return null;
  },

  /**
   * Process user message and generate response
   */
  getResponse(userMessage) {
    const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'vi';
    const match = this.findAnswer(userMessage);

    if (match) {
      return {
        text: lang === 'vi' ? match.answer_vi : match.answer_en,
        matched: true,
        qaId: match.id
      };
    }

    // Default fallback response
    const fallback_vi = '🤔 Mình chưa hiểu câu hỏi của bạn. Bạn có thể thử hỏi về:<br><br>' +
      '• <strong>Công thức vận tốc, quãng đường, thời gian</strong><br>' +
      '• <strong>Quy trình 4 bước Pólya</strong><br>' +
      '• <strong>Nội dung các bài học</strong><br>' +
      '• <strong>Cách đăng nhập / đổi tài khoản</strong><br><br>' +
      '💡 <em>Hoặc hãy nhờ Thầy/Cô giáo thêm nội dung mới vào cho Sparky nhé!</em>';

    const fallback_en = '🤔 I didn\'t quite understand your question. Try asking about:<br><br>' +
      '• <strong>Velocity, distance, time formulas</strong><br>' +
      '• <strong>Pólya\'s 4-step framework</strong><br>' +
      '• <strong>Lesson content</strong><br>' +
      '• <strong>How to login / switch accounts</strong><br><br>' +
      '💡 <em>Or ask your teacher to add more content for Sparky!</em>';

    return {
      text: lang === 'vi' ? fallback_vi : fallback_en,
      matched: false,
      qaId: null
    };
  },

  /**
   * Setup the chat UI widget
   */
  setupChatUI() {
    const chatWidget = document.getElementById('chatbot-widget');
    const chatToggle = document.getElementById('chatbot-toggle-btn');
    const chatClose = document.getElementById('chatbot-close-btn');
    const chatInput = document.getElementById('chatbot-input');
    const chatSend = document.getElementById('chatbot-send-btn');
    const chatMessages = document.getElementById('chatbot-messages');
    const chatQuickBtns = document.getElementById('chatbot-quick-btns');

    if (!chatWidget || !chatToggle) return;

    // Toggle open/close
    chatToggle.addEventListener('click', () => {
      SoundFX.playPop();
      this.isOpen = !this.isOpen;
      chatWidget.classList.toggle('open', this.isOpen);
      chatToggle.classList.toggle('active', this.isOpen);

      if (this.isOpen && this.messages.length === 0) {
        // Send welcome message
        this.addBotMessage(this.getWelcomeMessage());
      }

      if (this.isOpen && chatInput) {
        setTimeout(() => chatInput.focus(), 300);
      }
    });

    // Close button
    if (chatClose) {
      chatClose.addEventListener('click', () => {
        SoundFX.playPop();
        this.isOpen = false;
        chatWidget.classList.remove('open');
        chatToggle.classList.remove('active');
      });
    }

    // Send message
    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      chatInput.value = '';
      this.addUserMessage(text);

      // Simulate typing delay
      this.showTypingIndicator();
      setTimeout(() => {
        this.hideTypingIndicator();
        const response = this.getResponse(text);
        this.addBotMessage(response.text);
      }, 600 + Math.random() * 800);
    };

    if (chatSend) {
      chatSend.addEventListener('click', sendMessage);
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    // Quick suggestion buttons
    if (chatQuickBtns) {
      chatQuickBtns.addEventListener('click', (e) => {
        const btn = e.target.closest('.chatbot-quick-btn');
        if (!btn) return;
        SoundFX.playPop();
        const query = btn.dataset.query;
        chatInput.value = query;
        sendMessage();
      });
    }
  },

  getWelcomeMessage() {
    const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'vi';
    if (lang === 'vi') {
      return 'Xin chào! 🤖 Mình là <strong>Sparky</strong> - trợ lý thông minh của Robot Math Lab!<br><br>Bạn có thể hỏi mình về:<br>• Công thức Toán (v, s, t)<br>• Quy trình Pólya 4 bước<br>• Nội dung bài học<br><br>Hãy gõ câu hỏi hoặc bấm gợi ý bên dưới nhé! 👇';
    }
    return 'Hello! 🤖 I\'m <strong>Sparky</strong> - Robot Math Lab\'s smart assistant!<br><br>You can ask me about:<br>• Math formulas (v, s, t)<br>• Pólya\'s 4-step framework<br>• Lesson content<br><br>Type a question or tap a suggestion below! 👇';
  },

  addUserMessage(text) {
    this.messages.push({ role: 'user', text, time: new Date() });
    this.renderMessage('user', text);
  },

  addBotMessage(html) {
    this.messages.push({ role: 'bot', text: html, time: new Date() });
    this.renderMessage('bot', html);
  },

  renderMessage(role, content) {
    const container = document.getElementById('chatbot-messages');
    if (!container) return;

    const user = (typeof DB !== 'undefined') ? DB.getCurrentUser() : null;
    const avatar = (typeof DB !== 'undefined' && user) ? DB.getAvatar(user.avatarId) : null;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-msg chatbot-msg-${role}`;

    if (role === 'bot') {
      msgDiv.innerHTML = `
        <div class="chatbot-msg-avatar bot-avatar">🤖</div>
        <div class="chatbot-msg-bubble bot-bubble">${content}</div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="chatbot-msg-bubble user-bubble">${this.escapeHtml(content)}</div>
        <div class="chatbot-msg-avatar user-avatar">${avatar ? avatar.emoji : '👤'}</div>
      `;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  },

  showTypingIndicator() {
    const container = document.getElementById('chatbot-messages');
    if (!container) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-msg chatbot-msg-bot chatbot-typing-indicator';
    typingDiv.innerHTML = `
      <div class="chatbot-msg-avatar bot-avatar">🤖</div>
      <div class="chatbot-msg-bubble bot-bubble">
        <div class="typing-dots">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  },

  hideTypingIndicator() {
    const indicator = document.querySelector('.chatbot-typing-indicator');
    if (indicator) indicator.remove();
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Render Admin Q&A Management Panel (called from App.renderResearch)
   */
  renderAdminPanel() {
    const lang = (typeof I18n !== 'undefined') ? I18n.currentLang : 'vi';
    const qaList = this.getQA();

    const categoryLabels = {
      general: '💬 Chung',
      polya: '🧠 Pólya',
      motion: '🏎️ Chuyển động',
      lesson: '📚 Bài học',
      custom: '✏️ Tùy chỉnh'
    };

    return `
      <div class="card" style="margin-bottom: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <h3 style="font-size: 1.6rem;">🤖 Quản Lý Chatbot Sparky (${qaList.length} câu hỏi)</h3>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" id="btn-add-qa" onclick="SoundFX.playPop()">
              ➕ Thêm Q&A Mới
            </button>
            <button class="btn btn-secondary" id="btn-reset-qa" onclick="SoundFX.playPop()" style="color: var(--danger);">
              🔄 Reset Mặc Định
            </button>
          </div>
        </div>

        <!-- Add/Edit Q&A Form (hidden by default) -->
        <div id="qa-form-container" style="display: none; background: var(--bg-surface); border: 2px solid var(--primary); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 1rem; color: var(--primary);" id="qa-form-title">➕ Thêm Câu Hỏi & Trả Lời Mới</h4>
          <input type="hidden" id="qa-edit-id" value="">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label class="input-label">Câu hỏi mẫu:</label>
              <input type="text" class="math-input" id="qa-input-question" placeholder="VD: Robot là gì?" style="max-width: 100%; text-align: left; font-size: 1rem;">
            </div>
            <div>
              <label class="input-label">Từ khóa (cách nhau bởi dấu phẩy):</label>
              <input type="text" class="math-input" id="qa-input-keywords" placeholder="VD: robot, là gì, what is" style="max-width: 100%; text-align: left; font-size: 1rem;">
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label class="input-label">Câu trả lời (Tiếng Việt) - Hỗ trợ HTML:</label>
            <textarea class="math-input" id="qa-input-answer-vi" rows="4" placeholder="VD: Robot là máy tự động có thể thực hiện các công việc theo lập trình." style="max-width: 100%; text-align: left; font-size: 1rem; resize: vertical;"></textarea>
          </div>

          <div style="margin-bottom: 1rem;">
            <label class="input-label">Câu trả lời (English) - Optional:</label>
            <textarea class="math-input" id="qa-input-answer-en" rows="3" placeholder="VD: A robot is an automated machine..." style="max-width: 100%; text-align: left; font-size: 1rem; resize: vertical;"></textarea>
          </div>

          <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
            <div>
              <label class="input-label">Danh mục:</label>
              <select class="math-input" id="qa-input-category" style="font-size: 1rem;">
                <option value="custom">✏️ Tùy chỉnh</option>
                <option value="general">💬 Chung</option>
                <option value="polya">🧠 Pólya</option>
                <option value="motion">🏎️ Chuyển động</option>
                <option value="lesson">📚 Bài học</option>
              </select>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 0.75rem;">
              <button class="btn btn-success" id="btn-save-qa">💾 Lưu</button>
              <button class="btn btn-secondary" id="btn-cancel-qa">Hủy</button>
            </div>
          </div>
        </div>

        <!-- Q&A List Table -->
        <div style="max-height: 500px; overflow-y: auto; border: 2px solid var(--border-color); border-radius: var(--radius-md);">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; text-align: left;">
            <thead style="background: var(--bg-surface); position: sticky; top: 0; z-index: 2;">
              <tr>
                <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color); width: 60px;">#</th>
                <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Câu hỏi</th>
                <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color);">Từ khóa</th>
                <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color); width: 110px;">Danh mục</th>
                <th style="padding: 0.85rem; border-bottom: 2px solid var(--border-color); width: 140px;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${qaList.map((qa, idx) => `
                <tr style="border-bottom: 1px solid var(--border-color);" data-qa-row="${qa.id}">
                  <td style="padding: 0.75rem; font-weight: 800; color: var(--text-muted);">${idx + 1}</td>
                  <td style="padding: 0.75rem; font-weight: 800;">${qa.question}</td>
                  <td style="padding: 0.75rem; font-family: monospace; font-size: 0.85rem; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${qa.keywords.join(', ')}
                  </td>
                  <td style="padding: 0.75rem;">
                    <span class="badge badge-gray" style="font-size: 0.8rem;">${categoryLabels[qa.category] || qa.category}</span>
                  </td>
                  <td style="padding: 0.75rem;">
                    <div style="display: flex; gap: 0.5rem;">
                      <button class="btn btn-sm btn-outline-primary btn-edit-qa" data-qa-id="${qa.id}" title="Sửa">✏️</button>
                      <button class="btn btn-sm btn-secondary btn-delete-qa" data-qa-id="${qa.id}" title="Xóa" style="color: var(--danger);">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Bind admin panel event listeners (called after DOM is rendered)
   */
  bindAdminEvents(container) {
    const btnAdd = container.querySelector('#btn-add-qa');
    const btnReset = container.querySelector('#btn-reset-qa');
    const formContainer = container.querySelector('#qa-form-container');
    const btnSave = container.querySelector('#btn-save-qa');
    const btnCancel = container.querySelector('#btn-cancel-qa');

    if (!formContainer) return;

    // Show Add form
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        formContainer.style.display = 'block';
        container.querySelector('#qa-form-title').textContent = '➕ Thêm Câu Hỏi & Trả Lời Mới';
        container.querySelector('#qa-edit-id').value = '';
        container.querySelector('#qa-input-question').value = '';
        container.querySelector('#qa-input-keywords').value = '';
        container.querySelector('#qa-input-answer-vi').value = '';
        container.querySelector('#qa-input-answer-en').value = '';
        container.querySelector('#qa-input-category').value = 'custom';
        container.querySelector('#qa-input-question').focus();
      });
    }

    // Cancel
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        formContainer.style.display = 'none';
      });
    }

    // Save
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const editId = container.querySelector('#qa-edit-id').value;
        const question = container.querySelector('#qa-input-question').value.trim();
        const keywords = container.querySelector('#qa-input-keywords').value.trim();
        const answer_vi = container.querySelector('#qa-input-answer-vi').value.trim();
        const answer_en = container.querySelector('#qa-input-answer-en').value.trim();
        const category = container.querySelector('#qa-input-category').value;

        if (!question || !keywords || !answer_vi) {
          alert('Vui lòng điền đầy đủ: Câu hỏi, Từ khóa và Câu trả lời (Tiếng Việt)!');
          return;
        }

        if (editId) {
          this.updateQA(editId, { question, keywords, answer_vi, answer_en: answer_en || answer_vi, category });
          SoundFX.playTing();
        } else {
          this.addQA({ question, keywords, answer_vi, answer_en: answer_en || answer_vi, category });
          SoundFX.playVictory();
        }

        // Re-render admin panel
        formContainer.style.display = 'none';
        this.refreshAdminTable(container);
      });
    }

    // Reset to defaults
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn reset toàn bộ Q&A về mặc định? Các câu tùy chỉnh sẽ bị xóa.')) {
          this.resetToDefaults();
          SoundFX.playPop();
          this.refreshAdminTable(container);
        }
      });
    }

    // Edit buttons
    container.querySelectorAll('.btn-edit-qa').forEach(btn => {
      btn.addEventListener('click', () => {
        const qaId = btn.dataset.qaId;
        const qa = this.qaList.find(q => q.id === qaId);
        if (!qa) return;

        SoundFX.playPop();
        formContainer.style.display = 'block';
        container.querySelector('#qa-form-title').textContent = '✏️ Chỉnh Sửa Câu Hỏi';
        container.querySelector('#qa-edit-id').value = qa.id;
        container.querySelector('#qa-input-question').value = qa.question;
        container.querySelector('#qa-input-keywords').value = qa.keywords.join(', ');
        container.querySelector('#qa-input-answer-vi').value = qa.answer_vi;
        container.querySelector('#qa-input-answer-en').value = qa.answer_en || '';
        container.querySelector('#qa-input-category').value = qa.category;
        container.querySelector('#qa-input-question').focus();
      });
    });

    // Delete buttons
    container.querySelectorAll('.btn-delete-qa').forEach(btn => {
      btn.addEventListener('click', () => {
        const qaId = btn.dataset.qaId;
        if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
          this.deleteQA(qaId);
          SoundFX.playPop();
          this.refreshAdminTable(container);
        }
      });
    });
  },

  /**
   * Refresh the admin Q&A table after add/edit/delete
   */
  refreshAdminTable(container) {
    const chatbotSection = container.querySelector('#chatbot-admin-section');
    if (chatbotSection) {
      chatbotSection.innerHTML = this.renderAdminPanel();
      this.bindAdminEvents(container);
    }
  }
};

window.Chatbot = Chatbot;
