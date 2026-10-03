/**
 * ROBOT MATH LAB - LOG ENGINE
 * Specialized pedagogical process logger for elementary STEM & Polya problem solving.
 * Formats data according to the PS1-PS11 problem-solving process codes.
 * Stores events in localStorage for research analysis and enables JSON export.
 */

class LogEngine {
  constructor() {
    this.currentSession = null;
    this.storageKey = 'rml_research_logs_v2';
    this.listeners = [];
  }

  /**
   * Subscribe to log events (e.g. for UI event counters)
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event) {
    this.listeners.forEach(cb => {
      try { cb(event, this.currentSession); } catch (e) { console.error('Log listener error:', e); }
    });
  }

  /**
   * Start a new tracking session for a student and task
   */
  startSession(studentName = 'Student', taskId = 'task1', taskTitle = 'Task') {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.currentSession = {
      sessionId,
      studentName: studentName.trim() || 'Anonymous Student',
      taskId,
      taskTitle,
      startedAt: new Date().toISOString(),
      completedAt: null,
      events: [],
      supportUsage: {
        vocabLookups: [],
        mathHints: []
      },
      stepTimings: {
        1: { enteredAt: Date.now(), totalTimeMs: 0 },
        2: { enteredAt: null, totalTimeMs: 0 },
        3: { enteredAt: null, totalTimeMs: 0 },
        4: { enteredAt: null, totalTimeMs: 0 }
      },
      currentStep: 1,
      summary: {
        totalAttempts: 0,
        totalTimeSeconds: 0,
        finalSuccess: false,
        backwardStepsCount: 0
      }
    };

    this.saveSession();
    this.notify({ type: 'SESSION_STARTED', sessionId });
    return this.currentSession;
  }

  /**
   * Track transition between Polya steps and accumulate active duration
   */
  transitionStep(fromStep, toStep, reason = 'NORMAL') {
    if (!this.currentSession) return;
    const now = Date.now();

    // Accumulate time spent in fromStep
    if (fromStep && this.currentSession.stepTimings[fromStep]?.enteredAt) {
      const duration = now - this.currentSession.stepTimings[fromStep].enteredAt;
      this.currentSession.stepTimings[fromStep].totalTimeMs += duration;
      this.currentSession.stepTimings[fromStep].enteredAt = null;
    }

    // Set enter time for toStep
    if (toStep && this.currentSession.stepTimings[toStep]) {
      this.currentSession.stepTimings[toStep].enteredAt = now;
      this.currentSession.currentStep = toStep;
    }

    if (fromStep && toStep && toStep < fromStep) {
      this.currentSession.summary.backwardStepsCount++;
    }

    this.logEvent('STEP_TRANSITION', `Transition from Step ${fromStep} to Step ${toStep}`, {
      fromStep,
      toStep,
      reason
    });
  }

  /**
   * Core logging function for PS1-PS11 and auxiliary events
   * @param {string} code PS1 to PS11 or system event code
   * @param {string} label Descriptive event label
   * @param {object} data Event payload
   */
  logEvent(code, label, data = {}) {
    if (!this.currentSession) {
      console.warn('LogEngine: No active session. Creating fallback session.');
      this.startSession('Student', 'general', 'General Session');
    }

    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      code,
      label,
      step: this.currentSession.currentStep,
      data: JSON.parse(JSON.stringify(data)),
      timestamp: new Date().toISOString(),
      relativeTimeMs: Date.now() - new Date(this.currentSession.startedAt).getTime()
    };

    this.currentSession.events.push(event);

    // Update specific summary metrics
    if (code === 'PS7' || code === 'PS11') {
      this.currentSession.summary.totalAttempts++;
      if (data.success || data.meetsRequirement) {
        this.currentSession.summary.finalSuccess = true;
      }
    }

