/**
 * ROBOT MATH LAB - POLYA PROBLEM SOLVING FINITE STATE MACHINE (FSM)
 * Controls pedagogical flow:
 * Step 1: Understand the Problem (PS1 - PS3)
 * Step 2: Devise a Plan (PS4 - PS5)
 * Step 3: Carry out the Plan / Execute (PS6 - PS7)
 * Step 4: Look Back & Debug (PS8 - PS11)
 *
 * Supports non-linear transitions & metacognitive backtracking.
 */

class PolyaEngine {
  static STATES = {
    UNDERSTAND: 1,
    PLAN: 2,
    EXECUTE: 3,
    REVIEW: 4,
    LOOK_BACK: 4
  };

  static STEP_NAMES = {
    1: 'Understand',
    2: 'Plan',
    3: 'Execute',
    4: 'Look Back'
  };

  constructor(taskInstance = null) {
    this.task = taskInstance;
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

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(oldStep, newStep, actionType) {
    this.listeners.forEach(cb => {
      try {
        cb({
          oldStep,
          newStep,
          actionType,
          engine: this
        });
      } catch (e) {
        console.error('PolyaEngine listener error:', e);
      }
    });
  }

  start() {
    this.currentStep = PolyaEngine.STATES.UNDERSTAND;
    this.highestStepReached = PolyaEngine.STATES.UNDERSTAND;
    this.stepCompleted = { 1: false, 2: false, 3: false, 4: false };

    if (window.LogEngine) {
      window.LogEngine.transitionStep(null, this.currentStep, 'START');
    }
    this.notify(null, this.currentStep, 'START');
  }

  nextStep() {
    const oldStep = this.currentStep;
    if (this.currentStep >= PolyaEngine.STATES.REVIEW) {
      return false;
    }

    if (!this.stepCompleted[this.currentStep]) {
      if (window.LogEngine) {
        window.LogEngine.logEvent('PREMATURE_NEXT_BLOCKED', 'Attempted to advance without finishing current step', {
          currentStep: this.currentStep
        });
      }
      return false;
    }

    this.currentStep++;
    if (this.currentStep > this.highestStepReached) {
      this.highestStepReached = this.currentStep;
    }
    this.attemptsInCurrentStep = 0;

    if (window.LogEngine) {
      window.LogEngine.transitionStep(oldStep, this.currentStep, 'NEXT');
    }
    this.notify(oldStep, this.currentStep, 'NEXT');
    return true;
  }

  prevStep() {
    const oldStep = this.currentStep;
    if (this.currentStep > PolyaEngine.STATES.UNDERSTAND) {
      this.currentStep--;
      if (window.LogEngine) {
        window.LogEngine.transitionStep(oldStep, this.currentStep, 'PREV_BUTTON');
      }
      this.notify(oldStep, this.currentStep, 'PREV');
      return true;
    }
    return false;
  }

  goToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= this.highestStepReached && stepNumber !== this.currentStep) {
      const oldStep = this.currentStep;
      this.currentStep = stepNumber;
      if (window.LogEngine) {
        window.LogEngine.transitionStep(oldStep, this.currentStep, 'STEP_CLICK');
      }
      this.notify(oldStep, this.currentStep, stepNumber < oldStep ? 'PREV' : 'NEXT');
      return true;
    }
    return false;
  }

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

  /**
   * Reset completion of later steps when student adjusts parameters during Look Back
   */
  allowRerun() {
    this.stepCompleted[3] = false;
    this.stepCompleted[4] = false;
  }
}

window.PolyaEngine = PolyaEngine;
