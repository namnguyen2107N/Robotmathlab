/**
 * ROBOT MATH LAB - RANKING CONTROLLER
 * Quản lý Bảng Xếp Hạng & Đua top học sinh giải toán.
 * Tương thích 100% UX/UI hiện tại, hỗ trợ thời gian thực và song ngữ.
 */
class RankingController {
  constructor(containerId = 'main-view') {
    this.containerId = containerId;
    this.currentCategory = 'global'; // 'global' | 'task1-reach' | 'task2-fix' | 'task3-new'
    this.leaderboardData = [];
    this.isLoading = false;
  }

  escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  async render(category = 'global') {
    this.currentCategory = category;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const isVi = window.I18N ? window.I18N.isVietnamese() : true;
    const account = window.FirebaseService?.account || window.RMLAuth?.account;
    const isTeacher = account?.role === 'teacher';

    // Render khung trước
    container.innerHTML = `
      <div class="ranking-container">
        
        <!-- Hero Stage Banner -->
        <div class="ranking-hero">
          <div class="ranking-hero-content">
            <span class="ranking-eyebrow">${isVi ? '🏆 BẢNG VINH DANH NHÀ TOÁN HỌC' : '🏆 MATH EXPLORERS HALL OF FAME'}</span>
            <h1 class="ranking-title">${isVi ? 'Bảng Xếp Hạng Robot Math' : 'Leaderboard & Rankings'}</h1>
            <p class="ranking-subtitle">
              ${isVi ? 'Cùng thi đua giải toán chuyển động và tích luỹ điểm số cao nhất cùng robot Sparky!' : 'Compete with friends, solve motion math challenges, and reach the top!'}
            </p>
          </div>

          <div class="ranking-nav-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="#hub" class="btn-return-start" id="btn-ranking-back-hub">
              ${isVi ? '🏠 Về Trang Chủ Học Sinh' : '🏠 Student Hub'}
            </a>
            ${isTeacher ? `
              <a href="#teacher" class="btn-return-start" id="btn-ranking-back-teacher" style="background: #3730a3; border-color: #312e81;">
                👨‍🏫 ${isVi ? 'Dashboard Giáo Viên' : 'Teacher Dashboard'}
              </a>
            ` : ''}
          </div>
        </div>

        <!-- Filter Category Tabs -->
        <div class="ranking-tabs-wrap" role="tablist">
          <button type="button" class="btn-rank-tab ${category === 'global' ? 'active' : ''}" data-cat="global">
            🌟 ${isVi ? 'Tổng Điểm' : 'Overall'}
          </button>
          <button type="button" class="btn-rank-tab ${category === 'task1-reach' ? 'active' : ''}" data-cat="task1-reach">
            🎯 ${isVi ? 'Bài 1: Đến Đích' : 'Task 1: Reach'}
          </button>
          <button type="button" class="btn-rank-tab ${category === 'task2-fix' ? 'active' : ''}" data-cat="task2-fix">
            🔧 ${isVi ? 'Bài 2: Bất Ngờ' : 'Task 2: Fix'}
          </button>
          <button type="button" class="btn-rank-tab ${category === 'task3-new' ? 'active' : ''}" data-cat="task3-new">
            ⏱️ ${isVi ? 'Bài 3: Đúng Giờ' : 'Task 3: On-Time'}
          </button>
        </div>

        <!-- Dynamic Content: Podium Top 3 & Table -->
        <div id="ranking-dynamic-body">
          <div class="ranking-empty">⏳ ${isVi ? 'Đang tải bảng xếp hạng...' : 'Loading leaderboard...'}</div>
        </div>

      </div>
    `;

    // Gắn sự kiện chuyển tab
    container.querySelectorAll('.btn-rank-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.SoundFX) window.SoundFX.playPop();
        const cat = btn.dataset.cat;
        this.render(cat);
      });
    });

    // Tải dữ liệu từ FirebaseService
    await this.loadDataAndRenderBody();
  }

  async loadDataAndRenderBody() {
    const bodyEl = document.getElementById('ranking-dynamic-body');
    if (!bodyEl) return;

    const isVi = window.I18N ? window.I18N.isVietnamese() : true;
    const currentUid = window.FirebaseService?.account?.uid || window.RMLAuth?.account?.uid;

    try {
      if (window.FirebaseService) {
        this.leaderboardData = await window.FirebaseService.loadLeaderboard(this.currentCategory);
      } else {
        this.leaderboardData = [];
      }
    } catch (e) {
      console.warn('Load leaderboard error:', e);
      this.leaderboardData = [];
    }

    if (!this.leaderboardData || this.leaderboardData.length === 0) {
      bodyEl.innerHTML = `
        <div class="ranking-list-card">
          <div class="ranking-empty">
            🏁 ${isVi ? 'Chưa có dữ liệu xếp hạng cho bài này. Hãy là người đầu tiên hoàn thành thử thách!' : 'No rankings yet. Be the first to conquer this mission!'}
          </div>
        </div>
      `;
      return;
    }

    const top1 = this.leaderboardData[0] || null;
    const top2 = this.leaderboardData[1] || null;
    const top3 = this.leaderboardData[2] || null;
    const remaining = this.leaderboardData.slice(3);

    const isGlobal = this.currentCategory === 'global';

    const getScoreDisplay = (item) => {
      if (!item) return '0';
      return isGlobal ? `${item.totalScore || 0} pts` : `${item.score || 0} pts`;
    };

    const getAvatar = (idx) => {
      const avatars = ['🐱', '🦊', '🐶', '🐰', '🐼', '🐯', '🐻', '🦁', '🦄', '🐨'];
      return avatars[idx % avatars.length];
    };

    // Render Podium Top 3
    let podiumHtml = `
      <div class="ranking-podium-section">
    `;

    // 2nd Place (Silver)
    if (top2) {
      podiumHtml += `
        <div class="podium-card podium-silver">
          <div class="podium-rank-badge">🥈</div>
          <div class="podium-avatar">${getAvatar(1)}</div>
          <div class="podium-name">${this.escapeHtml(top2.displayName || 'Bé')}</div>
          <div class="podium-score-pill">⭐ ${getScoreDisplay(top2)}</div>
        </div>
      `;
    }

    // 1st Place (Gold)
    if (top1) {
      podiumHtml += `
        <div class="podium-card podium-gold">
          <div class="podium-rank-badge">🥇</div>
          <div class="podium-avatar">${getAvatar(0)}</div>
          <div class="podium-name">${this.escapeHtml(top1.displayName || 'Bé')}</div>
          <div class="podium-score-pill">👑 ${getScoreDisplay(top1)}</div>
        </div>
      `;
    }

    // 3rd Place (Bronze)
    if (top3) {
      podiumHtml += `
        <div class="podium-card podium-bronze">
          <div class="podium-rank-badge">🥉</div>
          <div class="podium-avatar">${getAvatar(2)}</div>
          <div class="podium-name">${this.escapeHtml(top3.displayName || 'Bé')}</div>
          <div class="podium-score-pill">⭐ ${getScoreDisplay(top3)}</div>
        </div>
      `;
    }

    podiumHtml += `</div>`;

    // Render Full List (hạng 4 trở đi)
    let listHtml = '';
    if (remaining.length > 0) {
      listHtml = `
        <div class="ranking-list-card" style="margin-top: 1.5rem;">
          <div class="ranking-list-header">
            <span># ${isVi ? 'Hạng & Học Sinh' : 'Rank & Student'}</span>
            <span>${isVi ? 'Điểm Đạt Được' : 'Score'}</span>
          </div>
          <div class="ranking-items-wrap">
      `;

      remaining.forEach((item, index) => {
        const rankNum = index + 4;
        const isCurrent = currentUid && (item.uid === currentUid);
        listHtml += `
          <div class="ranking-row ${isCurrent ? 'current-user-row' : ''}">
            <div class="ranking-row-left">
              <span class="ranking-pos-badge">${rankNum}</span>
              <div class="ranking-student-info">
                <span class="ranking-row-avatar">${getAvatar(rankNum - 1)}</span>
                <span class="ranking-row-name">
                  ${this.escapeHtml(item.displayName || 'Học sinh')}
                  ${isCurrent ? `<span class="ranking-row-you-tag">${isVi ? 'Bạn' : 'You'}</span>` : ''}
                </span>
              </div>
            </div>
            <div class="ranking-row-score">
              ⭐ ${getScoreDisplay(item)}
            </div>
          </div>
        `;
      });

      listHtml += `
          </div>
        </div>
      `;
    }

    bodyEl.innerHTML = podiumHtml + listHtml;
  }
}

// Khởi tạo Singleton
window.RankingController = new RankingController();