    this.saveSession();
    this.notify(event);
    return event;
  }

  /**
   * Log vocabulary lookup (Support usage)
   */
  logVocabLookup(word, data = {}) {
    if (!this.currentSession) return;
    const item = {
      word,
      vi: data.vi || '',
      step: this.currentSession.currentStep,
      timestamp: new Date().toISOString()
    };
    this.currentSession.supportUsage.vocabLookups.push(item);
    this.logEvent('VOCAB_LOOKUP', `Looked up vocabulary: "${word}"`, item);
  }

  /**
   * Log tiered hint request (Support usage)
   */
  logMathHint(level, hintData = {}) {
    if (!this.currentSession) return;
    const item = {
      level,
      step: this.currentSession.currentStep,
      hintTitle: hintData.title || `Level ${level} Hint`,
      timestamp: new Date().toISOString()
    };
    this.currentSession.supportUsage.mathHints.push(item);
    this.logEvent('HINT_REQUESTED', `Requested Tier ${level} Math Hint`, item);
  }

  /**
   * Complete current task session
   */
  completeSession(finalSuccess = true) {
    if (!this.currentSession) return;
    const now = Date.now();

    // Close timing for active step
    const currentStep = this.currentSession.currentStep;
    if (currentStep && this.currentSession.stepTimings[currentStep]?.enteredAt) {
      const duration = now - this.currentSession.stepTimings[currentStep].enteredAt;
      this.currentSession.stepTimings[currentStep].totalTimeMs += duration;
      this.currentSession.stepTimings[currentStep].enteredAt = null;
    }

    this.currentSession.completedAt = new Date().toISOString();
    this.currentSession.summary.finalSuccess = finalSuccess;
    this.currentSession.summary.totalTimeSeconds = Math.round(
      (now - new Date(this.currentSession.startedAt).getTime()) / 1000
    );

    this.saveSession();
    this.notify({ type: 'SESSION_COMPLETED', session: this.currentSession });
    return this.currentSession;
  }

  /**
   * Save current session into localStorage history
   */
  saveSession() {
    if (!this.currentSession) return;
    try {
      const allSessions = this.getAllSessions();
      const existingIdx = allSessions.findIndex(s => s.sessionId === this.currentSession.sessionId);
      if (existingIdx >= 0) {
        allSessions[existingIdx] = this.currentSession;
      } else {
        allSessions.push(this.currentSession);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(allSessions));
    } catch (e) {
      console.error('Failed to save log session to localStorage:', e);
    }
  }

  /**
   * Get all saved sessions from localStorage
   */
  getAllSessions() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error reading saved sessions:', e);
      return [];
    }
  }

  /**
   * Clear all sessions from storage
   */
  clearAllSessions() {
    localStorage.removeItem(this.storageKey);
    this.currentSession = null;
    this.notify({ type: 'SESSIONS_CLEARED' });
  }

  /**
   * Export all sessions or current session as formatted JSON file
   */
  exportJSON(onlyCurrent = false) {
    const dataToExport = onlyCurrent && this.currentSession 
      ? this.currentSession 
      : {
          exportedAt: new Date().toISOString(),
          system: 'Robot Math Lab - Process Telemetry',
          version: '2.0',
          totalSessions: this.getAllSessions().length,
          sessions: this.getAllSessions()
        };

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const filename = `robot_math_lab_logs_${onlyCurrent ? (this.currentSession?.sessionId || 'single') : 'all'}_${Date.now()}.json`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

// Global singleton instance
window.LogEngine = new LogEngine();

// Backward compatibility shim for legacy calls
window.Telemetry = {
  EVENT_TYPES: {
    STEP_TRANSITION: 'STEP_TRANSITION',
    BACKWARD_STEP: 'BACKWARD_STEP',
    SIMULATION_START: 'SIMULATION_START',
    SIMULATION_PAUSE: 'SIMULATION_PAUSE',
    SIMULATION_RESET: 'SIMULATION_RESET'
  },
  startStep: (step) => {},
  logEvent: (step, type, data = {}) => {
    if (window.LogEngine && window.LogEngine.currentSession) {
      window.LogEngine.logEvent(type, `Telemetry: ${type}`, data);
    }
  }
};
