/**
 * ROBOT MATH LAB - TEACHER DASHBOARD CONTROLLER
 * Quản lý giao diện Bảng điều khiển dành riêng cho Thầy/Cô Giáo.
 * Theo dõi học sinh online/offline, tiến độ giải toán Polya, lịch sử bài làm và điểm số real-time.
 */
class TeacherDashboardController {
  constructor(containerId = 'main-view') {
    this.containerId = containerId;
    this.students = [];
    this.classroom = null;
    this.activeStudent = null;
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

  async render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const account = window.FirebaseService?.account || window.RMLAuth?.account;
    const isVi = window.I18N ? window.I18N.isVietnamese() : true;

    // Kiểm tra quyền giáo viên
    if (account && account.role !== 'teacher') {
      container.innerHTML = `
        <div class="teacher-dashboard-container">
          <div class="teacher-section-card" style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h2 style="font-family: 'Lexend'; margin-bottom: 0.5rem;">${isVi ? 'Khu vực dành cho Giáo Viên' : 'Teacher Access Only'}</h2>
            <p style="color: #64748b; margin-bottom: 1.5rem;">${isVi ? 'Tài khoản của bạn hiện là Học Sinh. Vui lòng đăng nhập bằng tài khoản Giáo Viên.' : 'Your account is currently a Student account.'}</p>
            <a href="#hub" class="btn-return-start">🏠 ${isVi ? 'Về Trang Chủ Học Sinh' : 'Go to Student Hub'}</a>
          </div>
        </div>
      `;
      return;
    }

    const classroomId = account?.classroomId || 'CLASS-2026';
    const teacherName = account?.display_name || (isVi ? 'Thầy/Cô Giáo' : 'Teacher');

    container.innerHTML = `
      <div class="teacher-dashboard-container">
        
        <!-- Teacher Hero Stage Banner -->
        <div class="teacher-hero">
          <div class="teacher-hero-content">
            <span class="teacher-eyebrow">${isVi ? '👨‍🏫 BẢNG ĐIỀU KHIỂN SƯ PHẠM' : '👨‍🏫 TEACHER PEDAGOGICAL DASHBOARD'}</span>
            <h1 class="teacher-title">${isVi ? `Chào mừng ${this.escapeHtml(teacherName)}!` : `Welcome, ${this.escapeHtml(teacherName)}!`}</h1>
            <p class="teacher-subtitle">
              ${isVi ? 'Theo dõi thời gian thực quá trình tư duy, giải toán chuyển động và điểm số của học sinh trong lớp.' : 'Monitor real-time student thinking processes, motion math problem-solving, and class performance.'}
            </p>
          </div>

          <div class="teacher-hero-actions">
            <div class="teacher-code-badge" title="${isVi ? 'Chia sẻ mã này cho học sinh khi đăng ký' : 'Share this code with your students'}">
              <span>${isVi ? 'Mã Lớp Học:' : 'Class Code:'}</span>
              <span class="teacher-code-val" id="teacher-class-code">${classroomId}</span>
              <button type="button" class="btn-copy-code" id="btn-copy-class-code">
                📋 ${isVi ? 'Sao chép' : 'Copy'}
              </button>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="#hub" class="btn-return-start" style="font-size: 0.95rem;">
                🎒 ${isVi ? 'Xem Giao Diện HS' : 'Student Hub'}
              </a>
              <a href="#ranking" class="btn-return-start" style="font-size: 0.95rem;">
                🏆 ${isVi ? 'Bảng Xếp Hạng' : 'Ranking'}
              </a>
            </div>
          </div>
        </div>

        <!-- 4-Card Quick Statistics Grid -->
        <div class="teacher-stats-grid" id="teacher-stats-grid">
          
          <div class="teacher-stat-card stat-card-online">
            <div class="stat-header">
              <span class="stat-label">${isVi ? 'Đang Hoạt Động' : 'Online Students'}</span>
              <span class="stat-icon">🟢</span>
            </div>
            <div class="stat-value" id="stat-online-count">0</div>
          </div>

          <div class="teacher-stat-card stat-card-total">
            <div class="stat-header">
              <span class="stat-label">${isVi ? 'Tổng Học Sinh' : 'Total Students'}</span>
              <span class="stat-icon">👥</span>
            </div>
            <div class="stat-value" id="stat-total-count">0</div>
          </div>

          <div class="teacher-stat-card stat-card-score">
            <div class="stat-header">
              <span class="stat-label">${isVi ? 'Điểm Trung Bình' : 'Class Avg Score'}</span>
              <span class="stat-icon">⭐</span>
            </div>
            <div class="stat-value" id="stat-avg-score">0</div>
          </div>

          <div class="teacher-stat-card stat-card-completed">
            <div class="stat-header">
              <span class="stat-label">${isVi ? 'Bài Đã Hoàn Thành' : 'Tasks Conquered'}</span>
              <span class="stat-icon">📝</span>
            </div>
            <div class="stat-value" id="stat-tasks-count">0</div>
          </div>

        </div>

        <!-- Student Roster & Activity Table Card -->
        <div class="teacher-section-card">
          <div class="teacher-section-title-wrap">
            <h2 class="teacher-section-title">
              <span>📋</span> ${isVi ? 'Danh Sách Học Sinh Trong Lớp' : 'Classroom Student Roster'}
            </h2>
            <button type="button" class="btn-return-start" id="btn-refresh-students" style="font-size: 0.9rem;">
              🔄 ${isVi ? 'Làm mới dữ liệu' : 'Refresh'}
            </button>
          </div>

          <div class="teacher-student-table-wrap">
            <table class="teacher-student-table">
              <thead>
                <tr>
                  <th>${isVi ? 'Học Sinh' : 'Student'}</th>
                  <th>${isVi ? 'Trạng Thái' : 'Status'}</th>
                  <th>${isVi ? 'Đang Làm' : 'Current Activity'}</th>
                  <th>${isVi ? 'Điểm Tổng' : 'Total Score'}</th>
                  <th>${isVi ? 'Bài Hoàn Thành' : 'Completed'}</th>
                  <th>${isVi ? 'Chi Tiết' : 'Action'}</th>
                </tr>
              </thead>
              <tbody id="teacher-students-tbody">
                <tr>
                  <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                    ⏳ ${isVi ? 'Đang tải dữ liệu học sinh...' : 'Loading students...'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Student Detail Modal -->
      <div id="teacher-student-modal" class="modal-backdrop" style="display: none;">
        <div class="modal-dialog" style="max-width: 680px;">
          <div class="modal-header">
            <h3 class="modal-title" id="teacher-modal-student-name">🧑‍🎓 Chi tiết học sinh</h3>
            <button type="button" class="btn-close-modal" id="btn-close-teacher-modal">✖</button>
          </div>
          <div class="modal-body student-detail-body" id="teacher-student-modal-body">
            <!-- Dynamic student history -->
          </div>
        </div>
      </div>
    `;

    // Gắn sự kiện sao chép mã lớp
    const copyBtn = document.getElementById('btn-copy-class-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(classroomId).then(() => {
          if (window.SoundFX) window.SoundFX.playTing();
          copyBtn.innerText = isVi ? '✓ Đã chép!' : '✓ Copied!';
          setTimeout(() => {
            copyBtn.innerText = isVi ? '📋 Sao chép' : '📋 Copy';
          }, 1500);
        });
      });
    }

    // Nút làm mới
    const refreshBtn = document.getElementById('btn-refresh-students');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (window.SoundFX) window.SoundFX.playPop();
        this.loadClassroomData(classroomId);
      });
    }

    // Đóng modal chi tiết
    const studentModal = document.getElementById('teacher-student-modal');
    const closeModalBtn = document.getElementById('btn-close-teacher-modal');
    const closeStudentModal = () => {
      if (studentModal) studentModal.style.display = 'none';
    };
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeStudentModal);
    }
    if (studentModal) {
      studentModal.addEventListener('click', (e) => {
        if (e.target === studentModal) closeStudentModal();
      });
    }

    // Tải dữ liệu lớp học
    await this.loadClassroomData(classroomId);
  }

  async loadClassroomData(classroomId) {
    const isVi = window.I18N ? window.I18N.isVietnamese() : true;
    const tbody = document.getElementById('teacher-students-tbody');

    try {
      if (window.FirebaseService) {
        this.students = await window.FirebaseService.getStudentsInClassroom(classroomId);
      } else {
        this.students = [];
      }
    } catch (e) {
      console.warn('Teacher load classroom error:', e);
      this.students = [];
    }

    // Cập nhật thống kê nhanh
    const onlineCount = this.students.filter(s => s.online).length;
    const totalCount = this.students.length;
    let totalScoreSum = 0;
    let totalTasksConquered = 0;

    this.students.forEach(s => {
      totalScoreSum += Number(s.totalScore || 0);
      totalTasksConquered += Number(s.tasksCompleted || 0);
    });

    const avgScore = totalCount > 0 ? Math.round(totalScoreSum / totalCount) : 0;

    const elOnline = document.getElementById('stat-online-count');
    const elTotal = document.getElementById('stat-total-count');
    const elAvg = document.getElementById('stat-avg-score');
    const elTasks = document.getElementById('stat-tasks-count');

    if (elOnline) elOnline.innerText = onlineCount;
    if (elTotal) elTotal.innerText = totalCount;
    if (elAvg) elAvg.innerText = avgScore;
    if (elTasks) elTasks.innerText = totalTasksConquered;

    if (!tbody) return;

    if (this.students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: #64748b; font-weight: 700;">
            🌱 ${isVi ? 'Lớp chưa có học sinh nào. Hãy chia sẻ mã lớp cho các em nhé!' : 'No students have joined this class yet. Share your class code!'}
          </td>
        </tr>
      `;
      return;
    }

    const avatars = ['🐱', '🦊', '🐶', '🐰', '🐼', '🐯', '🐻', '🦁'];

    tbody.innerHTML = this.students.map((student, idx) => {
      const avatar = avatars[idx % avatars.length];
      const statusPill = student.online
        ? `<span class="status-pill status-pill-online">🟢 ${isVi ? 'Đang học' : 'Online'}</span>`
        : `<span class="status-pill status-pill-offline">⚪ ${isVi ? 'Đã rời' : 'Offline'}</span>`;

      return `
        <tr class="teacher-student-row">
          <td>
            <div class="student-identity">
              <span class="student-avatar-badge">${avatar}</span>
              <div>
                <div class="student-name-text">${this.escapeHtml(student.displayName)}</div>
                <div class="student-user-sub">@${this.escapeHtml(student.username || 'student')}</div>
              </div>
            </div>
          </td>
          <td>${statusPill}</td>
          <td style="color: #475569; font-weight: 600;">
            ${this.escapeHtml(student.currentTask || (isVi ? 'Nghỉ ngơi' : 'Idle'))}
          </td>
          <td>
            <strong style="color: #d97706; font-size: 1.15rem;">⭐ ${student.totalScore || 0}</strong>
          </td>
          <td>
            <span style="font-weight: 800; color: #4f46e5;">${student.tasksCompleted || 0} / 3</span>
          </td>
          <td>
            <button type="button" class="btn-view-student-detail" data-student-idx="${idx}">
              🔍 ${isVi ? 'Xem bài làm' : 'View Logs'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Gắn sự kiện xem chi tiết học sinh
    tbody.querySelectorAll('.btn-view-student-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.SoundFX) window.SoundFX.playPop();
        const idx = Number(btn.dataset.studentIdx);
        this.openStudentDetail(this.students[idx]);
      });
    });
  }

  openStudentDetail(student) {
    if (!student) return;
    const isVi = window.I18N ? window.I18N.isVietnamese() : true;
    const modal = document.getElementById('teacher-student-modal');
    const modalTitle = document.getElementById('teacher-modal-student-name');
    const modalBody = document.getElementById('teacher-student-modal-body');
    if (!modal || !modalBody) return;

    modalTitle.innerText = `🧑‍🎓 ${student.displayName} (@${student.username || 'student'})`;

    const sessions = student.recentSessions || [];
    let sessionsHtml = '';

    if (sessions.length === 0) {
      sessionsHtml = `
        <div style="text-align: center; padding: 2rem; color: #64748b;">
          ${isVi ? 'Học sinh chưa có lịch sử phiên làm bài chi tiết nào.' : 'No detailed session logs found yet.'}
        </div>
      `;
    } else {
      sessionsHtml = sessions.map(sess => {
        const isSuccess = sess.summary?.finalSuccess;
        const timeSec = sess.summary?.totalTimeSeconds || 0;
        const attempts = sess.summary?.totalAttempts || 1;
        const dateStr = sess.startedAt ? new Date(sess.startedAt).toLocaleString(isVi ? 'vi-VN' : 'en-US') : '';

        return `
          <div class="session-history-item">
            <div>
              <div class="session-task-title">
                ${isSuccess ? '✅' : '⏳'} ${this.escapeHtml(sess.taskTitle || sess.taskId)}
              </div>
              <div class="session-task-meta">
                📅 ${dateStr} &bull; ⏱️ ${timeSec}s &bull; 🔄 ${attempts} ${isVi ? 'lần thử' : 'attempts'}
              </div>
            </div>
            <div>
              <span class="status-pill ${isSuccess ? 'status-pill-online' : 'status-pill-offline'}">
                ${isSuccess ? (isVi ? 'Thành công' : 'Solved') : (isVi ? 'Đang giải' : 'In Progress')}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    modalBody.innerHTML = `
      <div class="student-detail-summary">
        <div>
          <div class="detail-metric-val">⭐ ${student.totalScore || 0}</div>
          <div class="detail-metric-lbl">${isVi ? 'Tổng Điểm' : 'Total Score'}</div>
        </div>
        <div>
          <div class="detail-metric-val">${student.tasksCompleted || 0} / 3</div>
          <div class="detail-metric-lbl">${isVi ? 'Bài Hoàn Thành' : 'Tasks Solved'}</div>
        </div>
        <div>
          <div class="detail-metric-val">${student.online ? '🟢 Online' : '⚪ Offline'}</div>
          <div class="detail-metric-lbl">${isVi ? 'Trạng Thái' : 'Status'}</div>
        </div>
      </div>

      <h4 style="font-family: 'Lexend'; margin-top: 1rem; color: #334155;">
        ${isVi ? '📜 Lịch sử các phiên giải toán gần nhất:' : '📜 Recent Problem-Solving Sessions:'}
      </h4>

      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;">
        ${sessionsHtml}
      </div>
    `;

    modal.style.display = 'flex';
  }
}

// Khởi tạo Singleton
window.TeacherDashboardController = new TeacherDashboardController();
