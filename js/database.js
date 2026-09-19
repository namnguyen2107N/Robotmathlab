/**
 * ROBOT MATH LAB - LOCAL DATABASE ENGINE (Client-Side Database)
 * Manages users (students, teachers, researchers), sessions, traffic, and personal progress.
 * Supports Role-Based Access Control (Admin/Teacher vs Regular Student).
 */

const DB = {
  KEYS: {
    USERS: 'rml_db_users',
    CURRENT_USER: 'rml_db_current_user',
    SESSIONS: 'rml_db_sessions',
    TRAFFIC: 'rml_db_traffic',
    PROGRESS: 'rml_db_progress'
  },

  // Default avatars available for students
  AVATARS: [
    { id: 'bot-spark', name: 'Sparky', emoji: '🤖', color: '#4F46E5', desc: 'Robot Thông Thái' },
    { id: 'bot-speed', name: 'Zoomer', emoji: '⚡', color: '#F59E0B', desc: 'Robot Siêu Tốc' },
    { id: 'bot-eco', name: 'Leafy', emoji: '🌱', color: '#10B981', desc: 'Robot Sinh Thái' },
    { id: 'bot-star', name: 'Cosmo', emoji: '🚀', color: '#8B5CF6', desc: 'Robot Vũ Trụ' },
    { id: 'bot-heart', name: 'Ruby', emoji: '💖', color: '#EC4899', desc: 'Robot Thân Thiện' },
    { id: 'bot-shield', name: 'Titan', emoji: '🛡️', color: '#06B6D4', desc: 'Robot Vững Vàng' }
  ],

  init() {
    this.seedDefaultUsers();
    this.ensureSession();
  },

  seedDefaultUsers() {
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const defaultUsers = [
        {
          id: 'stu_001',
          name: 'Bảo Nam',
          role: 'student',
          grade: 5,
          className: '5A',
          avatarId: 'bot-spark',
          pin: '1234',
          stars: 120,
          exp: 350,
          level: 3,
          badges: ['Tân binh Robotics', 'Tay đua 100m'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'stu_002',
          name: 'Minh Anh',
          role: 'student',
          grade: 5,
          className: '5B',
          avatarId: 'bot-star',
          pin: '1234',
          stars: 95,
          exp: 280,
          level: 2,
          badges: ['Tân binh Robotics'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'tch_001',
          name: 'Cô Mai (Giáo Viên)',
          role: 'teacher',
          grade: 5,
          className: 'Khối 5',
          avatarId: 'bot-shield',
          pin: '9999',
          stars: 500,
          exp: 1000,
          level: 10,
          badges: ['Chuyên gia Sư phạm', 'Quản trị viên'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'adm_001',
          name: 'Nhà Nghiên Cứu NCKH',
          role: 'researcher',
          grade: 5,
          className: 'Viện SP',
          avatarId: 'bot-spark',
          pin: '8888',
          stars: 999,
          exp: 5000,
          level: 20,
          badges: ['Admin Hệ Thống'],
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(defaultUsers));
    }

    // Set default active user as regular student (Bảo Nam) if none selected
    if (!localStorage.getItem(this.KEYS.CURRENT_USER)) {
      const users = this.getUsers();
      this.setCurrentUser(users[0]); // stu_001
    }
  },

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER)) || null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('userChanged', { detail: { user } }));
  },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  },

  /**
   * Check if current user has Admin / Teacher / Researcher privilege
   */
  isAdmin() {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === 'teacher' || user.role === 'researcher' || user.role === 'admin';
  },

  /**
   * Verify admin PIN code (9999 for Teacher, 8888 for Researcher)
   */
  verifyAdminPin(pin) {
    const cleanPin = pin ? pin.trim() : '';
    if (cleanPin === '9999') {
      const teacher = this.getUserById('tch_001') || {
        id: 'tch_001',
        name: 'Cô Mai (Giáo Viên)',
        role: 'teacher',
        avatarId: 'bot-shield'
      };
      this.setCurrentUser(teacher);
      return { success: true, user: teacher };
    } else if (cleanPin === '8888') {
      const researcher = this.getUserById('adm_001') || {
        id: 'adm_001',
        name: 'Nhà Nghiên Cứu NCKH',
        role: 'researcher',
        avatarId: 'bot-spark'
      };
      this.setCurrentUser(researcher);
      return { success: true, user: researcher };
    }
    return { success: false, message: 'Mã PIN Quản trị không chính xác.' };
  },

  /**
   * Switch back to student mode
   */
  switchToStudent() {
    const users = this.getUsers();
    const student = users.find(u => u.role === 'student') || users[0];
    this.setCurrentUser(student);
  },

  /**
   * Register a new student account
   */
  registerUser({ name, grade, className, avatarId, pin }) {
    const users = this.getUsers();
    const newUser = {
      id: 'stu_' + Math.random().toString(36).substring(2, 8),
      name: name.trim() || 'Học Sinh Mới',
      role: 'student',
      grade: parseInt(grade) || 5,
      className: className.trim() || '5A',
      avatarId: avatarId || 'bot-spark',
      pin: pin ? pin.trim() : '1234',
      stars: 10,
      exp: 20,
      level: 1,
      badges: ['Tân binh Robotics'],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);
    return newUser;
  },

  /**
   * Login with Name/ID and PIN
   */
  login(nameOrId, pin) {
    const users = this.getUsers();
    const cleanQuery = nameOrId.trim().toLowerCase();
    const user = users.find(u => 
      (u.id.toLowerCase() === cleanQuery || u.name.toLowerCase() === cleanQuery) &&
      (!pin || u.pin === pin.trim())
    );

    if (user) {
      this.setCurrentUser(user);
      this.recordSession(user.id);
      return { success: true, user };
    }
    return { success: false, message: 'Tên học sinh hoặc mã PIN không đúng.' };
  },

  logout() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
    // Fall back to first student
    const users = this.getUsers();
    const student = users.find(u => u.role === 'student') || users[0];
    if (student) {
      this.setCurrentUser(student);
    }
  },

  /**
   * Add reward stars & EXP to current user
   */
  addReward(starsEarned = 10, expEarned = 25) {
    const user = this.getCurrentUser();
    if (!user) return;

    user.stars = (user.stars || 0) + starsEarned;
    user.exp = (user.exp || 0) + expEarned;

    // Calculate level: every 100 EXP = 1 level
    const newLevel = Math.floor(user.exp / 100) + 1;
    let leveledUp = false;
    if (newLevel > (user.level || 1)) {
      user.level = newLevel;
      leveledUp = true;
    }

    // Update in users list
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      this.saveUsers(users);
    }

    this.setCurrentUser(user);
    return { stars: user.stars, exp: user.exp, level: user.level, leveledUp };
  },

  getAvatar(avatarId) {
    return this.AVATARS.find(a => a.id === avatarId) || this.AVATARS[0];
  },

  /**
   * Session & Device tracking
   */
  ensureSession() {
    const user = this.getCurrentUser();
    if (user) {
      this.recordSession(user.id);
    }
  },

  recordSession(userId) {
    const sessions = this.getSessions();
    const deviceType = this.detectDevice();
    const newSession = {
      id: 'sess_' + Date.now(),
      userId,
      timestamp: new Date().toISOString(),
      deviceType,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    };
    sessions.push(newSession);
    if (sessions.length > 200) sessions.shift();
    localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getSessions() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SESSIONS)) || [];
    } catch (e) {
      return [];
    }
  },

  detectDevice() {
    const w = window.innerWidth;
    if (w < 768) return 'Mobile';
    if (w <= 1024) return 'Tablet';
    return 'Desktop/Smartboard';
  }
};

DB.init();
window.DB = DB;
