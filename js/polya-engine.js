/**
 * ROBOT MATH LAB - POLYA PROBLEM SOLVING FINITE STATE MACHINE (FSM)
 * Controls pedagogical flow: Understand -> Plan -> Execute -> Review
 * Supports non-linear transitions (backtracking for reflection and debugging).
 */

class PolyaEngine {
  static STATES = {
    UNDERSTAND: 1,
    PLAN: 2,
    EXECUTE: 3,
    REVIEW: 4
  };

  constructor(lessonInstance) {
    this.lesson = lessonInstance;
    this.currentStep = PolyaEngine.STATES.UNDERSTAND;
    this.highestStepReached = PolyaEngine.STATES.UNDERSTAND;
    this.stepCompleted = {
      1: false,
      2: false,
      3: false,
      4: false
    };

    this.attemptsInCurrentStep = 0;
    this.listeners = [];
  }

  /**
   * Subscribe to state machine changes
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  notify(oldStep, newStep, actionType) {
    this.listeners.forEach(cb => cb({
      oldStep,
      newStep,
      actionType,
      engine: this
    }));
  }

  /**
   * Start or reset the engine
   */
  start() {
    this.currentStep = PolyaEngine.STATES.UNDERSTAND;
    this.highestStepReached = PolyaEngine.STATES.UNDERSTAND;
    this.stepCompleted = { 1: false, 2: false, 3: false, 4: false };
    Telemetry.startStep(this.currentStep);
    this.notify(null, this.currentStep, 'START');
  }

  /**
   * Advance to the next step if current step is validated
   */
  nextStep() {
    const oldStep = this.currentStep;
    if (this.currentStep < PolyaEngine.STATES.REVIEW) {
      this.currentStep++;
      if (this.currentStep > this.highestStepReached) {
        this.highestStepReached = this.currentStep;
      }
      this.attemptsInCurrentStep = 0;
      Telemetry.startStep(this.currentStep);
      Telemetry.logEvent(this.currentStep, Telemetry.EVENT_TYPES.STEP_TRANSITION, {
        fromStep: oldStep,
        toStep: this.currentStep
      });
      this.notify(oldStep, this.currentStep, 'NEXT');
      return true;
    }
    return false;
  }

  /**
   * Backtrack to a previous step (Metacognitive debugging behavior)
   */
  prevStep() {
    const oldStep = this.currentStep;
    if (this.currentStep > PolyaEngine.STATES.UNDERSTAND) {
      this.currentStep--;
      Telemetry.startStep(this.currentStep);
      Telemetry.logEvent(this.currentStep, Telemetry.EVENT_TYPES.BACKWARD_STEP, {
        fromStep: oldStep,
        toStep: this.currentStep,
        reason: 'USER_NAVIGATION'
      });
      this.notify(oldStep, this.currentStep, 'PREV');
      return true;
    }
    return false;
  }

  /**
   * Jump directly to an unlocked step
   */
  goToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= this.highestStepReached && stepNumber !== this.currentStep) {
      const oldStep = this.currentStep;
      const isBackward = stepNumber < oldStep;
      this.currentStep = stepNumber;
      Telemetry.startStep(this.currentStep);
      Telemetry.logEvent(this.currentStep, isBackward ? Telemetry.EVENT_TYPES.BACKWARD_STEP : Telemetry.EVENT_TYPES.STEP_TRANSITION, {
        fromStep: oldStep,
        toStep: stepNumber,
        reason: 'DIRECT_CLICK'
      });
      this.notify(oldStep, this.currentStep, isBackward ? 'PREV' : 'NEXT');
      return true;
    }
    return false;
  }

  /**
   * Mark a step as successfully completed
   */
  markStepComplete(stepNumber) {
    this.stepCompleted[stepNumber] = true;
    if (stepNumber < 4 && this.highestStepReached < stepNumber + 1) {
      this.highestStepReached = stepNumber + 1;
    }
    this.notify(this.currentStep, this.currentStep, 'STEP_COMPLETED');
  }

  isStepCompleted(stepNumber) {
    return !!this.stepCompleted[stepNumber];
  }
}

window.PolyaEngine = PolyaEngine;
