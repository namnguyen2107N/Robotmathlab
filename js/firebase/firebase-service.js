/**
 * ROBOT MATH LAB - FIREBASE SERVICE
 * Quản lý xác thực (Firebase Authentication) và lưu trữ dữ liệu thời gian thực (Firebase Realtime Database).
 * Tích hợp chế độ dự phòng Offline/Local để ứng dụng luôn hoạt động mượt mà ngay cả khi chưa nạp API key.
 */
class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.account = null;
    this.isOnline = false;
    this.isConfigured = false;
    this.offlineMode = false;
    this.authListeners = [];
    this.connectionListeners = [];
    this.initPromise = null;

    this.STORAGE_USERS_KEY = 'rml_firebase_mock_users';
    this.STORAGE_SESSION_KEY = 'rml_research_logs_v2';
    this.STORAGE_PROGRESS_KEY = 'rml_user_progress';

    this.init();
  }

  /**
   * Khởi tạo dịch vụ Firebase
   */
  init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      try {
        const config = window.RML_FIREBASE_CONFIG;
        this.isConfigured = Boolean(window.RML_FIREBASE_CONFIGURED);

        if (window.firebase && this.isConfigured) {
          // Tránh khởi tạo nhiều lần
          if (!window.firebase.apps || !window.firebase.apps.length) {
            this.app = window.firebase.initializeApp(config);
          } else {
            this.app = window.firebase.app();
          }

          this.auth = window.firebase.auth();
          this.db = window.firebase.database();

          // Lắng nghe trạng thái kết nối Realtime Database (.info/connected)
          const connectedRef = this.db.ref('.info/connected');
          connectedRef.on('value', (snap) => {
            this.isOnline = snap.val() === true;
            this.notifyConnectionListeners(this.isOnline);
            console.log(`[FirebaseService] Realtime Database connection: ${this.isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
          });

          // Lắng nghe trạng thái xác thực người dùng
          this.auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
              await this.handleFirebaseUserSignedIn(firebaseUser);
            } else {
              this.handleFirebaseUserSignedOut();
            }
            resolve(true);
          });

          console.log('[FirebaseService] Initialized with Firebase Web App configuration.');
        } else {
          // Kích hoạt chế độ Offline / Demo dự phòng
          this.enableOfflineMode('Firebase chưa được cấu hình hoặc SDK chưa sẵn sàng. Đang chạy chế độ Local Demo.');
          resolve(false);
        }
      } catch (err) {
        console.warn('[FirebaseService] Init error, falling back to offline mode:', err);
        this.enableOfflineMode(err.message);
        resolve(false);
      }
    });

    return this.initPromise;
  }

  /**
   * Chuyển sang chế độ Offline / Local Demo
   */
  enableOfflineMode(reason) {
    this.offlineMode = true;
    this.isOnline = false;
    console.info(`[FirebaseService] Offline mode active: ${reason}`);

    // Khôi phục tài khoản local nếu đã lưu
    const cachedAccount = this.getLocalCurrentAccount();
    if (cachedAccount) {
      this.account = cachedAccount;
      this.currentUser = { uid: cachedAccount.uid, displayName: cachedAccount.display_name };
    }
  }

  /**
   * Đăng ký lắng nghe thay đổi trạng thái xác thực
   */
  onAuthStateChanged(callback) {
    if (typeof callback === 'function') {
      this.authListeners.push(callback);
      // Gọi ngay trạng thái hiện tại nếu đã xác định
      if (this.account !== null || this.offlineMode) {
        callback(this.account);
      }
    }
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  notifyAuthListeners(account) {
    this.authListeners.forEach(cb => {
      try { cb(account); } catch (e) { console.error('Auth listener error:', e); }
    });
  }

  /**
   * Đăng ký lắng nghe trạng thái kết nối mạng Realtime Database
   */
  onConnectionChanged(callback) {
    if (typeof callback === 'function') {
      this.connectionListeners.push(callback);
      callback(this.isOnline);
    }
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  notifyConnectionListeners(online) {
    this.connectionListeners.forEach(cb => {
      try { cb(online); } catch (e) { console.error('Connection listener error:', e); }
    });
  }

  /**
   * Chuẩn hoá email từ username hoặc email thực tế
   */
  resolveEmail(identifier) {
    const raw = String(identifier || '').trim().toLowerCase();
    if (raw.includes('@')) return raw;
    // Tự động gán đuôi email cho username học sinh tiểu học
    const safeUser = raw.replace(/[^a-z0-9_]/g, '') || 'student';
    return `${safeUser}@robotmathlab.edu`;
  }

  /**
   * Trích xuất username ngắn gọn từ email hoặc chuỗi
   */
  extractUsername(identifier, email) {
    const raw = String(identifier || '').trim();
    if (raw && !raw.includes('@')) return raw.toLowerCase();
    if (email && email.includes('@')) return email.split('@')[0].toLowerCase();
    return 'student';
  }

  /**
   * Xử lý khi Firebase Auth báo có user đăng nhập
   */
  async handleFirebaseUserSignedIn(firebaseUser) {
    try {
      this.currentUser = firebaseUser;
      let profile = null;

      if (this.db && !firebaseUser.isAnonymous) {
        try {
          const snap = await this.db.ref(`users/${firebaseUser.uid}/profile`).once('value');
          profile = snap.val();
        } catch (e) {
          console.warn('[FirebaseService] Could not fetch profile from DB:', e);
        }
      }

      const displayName = profile?.displayName
        || firebaseUser.displayName
        || (firebaseUser.isAnonymous ? 'Học sinh khách' : 'Bé Yêu Toán');

      const username = profile?.username
        || this.extractUsername(null, firebaseUser.email)
        || `user_${firebaseUser.uid.slice(0, 6)}`;

      this.account = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        username,
        display_name: displayName,
        email: firebaseUser.email || '',
        isAnonymous: firebaseUser.isAnonymous,
        class_name: profile?.className || null
      };

      // Cập nhật thời điểm đăng nhập gần nhất vào Realtime Database
      if (this.db && !firebaseUser.isAnonymous) {
        this.db.ref(`users/${firebaseUser.uid}/profile/lastLoginAt`).set(new Date().toISOString()).catch(() => {});
      }

      this.saveLocalCurrentAccount(this.account);
      this.notifyAuthListeners(this.account);
    } catch (e) {
      console.error('[FirebaseService] Error handling signed in user:', e);
    }
  }

  /**
   * Xử lý khi đăng xuất
   */
  handleFirebaseUserSignedOut() {
    this.currentUser = null;
    this.account = null;
    this.clearLocalCurrentAccount();
    this.notifyAuthListeners(null);
  }

  /**
   * ĐĂNG KÝ TÀI KHOẢN MỚI
   * @param {Object} params { displayName, username, email, password }
   */
  async register({ displayName, username, email, password }) {
    await this.init();

    const cleanName = String(displayName || '').trim();
    const cleanUser = String(username || '').trim().toLowerCase();
    const effectiveEmail = this.resolveEmail(email || cleanUser);

    if (!cleanName) throw new Error('Vui lòng nhập tên hiển thị.');
    if (!cleanUser && !email) throw new Error('Vui lòng nhập tên đăng nhập hoặc email.');
    if (!password || password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');

    if (this.auth && !this.offlineMode) {
      try {
        // 1. Tạo tài khoản với Firebase Auth
        const cred = await this.auth.createUserWithEmailAndPassword(effectiveEmail, password);
        const user = cred.user;

        // 2. Cập nhật tên hiển thị trong Auth
        await user.updateProfile({ displayName: cleanName });

        // 3. Lưu thông tin hồ sơ vào Realtime Database: /users/{uid}/profile
        const userProfile = {
          uid: user.uid,
          displayName: cleanName,
          username: cleanUser || this.extractUsername(null, effectiveEmail),
          email: effectiveEmail,
          role: 'student',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        if (this.db) {
          try {
            await this.db.ref(`users/${user.uid}/profile`).set(userProfile);
            // Ánh xạ username -> uid để dễ tra cứu
            if (cleanUser) {
              await this.db.ref(`usernames/${cleanUser}`).set(user.uid);
            }
          } catch (dbErr) {
            console.warn('[FirebaseService] RTDB write error (auth succeeded):', dbErr);
          }
        }

        const account = {
          id: user.uid,
          uid: user.uid,
          username: userProfile.username,
          display_name: cleanName,
          email: effectiveEmail,
          isAnonymous: false,
          class_name: null
        };

        this.account = account;
        this.saveLocalCurrentAccount(account);
        return account;
      } catch (err) {
        console.error('[FirebaseService] Register error:', err);
        throw new Error(this.translateAuthError(err));
      }
    } else {
      // Offline fallback registration
      return this.registerOffline({ displayName: cleanName, username: cleanUser, email: effectiveEmail, password });
    }
  }

  /**
   * ĐĂNG NHẬP TÀI KHOẢN
   * @param {Object} params { username, password }
   */
  async login({ username, password }) {
    await this.init();

    const cleanUser = String(username || '').trim();
    if (!cleanUser) throw new Error('Vui lòng nhập tên đăng nhập hoặc email.');
    if (!password) throw new Error('Vui lòng nhập mật khẩu.');

    let effectiveEmail = this.resolveEmail(cleanUser);

    if (this.auth && !this.offlineMode) {
      try {
        // Nếu nhập username và có DB, tra cứu email đã đăng ký
        if (!cleanUser.includes('@') && this.db) {
          try {
            const uidSnap = await this.db.ref(`usernames/${cleanUser.toLowerCase()}`).once('value');
            const uid = uidSnap.val();
            if (uid) {
              const emailSnap = await this.db.ref(`users/${uid}/profile/email`).once('value');
              const foundEmail = emailSnap.val();
              if (foundEmail) effectiveEmail = foundEmail;
            }
          } catch (e) {
            // fallback sang username@robotmathlab.edu
          }
        }

        const cred = await this.auth.signInWithEmailAndPassword(effectiveEmail, password);
        const user = cred.user;

        let profile = null;
        if (this.db) {
          try {
            const snap = await this.db.ref(`users/${user.uid}/profile`).once('value');
            profile = snap.val();
          } catch (_) {}
        }

        const account = {
          id: user.uid,
          uid: user.uid,
          username: profile?.username || cleanUser.toLowerCase(),
          display_name: profile?.displayName || user.displayName || 'Bé Yêu Toán',
          email: user.email || effectiveEmail,
          isAnonymous: false,
          class_name: profile?.className || null
        };

        this.account = account;
        this.saveLocalCurrentAccount(account);
        return account;
      } catch (err) {
        console.error('[FirebaseService] Login error:', err);
        throw new Error(this.translateAuthError(err));
      }
    } else {
      // Offline fallback login
      return this.loginOffline({ username: cleanUser, password });
    }
  }

  /**
   * ĐĂNG NHẬP NHANH CHẾ ĐỘ HỌC SINH KHÁCH (GUEST DEMO)
   */
  async loginAsGuest() {
    await this.init();

    const guestName = (window.I18N && window.I18N.isVietnamese()) ? 'Khách Trải Nghiệm' : 'Guest Explorer';

    if (this.auth && !this.offlineMode) {
      try {
        const cred = await this.auth.signInAnonymously();
        const user = cred.user;
        await user.updateProfile({ displayName: guestName });

        const account = {
          id: user.uid,
          uid: user.uid,
          username: `guest_${user.uid.slice(0, 5)}`,
          display_name: guestName,
          email: '',
          isAnonymous: true,
          class_name: null
        };

        this.account = account;
        this.saveLocalCurrentAccount(account);
        return account;
      } catch (err) {
        console.warn('[FirebaseService] Anonymous sign-in failed, fallback to local guest:', err);
      }
    }

    // Local guest fallback
    const guestId = `guest_${Date.now().toString(36)}`;
    const localGuest = {
      id: guestId,
      uid: guestId,
      username: guestId,
      display_name: guestName,
      email: '',
      isAnonymous: true,
      class_name: null
    };
    this.account = localGuest;
    this.saveLocalCurrentAccount(localGuest);
    this.notifyAuthListeners(localGuest);
    return localGuest;
  }

  /**
   * ĐĂNG XUẤT
   */
  async logout() {
    if (this.auth && !this.offlineMode) {
      try {
        await this.auth.signOut();
      } catch (e) {
        console.warn('[FirebaseService] Sign out error:', e);
      }
    }
    this.handleFirebaseUserSignedOut();
    return true;
  }

  /**
   * CẬP NHẬT TÊN HIỂN THỊ CỦA HỌC SINH
   */
  async updateDisplayName(newName) {
    const cleanName = String(newName || '').trim();
    if (!cleanName) throw new Error('Tên hiển thị không được để trống.');

    if (this.auth && this.currentUser && !this.offlineMode) {
      try {
        await this.currentUser.updateProfile({ displayName: cleanName });
        if (this.db && this.account?.uid) {
          await this.db.ref(`users/${this.account.uid}/profile/displayName`).set(cleanName);
        }
      } catch (e) {
        console.warn('[FirebaseService] Could not update profile in Firebase:', e);
      }
    }

    if (this.account) {
      this.account.display_name = cleanName;
      this.saveLocalCurrentAccount(this.account);
    }
    return this.account;
  }

  // =========================================================================
  // REALTIME DATABASE DATA SYNC (HỌC TẬP, PHIÊN LÀM BÀI, NHẬT KÝ POLYA)
  // =========================================================================

  /**
   * LƯU / ĐỒNG BỘ PHIÊN HỌC TẬP LÊN REALTIME DATABASE
   * Lưu đồng thời vào /users/{uid}/sessions/{sessionId} và /sessions/{sessionId}
   */
  async saveSession(session) {
    if (!session || !session.sessionId) return;

    // Luôn lưu local trước để đảm bảo tốc độ và trải nghiệm mượt mà
    this.saveSessionLocally(session);

    if (this.db && this.account && !this.offlineMode) {
      try {
        const sanitized = this.sanitizeForFirebase(session);
        const uid = this.account.uid || this.account.id;

        // Lưu vào nhánh của user
        const userSessionRef = this.db.ref(`users/${uid}/sessions/${session.sessionId}`);
        await userSessionRef.set(sanitized);

        // Lưu vào nhánh chung (hỗ trợ giáo viên/nghiên cứu xem nhật ký)
        const globalSessionRef = this.db.ref(`sessions/${session.sessionId}`);
        await globalSessionRef.set({
          ...sanitized,
          uid,
          syncedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[FirebaseService] Realtime DB sync session error:', err);
      }
    }
  }

  /**
   * LƯU TIẾN ĐỘ HOÀN THÀNH NHIỆM VỤ
   * Lưu vào /users/{uid}/progress/{taskId}
   */
  async saveTaskProgress(taskId, progressData = {}) {
    if (!taskId) return;
    const uid = this.account?.uid || this.account?.id || 'local_user';

    const record = {
      taskId,
      completed: true,
      updatedAt: new Date().toISOString(),
      ...progressData
    };

    // Lưu local
    try {
      const allProg = JSON.parse(localStorage.getItem(this.STORAGE_PROGRESS_KEY) || '{}');
      allProg[taskId] = record;
      localStorage.setItem(this.STORAGE_PROGRESS_KEY, JSON.stringify(allProg));
    } catch (_) {}

    // Lưu Realtime Database
    if (this.db && this.account && !this.offlineMode) {
      try {
        await this.db.ref(`users/${uid}/progress/${taskId}`).set(record);
      } catch (err) {
        console.warn('[FirebaseService] Realtime DB saveTaskProgress error:', err);
      }
    }
  }

  /**
   * TẢI DANH SÁCH TIẾN ĐỘ HOÀN THÀNH CỦA HỌC SINH
   */
  async loadUserProgress() {
    let localProgress = {};
    try {
      localProgress = JSON.parse(localStorage.getItem(this.STORAGE_PROGRESS_KEY) || '{}');
    } catch (_) {}

    if (this.db && this.account && !this.offlineMode) {
      try {
        const uid = this.account.uid || this.account.id;
        const snap = await this.db.ref(`users/${uid}/progress`).once('value');
        const cloudProgress = snap.val();
        if (cloudProgress) {
          return { ...localProgress, ...cloudProgress };
        }
      } catch (err) {
        console.warn('[FirebaseService] Could not fetch progress from cloud:', err);
      }
    }
    return localProgress;
  }

  /**
   * TẢI NHẬT KÝ CÁC PHIÊN HỌC TẬP TỪ REALTIME DATABASE
   */
  async loadUserSessions() {
    const localSessions = this.getLocalSessions();

    if (this.db && this.account && !this.offlineMode) {
      try {
        const uid = this.account.uid || this.account.id;
        const snap = await this.db.ref(`users/${uid}/sessions`).once('value');
        const cloudSessionsObj = snap.val();
        if (cloudSessionsObj && typeof cloudSessionsObj === 'object') {
          const cloudSessions = Object.values(cloudSessionsObj);
          // Gộp cloud và local (ưu tiên dữ liệu mới hơn theo startedAt)
          const sessionMap = new Map();
          localSessions.forEach(s => s && s.sessionId && sessionMap.set(s.sessionId, s));
          cloudSessions.forEach(s => s && s.sessionId && sessionMap.set(s.sessionId, s));
          return Array.from(sessionMap.values()).sort(
            (a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0)
          );
        }
      } catch (err) {
        console.warn('[FirebaseService] Could not fetch user sessions from cloud:', err);
      }
    }

    return localSessions;
  }

  // =========================================================================
  // TIỆN ÍCH DỰ PHÒNG CỤC BỘ (LOCAL FALLBACK UTILITIES)
  // =========================================================================

  saveLocalCurrentAccount(account) {
    try {
      localStorage.setItem('rml_firebase_account', JSON.stringify(account));
      localStorage.setItem('rml_student_name', account.display_name || '');
      localStorage.setItem('rml_account_id', account.id || account.uid || '');
    } catch (_) {}
  }

  getLocalCurrentAccount() {
    try {
      const raw = localStorage.getItem('rml_firebase_account');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  clearLocalCurrentAccount() {
    try {
      localStorage.removeItem('rml_firebase_account');
      localStorage.removeItem('rml_student_name');
      localStorage.removeItem('rml_account_id');
    } catch (_) {}
  }

  getLocalSessions() {
    try {
      const raw = localStorage.getItem(this.STORAGE_SESSION_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveSessionLocally(session) {
    try {
      const all = this.getLocalSessions();
      const idx = all.findIndex(s => s.sessionId === session.sessionId);
      if (idx >= 0) all[idx] = session;
      else all.push(session);
      const bounded = all.length > 50 ? all.slice(-50) : all;
      localStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(bounded));
    } catch (_) {}
  }

  registerOffline({ displayName, username, email, password }) {
    try {
      const users = JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY) || '{}');
      const key = username.toLowerCase();
      if (users[key]) {
        throw new Error('Tên đăng nhập này đã được sử dụng trên thiết bị này.');
      }
      const uid = `local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const account = {
        id: uid,
        uid,
        username: key,
        display_name: displayName,
        email,
        password, // chỉ lưu nội bộ offline
        isAnonymous: false,
        class_name: null
      };
      users[key] = account;
      localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));

      this.account = account;
      this.saveLocalCurrentAccount(account);
      this.notifyAuthListeners(account);
      return account;
    } catch (e) {
      throw e;
    }
  }

  loginOffline({ username, password }) {
    try {
      const users = JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY) || '{}');
      const key = username.toLowerCase();
      const existing = users[key];

      if (existing) {
        if (existing.password && existing.password !== password) {
          throw new Error('Sai mật khẩu. Vui lòng thử lại.');
        }
        this.account = existing;
        this.saveLocalCurrentAccount(existing);
        this.notifyAuthListeners(existing);
        return existing;
      }

      // Tạo tài khoản nhanh nếu chưa có trong offline demo
      const uid = `local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const newAcc = {
        id: uid,
        uid,
        username: key,
        display_name: username,
        email: this.resolveEmail(username),
        password,
        isAnonymous: false,
        class_name: null
      };
      users[key] = newAcc;
      localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
      this.account = newAcc;
      this.saveLocalCurrentAccount(newAcc);
      this.notifyAuthListeners(newAcc);
      return newAcc;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Khử các trường undefined / hàm không hợp lệ trước khi đẩy lên Firebase
   */
  sanitizeForFirebase(obj) {
    if (obj === null || obj === undefined) return null;
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (value === undefined) return null;
      return value;
    }));
  }

  /**
   * Dịch mã lỗi Firebase Auth sang tiếng Việt thân thiện với học sinh
   */
  translateAuthError(err) {
    const code = err?.code || '';
    const isVi = window.I18N ? window.I18N.isVietnamese() : true;

    if (!isVi) {
      return err.message || 'Authentication error. Please try again.';
    }

    switch (code) {
      case 'auth/invalid-email':
        return 'Email hoặc tên đăng nhập không hợp lệ.';
      case 'auth/user-disabled':
        return 'Tài khoản này đã bị tạm dừng hoạt động.';
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản này. Em hãy kiểm tra lại hoặc tạo tài khoản mới nhé!';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Mật khẩu chưa chính xác. Vui lòng kiểm tra lại.';
      case 'auth/email-already-in-use':
        return 'Tên đăng nhập hoặc email này đã có người sử dụng. Em hãy chọn tên khác nhé!';
      case 'auth/weak-password':
        return 'Mật khẩu quá ngắn. Vui lòng đặt mật khẩu từ 6 ký tự trở lên.';
      case 'auth/operation-not-allowed':
        return 'Tính năng đăng nhập này chưa được bật trên Firebase Console.';
      case 'auth/network-request-failed':
        return 'Không có kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.';
      case 'auth/too-many-requests':
        return 'Đăng nhập sai quá nhiều lần. Vui lòng đợi ít phút và thử lại.';
      default:
        return err.message || 'Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.';
    }
  }
}

// Khởi tạo Singleton instance toàn cục
window.FirebaseService = new FirebaseService();
