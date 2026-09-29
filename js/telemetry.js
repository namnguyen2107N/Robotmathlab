/**
 * ROBOT MATH LAB - TELEMETRY & LEARNING ANALYTICS ENGINE
 * xAPI-inspired event logging designed for Pedagogical Research (NCKH)
 * Tracks Polya problem-solving competencies using standardized coding schemes.
 */

const Telemetry = {
  STORAGE_KEY: 'robot_math_telemetry_events',
  USER_KEY: 'robot_math_anonymous_user',
  
  // Current session & user state
  sessionId: null,
  anonymousId: null,
  activeLessonId: null,
  activeStep: null,
  stepStartTime: null,

  // Error Taxonomy for Problem Solving
  ERROR_TYPES: {
    CONCEPTUAL: 'ERR_CONCEPTUAL',           // Chọn sai công thức hoặc hiểu sai bản chất
    COMPUTATIONAL: 'ERR_COMPUTATIONAL',     // Đúng công thức nhưng tính sai số
    UNIT_CONFUSION: 'ERR_UNIT_CONFUSION',   // Nhầm lẫn đơn vị (m/s vs km/h, giây vs giờ)
    INPUT_OUT_OF_BOUNDS: 'ERR_OOB',         // Nhập giá trị âm hoặc vô lý
    PREMATURE_ACTION: 'ERR_PREMATURE'       // Bấm chạy khi chưa hoàn thành bước kế hoạch
  },

  // Event Categories
  EVENT_TYPES: {
    SESSION_START: 'SESSION_START',
    LESSON_START: 'LESSON_START',
    STEP_TRANSITION: 'STEP_TRANSITION',     // Chuyển bước trong Pólya
    BACKWARD_STEP: 'BACKWARD_STEP',         // Hành vi debug: Quay lại bước trước
    DATA_CLASSIFICATION: 'DATA_CLASSIFICATION', // Bước 1: Phân loại dữ kiện
    FORMULA_SELECTED: 'FORMULA_SELECTED',   // Bước 2: Chọn công thức
    SIMULATION_START: 'SIMULATION_START',   // Bước 3: Chạy mô phỏng
    SIMULATION_PAUSE: 'SIMULATION_PAUSE',
    SIMULATION_RESET: 'SIMULATION_RESET',
    TRIAL_ATTEMPT: 'TRIAL_ATTEMPT',         // Lần nộp/kiểm tra đáp án
    HINT_REQUESTED: 'HINT_REQUESTED',       // Xin gợi ý
    REFLECTION_ANSWER: 'REFLECTION_ANSWER', // Bước 4: Trả lời câu hỏi nhìn lại
    LESSON_COMPLETE: 'LESSON_COMPLETE',

    // === NEW: Prediction-Observe-Compare Cycle (Phục vụ NCKH) ===
    PREDICTION_SUBMITTED: 'PREDICTION_SUBMITTED',   // Dự đoán ban đầu trước mô phỏng
    PREDICTION_COMPARED: 'PREDICTION_COMPARED',     // So sánh dự đoán vs kết quả thực tế
    WHAT_IF_TESTED: 'WHAT_IF_TESTED',               // Bước 4: Thử kịch bản what-if
    SELF_ASSESSMENT: 'SELF_ASSESSMENT',              // Bước 4: Tự đánh giá mức tự tin
    UNIT_CHECK_ANSWER: 'UNIT_CHECK_ANSWER'           // Bước 4: Kiểm tra đơn vị đo
  },

  init() {
    this.anonymousId = this.getOrCreateAnonymousId();
    this.sessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    this.logEvent(null, this.EVENT_TYPES.SESSION_START, {
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: localStorage.getItem('robot_math_lang') || 'vi'
    });

    // Flush any buffered events before page unload to prevent data loss
    window.addEventListener('beforeunload', () => this._flushEvents());
  },

  getOrCreateAnonymousId() {
    let id = localStorage.getItem(this.USER_KEY);
    if (!id) {
      id = 'stu_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(this.USER_KEY, id);
    }
    return id;
  },

  setLesson(lessonId) {
    this.activeLessonId = lessonId;
    this.logEvent(null, this.EVENT_TYPES.LESSON_START, { lessonId });
  },

  startStep(stepNumber) {
    if (this.activeStep !== null && this.stepStartTime !== null) {
      const durationMs = Date.now() - this.stepStartTime;
      this.logEvent(this.activeStep, 'STEP_TIME_RECORD', { durationMs });
    }
    this.activeStep = stepNumber;
    this.stepStartTime = Date.now();
  },

  // Batch write buffer
  _eventBuffer: [],
  _flushTimer: null,
  _FLUSH_THRESHOLD: 5,
  _FLUSH_INTERVAL_MS: 3000,

  /**
   * Main logging method - formats event into standardized research statement
   * Uses batched writes to reduce localStorage I/O
   */
  logEvent(polyaStep, eventType, eventData = {}) {
    const timestamp = new Date().toISOString();
    const eventRecord = {
      sessionId: this.sessionId,
      studentId: this.anonymousId,
      timestamp,
      lessonId: this.activeLessonId,
      polyaStep: polyaStep || this.activeStep,
      eventType,
      data: eventData
    };

    // Add to buffer
    this._eventBuffer.push(eventRecord);

    // Flush if buffer reaches threshold
    if (this._eventBuffer.length >= this._FLUSH_THRESHOLD) {
      this._flushEvents();
    } else if (!this._flushTimer) {
      // Schedule a flush after interval
      this._flushTimer = setTimeout(() => this._flushEvents(), this._FLUSH_INTERVAL_MS);
    }

    // Dispatch event for any real-time UI dashboards
    window.dispatchEvent(new CustomEvent('telemetryLog', { detail: eventRecord }));
    return eventRecord;
  },

  /**
   * Flush buffered events to localStorage
   */
  _flushEvents() {
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }
    if (this._eventBuffer.length === 0) return;

    const allEvents = this.getAllEvents();
    allEvents.push(...this._eventBuffer);
    this._eventBuffer = [];

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allEvents));
    } catch (e) {
      console.warn('Storage quota exceeded, keeping latest 500 events', e);
      const trimmed = allEvents.slice(-500);
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
      } catch (e2) {
        console.error('Cannot write telemetry to localStorage', e2);
      }
    }
  },

  getAllEvents() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Export telemetry data as CSV formatted for SPSS/R/Excel analysis
   */
  exportCSV() {
    this._flushEvents(); // Ensure all buffered events are written
    const events = this.getAllEvents();
    if (!events.length) {
      alert('Chưa có dữ liệu ghi nhận nào / No telemetry data recorded yet.');
      return;
    }

    const headers = [
      'SessionID',
      'StudentID',
      'Timestamp',
      'LessonID',
      'PolyaStep',
      'EventType',
      'DataJSON'
    ];

    const rows = events.map(ev => [
      `"${ev.sessionId}"`,
      `"${ev.studentId}"`,
      `"${ev.timestamp}"`,
      `"${ev.lessonId || ''}"`,
      `"${ev.polyaStep || ''}"`,
      `"${ev.eventType}"`,
      `"${JSON.stringify(ev.data).replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `robot_math_telemetry_${this.anonymousId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export telemetry data as JSON
   */
  exportJSON() {
    this._flushEvents(); // Ensure all buffered events are written
    const events = this.getAllEvents();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `robot_math_telemetry_${this.anonymousId}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  clearData() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  /**
   * Computes problem-solving performance metrics
   */
  getAnalyticsSummary() {
    const events = this.getAllEvents();
    const summary = {
      totalEvents: events.length,
      lessonsAttempted: new Set(events.map(e => e.lessonId).filter(Boolean)).size,
      totalHintsUsed: events.filter(e => e.eventType === this.EVENT_TYPES.HINT_REQUESTED).length,
      totalTrials: events.filter(e => e.eventType === this.EVENT_TYPES.TRIAL_ATTEMPT).length,
      backwardStepsCount: events.filter(e => e.eventType === this.EVENT_TYPES.BACKWARD_STEP).length,
      correctTrials: events.filter(e => e.eventType === this.EVENT_TYPES.TRIAL_ATTEMPT && e.data && e.data.isCorrect).length,
      totalPredictions: events.filter(e => e.eventType === this.EVENT_TYPES.PREDICTION_SUBMITTED).length,
      totalWhatIfTested: events.filter(e => e.eventType === this.EVENT_TYPES.WHAT_IF_TESTED).length,
      totalSelfAssessments: events.filter(e => e.eventType === this.EVENT_TYPES.SELF_ASSESSMENT).length,
      totalUnitChecks: events.filter(e => e.eventType === this.EVENT_TYPES.UNIT_CHECK_ANSWER).length,
      errorsByType: {}
    };

    events.forEach(e => {
      if (e.data && e.data.errorType) {
        summary.errorsByType[e.data.errorType] = (summary.errorsByType[e.data.errorType] || 0) + 1;
      }
    });

    return summary;
  }
};

Telemetry.init();
window.Telemetry = Telemetry;
