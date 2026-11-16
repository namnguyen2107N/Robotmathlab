/**
 * ROBOT MATH LAB - SCORING ENGINE
 * Hệ thống tính điểm sư phạm cho học sinh tiểu học giải toán chuyển động (Polya Process).
 * Thang điểm chuẩn: 1000 điểm / bài học.
 * 
 * QUY TẮC TÍNH ĐIỂM DỰA TRÊN THỜI GIAN VÀ TIẾN TRÌNH:
 * 1. Điểm hoàn thành cốt lõi (Base Completion): 500 điểm nếu hoàn thành đúng cả 4 bước Polya.
 * 2. Điểm thời gian / tốc độ (Duration Score): Tối đa 300 điểm, tính từ startedAt tới completedAt.
 *    - Mỗi bài có mốc thời gian chuẩn (Target Time T_target):
 *      + Bài 1 (Reach the Goal): 45 giây.
 *      + Bài 2 (The Unexpected Journey): 90 giây.
 *      + Bài 3 (The On-Time Challenge): 60 giây.
 *    - Nếu T <= T_target: Đạt 300 điểm tuyệt đối.
 *    - Nếu T > T_target: Mỗi 10 giây trễ hơn trừ 15 điểm (Sàn bảo hiểm: tối thiểu 50 điểm).
 * 3. Điểm chính xác / số lần thử (Accuracy Score): Tối đa 150 điểm (Lần 1: 150đ, Lần 2: 110đ, Lần 3: 70đ, >=4 lần: 30đ).
 * 4. Điểm tự lực (Self-Reliance Score): Tối đa 50 điểm (Khởi điểm 50đ, mỗi gợi ý -15đ, mỗi lần quay lại bước trước -10đ, sàn 0đ).
 * 
 * XẾP HẠNG SAO:
 * - >= 850 điểm: 3 Sao ⭐⭐⭐ (Xuất sắc)
 * - 650 - 849 điểm: 2 Sao ⭐⭐ (Khá giỏi)
 * - < 650 điểm: 1 Sao ⭐ (Hoàn thành)
 */
class ScoringEngine {
  constructor() {
    this.MAX_SCORE = 1000;
    this.TARGET_TIMES = {
      'task1-reach': 45,
      'task2-fix': 90,
      'task3-new': 60,
      default: 60
    };
  }

  /**
   * Lấy thời gian chuẩn theo từng bài toán (giây)
   * @param {string} taskId
   * @returns {number}
   */
  getTargetTime(taskId) {
    return this.TARGET_TIMES[taskId] || this.TARGET_TIMES.default;
  }

  /**
   * Tính điểm từ thông tin phiên giải toán
   * @param {Object} summary Thông tin tổng kết từ session (LogEngine)
   * @returns {Object} { totalScore, completionScore, timeBonus, accuracyBonus, selfRelianceBonus, stars, ... }
   */
  calculateScore(summary = {}) {
    const taskId = String(summary.taskId || '');
    const finalSuccess = Boolean(summary.finalSuccess);
    const totalTimeSeconds = Math.max(0, Number(summary.totalTimeSeconds) || 0);
    const totalAttempts = Math.max(1, Number(summary.totalAttempts) || 1);
    const backwardStepsCount = Math.max(0, Number(summary.backwardStepsCount) || 0);
    const hintsCount = Math.max(0, Number(summary.hintsCount || summary.mathHints?.length) || 0);

    const targetTimeSeconds = this.getTargetTime(taskId);

    if (!finalSuccess) {
      return {
        totalScore: 0,
        completionScore: 0,
        timeBonus: 0,
        accuracyBonus: 0,
        selfRelianceBonus: 0,
        stars: 0,
        totalTimeSeconds,
        targetTimeSeconds,
        feedback: 'Chưa hoàn thành bài toán. Hãy cố gắng thử lại nhé!',
        feedbackVi: 'Chưa hoàn thành bài toán. Hãy cố gắng thử lại nhé!',
        feedbackEn: 'Task not completed yet. Keep trying!'
      };
    }

    // 1. Điểm hoàn thành bài toán (500 điểm)
    const completionScore = 500;

    // 2. Điểm thời gian / tốc độ từ lúc bắt đầu tới lúc hoàn thành (Tối đa 300 điểm)
    let timeBonus = 300;
    if (totalTimeSeconds > targetTimeSeconds) {
      const overtime = totalTimeSeconds - targetTimeSeconds;
      const penalty = Math.floor(overtime / 10) * 15;
      timeBonus = Math.max(50, 300 - penalty);
    }

    // 3. Điểm độ chính xác / số lần thử (Tối đa 150 điểm)
    let accuracyBonus = 150;
    if (totalAttempts === 2) {
      accuracyBonus = 110;
    } else if (totalAttempts === 3) {
      accuracyBonus = 70;
    } else if (totalAttempts >= 4) {
      accuracyBonus = 30;
    }

    // 4. Điểm tự lực và tính độc lập (Tối đa 50 điểm)
    const selfReliancePenalty = (hintsCount * 15) + (backwardStepsCount * 10);
    const selfRelianceBonus = Math.max(0, 50 - selfReliancePenalty);

    // Tổng điểm (tối đa 1000)
    const totalScore = Math.min(this.MAX_SCORE, Math.round(completionScore + timeBonus + accuracyBonus + selfRelianceBonus));

    // Đánh giá số sao
    let stars = 1;
    if (totalScore >= 850) {
      stars = 3;
    } else if (totalScore >= 650) {
      stars = 2;
    }

    // Lời khen sư phạm
    let feedbackVi = 'Làm tốt lắm!';
    let feedbackEn = 'Well done!';
    if (stars === 3) {
      feedbackVi = 'Xuất sắc! Em là một nhà toán học nhí tài ba!';
      feedbackEn = 'Outstanding! You are a brilliant young mathematician!';
    } else if (stars === 2) {
      feedbackVi = 'Rất tốt! Cố gắng giải nhanh và chính xác hơn nữa nhé!';
      feedbackEn = 'Great job! Try to solve faster and more accurately next time!';
    } else {
      feedbackVi = 'Hoàn thành nhiệm vụ! Hãy luyện tập thêm để nâng cao tốc độ nhé!';
      feedbackEn = 'Mission conquered! Keep practicing to improve your speed!';
    }

    return {
      totalScore,
      completionScore,
      timeBonus,
      accuracyBonus,
      selfRelianceBonus,
      stars,
      totalTimeSeconds,
      targetTimeSeconds,
      feedback: feedbackVi,
      feedbackVi,
      feedbackEn
    };
  }
}

// Khởi tạo Singleton instance trên trình duyệt
if (typeof window !== 'undefined') {
  window.ScoringEngine = new ScoringEngine();
}

// Hỗ trợ ESM / Node cho Unit Tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoringEngine;
}
