/**
 * ROBOT MATH LAB - FIREBASE SERVICE
 * Quản lý xác thực (Firebase Authentication) và lưu trữ dữ liệu thời gian thực (Firebase Realtime Database).
 * Tích hợp hệ thống phân vai trò Giáo Viên / Học Sinh, Bảng Xếp Hạng (Ranking) và Presence real-time.
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
    this.presenceRef = null;
    this.initPromise = null;

    this.STORAGE_USERS_KEY = 'rml_firebase_mock_users';
    this.STORAGE_SESSION_KEY = 'rml_research_logs_v2';
    this.STORAGE_PROGRESS_KEY = 'rml_user_progress';
    this.STORAGE_SCORES_KEY = 'rml_user_scores';
    this.STORAGE_CLASSROOMS_KEY = 'rml_mock_classrooms';
    this.STORAGE_LEADERBOARD_KEY = 'rml_mock_leaderboard';

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
            if (this.isOnline && this.account?.uid) {
              this.setupPresence();
            }
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
   * Sinh mã phòng học ngẫu nhiên dạng CLASS-XXXX
   */
  generateClassCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CLASS-${code}`;
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

      const role = profile?.role || 'student';
      const displayName = profile?.displayName
        || firebaseUser.displayName
        || (firebaseUser.isAnonymous ? 'Học sinh khách' : (role === 'teacher' ? 'Thầy Cô Giáo' : 'Bé Yêu Toán'));

      const username = profile?.username
        || this.extractUsername(null, firebaseUser.email)
        || `user_${firebaseUser.uid.slice(0, 6)}`;

      this.account = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        username,
        display_name: displayName,
        email: firebaseUser.email || '',
        role: role,
        classroomId: profile?.classroomId || null,
        teacherUid: profile?.teacherUid || null,
        isAnonymous: firebaseUser.isAnonymous,
        class_name: profile?.className || null
      };

      // Cập nhật thời điểm đăng nhập gần nhất vào Realtime Database
      if (this.db && !firebaseUser.isAnonymous) {
        this.db.ref(`users/${firebaseUser.uid}/profile/lastLoginAt`).set(new Date().toISOString()).catch(() => {});
        this.setupPresence();
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
    if (this.account?.uid && this.db) {
      try {
        this.db.ref(`presence/${this.account.uid}`).set({
          online: false,
          lastSeen: new Date().toISOString()
        }).catch(() => {});
      } catch (_) {}
    }
    this.currentUser = null;
    this.account = null;
    this.clearLocalCurrentAccount();
    this.notifyAuthListeners(null);
  }

  /**
   * THIẾT LẬP TRẠNG THÁI REAL-TIME PRESENCE (ONLINE / OFFLINE)
   */
  setupPresence(currentTask = null) {
    if (!this.account?.uid) return;
    const uid = this.account.uid;

    if (this.db && !this.account.isAnonymous) {
      try {
        const presenceRef = this.db.ref(`presence/${uid}`);
        const connectedRef = this.db.ref('.info/connected');

        connectedRef.on('value', (snap) => {
          if (snap.val() === true) {
            const data = {
              online: true,
              displayName: this.account.display_name,
              username: this.account.username,
              role: this.account.role || 'student',
              classroomId: this.account.classroomId || null,
              currentTask: currentTask || 'Đang ở trang chủ',
              lastSeen: new Date().toISOString()
            };
            presenceRef.set(data);
            presenceRef.onDisconnect().set({
              online: false,
              displayName: this.account.display_name,
              role: this.account.role || 'student',
              lastSeen: new Date().toISOString()
            });
          }
        });
      } catch (e) {
        console.warn('[FirebaseService] setupPresence failed:', e);
      }
    }
  }

  /**
   * Cập nhật task học sinh đang làm vào presence
   */
  updateCurrentActivity(taskTitle) {
    if (!this.account?.uid) return;
    if (this.db && !this.account.isAnonymous) {
      try {
        this.db.ref(`presence/${this.account.uid}/currentTask`).set(taskTitle || 'Đang ở trang chủ').catch(() => {});
      } catch (_) {}
    }
  }

  /**
   * ĐĂNG KÝ TÀI KHOẢN MỚI
   * @param {Object} params { displayName, username, email, password, role, classroomId, teacherCode, className, schoolName }
   */
  async register({ displayName, username, email, password, role = 'student', classroomId = '', teacherCode = '', className = '', schoolName = '' }) {
    await this.init();

    const cleanName = String(displayName || '').trim();
    const cleanUser = String(username || '').trim().toLowerCase();
    const effectiveEmail = this.resolveEmail(email || cleanUser);
    const chosenRole = role === 'teacher' ? 'teacher' : 'student';
    let assignedClassroomId = String(classroomId || '').trim().toUpperCase();
    const cleanClass = String(className || '').trim();
    const cleanSchool = String(schoolName || '').trim();

    if (!cleanName) throw new Error('Vui lòng nhập tên hiển thị.');
    if (!cleanUser && !email) throw new Error('Vui lòng nhập tên đăng nhập hoặc email.');
    if (!password || password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');

    // Kiểm tra mã đăng ký giáo viên
    if (chosenRole === 'teacher') {
      const inputCode = String(teacherCode || '').trim();
      const defaultTeacherSecret = 'RML-TEACHER-2026';
      if (inputCode && inputCode !== defaultTeacherSecret) {
        throw new Error('Mã xác thực Giáo Viên không đúng. Vui lòng liên hệ quản trị viên trường học.');
      }
      // Giáo viên tự động được cấp mã lớp mới nếu chưa có
      if (!assignedClassroomId) {
        assignedClassroomId = this.generateClassCode();
      }
    }

    if (this.auth && !this.offlineMode) {
      try {
        // 1. Tạo tài khoản với Firebase Auth
        const cred = await this.auth.createUserWithEmailAndPassword(effectiveEmail, password);
        const user = cred.user;

        // 2. Cập nhật tên hiển thị trong Auth
        await user.updateProfile({ displayName: cleanName });

        // 3. Nếu là giáo viên, tạo phòng học mới
        if (chosenRole === 'teacher' && this.db) {
          try {
            await this.db.ref(`classrooms/${assignedClassroomId}`).set({
              classroomId: assignedClassroomId,
              teacherUid: user.uid,
              teacherName: cleanName,
              className: cleanClass || `Lớp học của ${cleanName}`,
              schoolName: cleanSchool,
              createdAt: new Date().toISOString()
            });
          } catch (clsErr) {
            console.warn('[FirebaseService] Create classroom error:', clsErr);
          }
        }

        // 4. Nếu là học sinh và có mã lớp, ghi danh vào phòng học
        if (chosenRole === 'student' && assignedClassroomId && this.db) {
          try {
            await this.db.ref(`classrooms/${assignedClassroomId}/students/${user.uid}`).set(true);
          } catch (clsErr) {
            console.warn('[FirebaseService] Link student to classroom error:', clsErr);
          }
        }

        // 5. Lưu thông tin hồ sơ vào Realtime Database: /users/{uid}/profile
        const userProfile = {
          uid: user.uid,
          displayName: cleanName,
          username: cleanUser || this.extractUsername(null, effectiveEmail),
          email: effectiveEmail,
          role: chosenRole,
          classroomId: assignedClassroomId || null,
          className: cleanClass,
          schoolName: cleanSchool,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        if (this.db) {
          try {
            await this.db.ref(`users/${user.uid}/profile`).set(userProfile);
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
          role: chosenRole,
          classroomId: assignedClassroomId || null,
          isAnonymous: false,
          className: cleanClass,
          schoolName: cleanSchool,
          class_name: cleanClass || null
        };

        this.account = account;
        this.saveLocalCurrentAccount(account);
        this.setupPresence();
        return account;
      } catch (err) {
        console.error('[FirebaseService] Register error:', err);
        throw new Error(this.translateAuthError(err));
      }
    } else {
      // Offline fallback registration
      return this.registerOffline({
        displayName: cleanName,
        username: cleanUser,
        email: effectiveEmail,
        password,
        role: chosenRole,
        classroomId: assignedClassroomId,
        className: cleanClass,
        schoolName: cleanSchool
      });
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
        if (!cleanUser.includes('@') && this.db) {
          try {
            const uidSnap = await this.db.ref(`usernames/${cleanUser.toLowerCase()}`).once('value');
            const uid = uidSnap.val();
            if (uid) {
              const emailSnap = await this.db.ref(`users/${uid}/profile/email`).once('value');
              const foundEmail = emailSnap.val();
              if (foundEmail) effectiveEmail = foundEmail;
            }
          } catch (e) { }
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

        const role = profile?.role || 'student';
        const account = {
          id: user.uid,
          uid: user.uid,
          username: profile?.username || cleanUser.toLowerCase(),
          display_name: profile?.displayName || user.displayName || 'Bé Yêu Toán',
          email: user.email || effectiveEmail,
          role: role,
          classroomId: profile?.classroomId || null,
          isAnonymous: false,
          className: profile?.className || null,
          schoolName: profile?.schoolName || null,
          class_name: profile?.className || null
        };

        this.account = account;
        this.saveLocalCurrentAccount(account);
        this.setupPresence();
        return account;
      } catch (err) {
        console.error('[FirebaseService] Login error:', err);
        throw new Error(this.translateAuthError(err));
      }
    } else {
      return this.loginOffline({ username: cleanUser, password });
    }
  }

  /**
   * ĐĂNG NHẬP / ĐĂNG KÝ BẰNG GOOGLE
   * @param {'student'|'teacher'} preferredRole
   */
  async loginWithGoogle(preferredRole = 'student') {
    await this.init();

    if (this.auth && !this.offlineMode) {
      try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await this.auth.signInWithPopup(provider);
        return await this.syncOAuthProfile(cred.user, preferredRole);
      } catch (err) {
        console.error('[FirebaseService] Google sign-in error:', err);
        throw new Error(this.translateAuthError(err));
      }
    } else {
      // Hỗ trợ môi trường automated tests Node.js
      if (typeof window === 'undefined' || !window.document || !window.location?.protocol?.startsWith('http')) {
        return this.loginOAuthOffline('Google', preferredRole);
      }
      throw new Error('Chưa kết nối Firebase! Vui lòng dán cấu hình Firebase của bạn vào file js/firebase/firebase-config.js để mở cửa sổ đăng nhập Google Popup.');
    }
  }

  /**
   * ĐĂNG NHẬP / ĐĂNG KÝ BẰNG GITHUB
   * @param {'student'|'teacher'} preferredRole
   */
  async loginWithGithub(preferredRole = 'student') {
    await this.init();

    if (this.auth && !this.offlineMode) {
      try {
        const provider = new window.firebase.auth.GithubAuthProvider();
        const cred = await this.auth.signInWithPopup(provider);
        return await this.syncOAuthProfile(cred.user, preferredRole);
      } catch (err) {
        console.error('[FirebaseService] GitHub sign-in error:', err);
        throw new Error(this.translateAuthError(err));
      }
    } else {
      // Hỗ trợ môi trường automated tests Node.js
      if (typeof window === 'undefined' || !window.document || !window.location?.protocol?.startsWith('http')) {
        return this.loginOAuthOffline('GitHub', preferredRole);
      }
      throw new Error('Chưa kết nối Firebase! Vui lòng dán cấu hình Firebase của bạn vào file js/firebase/firebase-config.js để mở cửa sổ đăng nhập GitHub Popup.');
    }
  }

  /**
   * ĐỒNG BỘ PROFILE KHI ĐĂNG NHẬP OAUTH (GOOGLE / GITHUB)
   */
  async syncOAuthProfile(firebaseUser, preferredRole = 'student') {
    let profile = null;
    let chosenRole = preferredRole === 'teacher' ? 'teacher' : 'student';
    let classroomId = null;

    if (this.db) {
      try {
        const snap = await this.db.ref(`users/${firebaseUser.uid}/profile`).once('value');
        profile = snap.val();
      } catch (e) {
        console.warn('[FirebaseService] Could not check existing OAuth profile:', e);
      }
    }

    if (profile) {
      // Đã có profile trước đó
      chosenRole = profile.role || 'student';
      classroomId = profile.classroomId || null;
    } else {
      // User mới lần đầu đăng nhập qua Google / GitHub
      if (chosenRole === 'teacher') {
        classroomId = this.generateClassCode();
        if (this.db) {
          try {
            await this.db.ref(`classrooms/${classroomId}`).set({
              classroomId,
              teacherUid: firebaseUser.uid,
              teacherName: firebaseUser.displayName || 'Thầy/Cô Giáo',
              className: `Lớp học của ${firebaseUser.displayName || 'Giáo viên'}`,
              createdAt: new Date().toISOString()
            });
          } catch (_) {}
        }
      }

      const cleanUsername = this.extractUsername(null, firebaseUser.email) || `user_${firebaseUser.uid.slice(0, 6)}`;
      profile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || (chosenRole === 'teacher' ? 'Thầy Cô Giáo' : 'Bé Yêu Toán'),
        username: cleanUsername,
        email: firebaseUser.email || '',
        role: chosenRole,
        classroomId: classroomId,
        className: (chosenRole === 'teacher' ? 'Khối 4 - 5' : 'Lớp 4A'),
        schoolName: 'Tiểu học Robot Math Lab',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      if (this.db) {
        try {
          await this.db.ref(`users/${firebaseUser.uid}/profile`).set(profile);
          await this.db.ref(`usernames/${cleanUsername}`).set(firebaseUser.uid);
        } catch (dbErr) {
          console.warn('[FirebaseService] RTDB write OAuth profile error:', dbErr);
        }
      }
    }

    const account = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      username: profile.username || this.extractUsername(null, firebaseUser.email),
      display_name: profile.displayName || firebaseUser.displayName || 'Bé Yêu Toán',
      email: firebaseUser.email || '',
      role: chosenRole,
      classroomId: classroomId,
      isAnonymous: false,
      className: profile.className || null,
      schoolName: profile.schoolName || null,
      class_name: profile.className || null
    };

    this.account = account;
    this.saveLocalCurrentAccount(account);
    this.setupPresence();
    this.notifyAuthListeners(account);
    return account;
  }

  /**
   * GIẢ LẬP ĐĂNG NHẬP OAUTH KHI OFFLINE DEMO
   */
  loginOAuthOffline(providerName, preferredRole = 'student') {
    const role = preferredRole === 'teacher' ? 'teacher' : 'student';
    const randomId = Math.random().toString(36).substr(2, 5);
    const displayName = role === 'teacher' ? `Thầy/Cô (${providerName})` : `Bé (${providerName})`;
    const username = `${providerName.toLowerCase()}_${randomId}`;
    const uid = `oauth_${providerName.toLowerCase()}_${Date.now()}`;
    const classroomId = role === 'teacher' ? this.generateClassCode() : null;

    const account = {
      id: uid,
      uid,
      username,
      display_name: displayName,
      email: `${username}@gmail.com`,
      role,
      classroomId,
      isAnonymous: false,
      className: role === 'teacher' ? 'Khối 4 - 5' : 'Lớp 4A',
      schoolName: 'Tiểu học Robot Math Lab',
      class_name: role === 'teacher' ? 'Khối 4 - 5' : 'Lớp 4A'
    };

    this.account = account;
    this.saveLocalCurrentAccount(account);
    this.notifyAuthListeners(account);
    return account;
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
          role: 'student',
          classroomId: null,
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
      role: 'student',
      classroomId: null,
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
   * CẬP NHẬT TÊN HIỂN THỊ
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
  // CHẤM ĐIỂM & BẢNG XẾP HẠNG (SCORING & LEADERBOARD)
  // =========================================================================

  /**
   * LƯU ĐIỂM SỐ CỦA HỌC SINH SAU KHI HOÀN THÀNH BÀI
   * @param {string} taskId id bài tập (reach, fix, new)
   * @param {Object} scoreRecord { score, time, attempts, details }
   */
  async saveScore(taskId, scoreRecord = {}) {
    if (!taskId || !this.account) return null;
    // YÊU CẦU: Không lưu dữ liệu chế độ khách
    if (this.account.isAnonymous) {
      console.info('[FirebaseService] Guest mode: Score is not saved to cloud or leaderboard.');
      return null;
    }
    const uid = this.account.uid || this.account.id;
    const newScore = Number(scoreRecord.score || 0);

    const record = {
      taskId,
      score: newScore,
      timeSeconds: scoreRecord.timeSeconds || 0,
      attempts: scoreRecord.attempts || 1,
      achievedAt: new Date().toISOString(),
      studentName: this.account.display_name || 'Học sinh'
    };

    // 1. Lưu Local
    const localScores = this.getLocalScores();
    const existing = localScores[taskId];
    const isNewBest = !existing || newScore > (existing.bestScore || 0);

    localScores[taskId] = {
      bestScore: isNewBest ? newScore : existing.bestScore,
      bestTime: isNewBest ? record.timeSeconds : existing.bestTime,
      lastAttemptAt: record.achievedAt,
      attempts: (existing?.attempts || 0) + 1,
      lastScore: newScore
    };
    this.saveLocalScores(localScores);

    // 2. Đồng bộ Realtime Database nếu online
    if (this.db && !this.offlineMode) {
      try {
        // Lưu vào nhánh user
        await this.db.ref(`users/${uid}/scores/${taskId}`).set(localScores[taskId]);

        // Nếu đạt kỷ lục mới -> Cập nhật Leaderboard
        if (isNewBest) {
          // Bảng xếp hạng theo bài
          await this.db.ref(`leaderboard/byTask/${taskId}/${uid}`).set({
            uid,
            displayName: this.account.display_name,
            score: newScore,
            timeSeconds: record.timeSeconds,
            achievedAt: record.achievedAt,
            classroomId: this.account.classroomId || null
          });

          // Tính tổng điểm tất cả các bài để cập nhật bảng xếp hạng Global
          let totalScore = 0;
          let completedTasksCount = 0;
          Object.values(localScores).forEach(s => {
            if (s && s.bestScore) {
              totalScore += Number(s.bestScore);
              completedTasksCount++;
            }
          });

          await this.db.ref(`leaderboard/global/${uid}`).set({
            uid,
            displayName: this.account.display_name,
            totalScore,
            completedTasksCount,
            lastUpdatedAt: record.achievedAt,
            classroomId: this.account.classroomId || null
          });
        }
      } catch (err) {
        console.warn('[FirebaseService] RTDB saveScore error:', err);
      }
    }

    return localScores[taskId];
  }

  /**
   * TẢI DANH SÁCH ĐIỂM SỐ CỦA HỌC SINH HIỆN TẠI
   */
  async loadUserScores() {
    let scores = this.getLocalScores();
    if (this.db && this.account?.uid && !this.offlineMode) {
      try {
        const snap = await this.db.ref(`users/${this.account.uid}/scores`).once('value');
        const val = snap.val();
        if (val) {
          scores = { ...scores, ...val };
          this.saveLocalScores(scores);
        }
      } catch (e) {
        console.warn('[FirebaseService] Could not load scores from cloud:', e);
      }
    }
    return scores;
  }

  /**
   * TẢI BẢNG XẾP HẠNG (LEADERBOARD)
   * @param {'global'|'task1-reach'|'task2-fix'|'task3-new'} category
   */
  async loadLeaderboard(category = 'global') {
    if (this.db && !this.offlineMode) {
      try {
        const path = category === 'global' ? 'leaderboard/global' : `leaderboard/byTask/${category}`;
        const snap = await this.db.ref(path).once('value');
        const data = snap.val();
        if (data && typeof data === 'object') {
          const list = Object.values(data);
          if (category === 'global') {
            return list.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
          } else {
            return list.sort((a, b) => {
              if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
              return (a.timeSeconds || 9999) - (b.timeSeconds || 9999);
            });
          }
        }
      } catch (e) {
        console.warn('[FirebaseService] loadLeaderboard from cloud error:', e);
      }
    }

    // Mock data phong phú cho chế độ Offline Demo
    return this.getMockLeaderboard(category);
  }

  /**
   * Mock dữ liệu Bảng Xếp Hạng khi offline hoặc mới khởi tạo
   */
  getMockLeaderboard(category = 'global') {
    const mockNames = [
      { name: 'Minh Anh', score: 2850, t1: 960, t2: 940, t3: 950 },
      { name: 'Gia Bảo', score: 2720, t1: 920, t2: 900, t3: 900 },
      { name: 'Khánh Linh', score: 2640, t1: 900, t2: 880, t3: 860 },
      { name: 'Đức Huy', score: 2510, t1: 880, t2: 830, t3: 800 },
      { name: 'Phương Thảo', score: 2420, t1: 850, t2: 800, t3: 770 },
      { name: 'Tuấn Khang', score: 2310, t1: 820, t2: 780, t3: 710 },
      { name: 'Bảo Ngọc', score: 2190, t1: 790, t2: 720, t3: 680 }
    ];

    if (category === 'global') {
      return mockNames.map((item, idx) => ({
        uid: `mock_${idx}`,
        displayName: item.name,
        totalScore: item.score,
        completedTasksCount: 3,
        lastUpdatedAt: new Date(Date.now() - idx * 3600000).toISOString()
      }));
    } else {
      const taskKey = category.includes('task1') ? 't1' : (category.includes('task2') ? 't2' : 't3');
      return mockNames.map((item, idx) => ({
        uid: `mock_${idx}`,
        displayName: item.name,
        score: item[taskKey] || 850,
        timeSeconds: 90 + idx * 25,
        achievedAt: new Date(Date.now() - idx * 3600000).toISOString()
      })).sort((a, b) => b.score - a.score);
    }
  }

  // =========================================================================
  // DÀNH CHO GIÁO VIÊN: QUẢN LÝ LỚP HỌC & THEO DÕI HỌC SINH
  // =========================================================================

  /**
   * LẤY THÔNG TIN PHÒNG HỌC CỦA GIÁO VIÊN
   */
  async getClassroomDetails(classroomId) {
    if (!classroomId) return null;

    if (this.db && !this.offlineMode) {
      try {
        const snap = await this.db.ref(`classrooms/${classroomId}`).once('value');
        return snap.val();
      } catch (e) {
        console.warn('[FirebaseService] getClassroomDetails error:', e);
      }
    }

    // Local fallback
    return {
      classroomId,
      teacherUid: this.account?.uid,
      teacherName: this.account?.display_name || 'Thầy/Cô',
      className: `Lớp học ${classroomId}`,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * LẤY DANH SÁCH TẤT CẢ HỌC SINH VÀ TIẾN ĐỘ TRONG LỚP (GIÁO VIÊN)
   */
  async getStudentsInClassroom(classroomId) {
    if (!classroomId) return [];

    let students = [];

    if (this.db && !this.offlineMode) {
      try {
        // 1. Lấy danh sách uid học sinh thuộc lớp
        const snapCls = await this.db.ref(`classrooms/${classroomId}/students`).once('value');
        const studentsObj = snapCls.val() || {};
        const uids = Object.keys(studentsObj);

        // 2. Lấy thông tin profile, presence, scores của từng học sinh
        for (const uid of uids) {
          try {
            const pSnap = await this.db.ref(`users/${uid}/profile`).once('value');
            const prof = pSnap.val();
            if (!prof) continue;

            const presenceSnap = await this.db.ref(`presence/${uid}`).once('value');
            const presence = presenceSnap.val() || { online: false, lastSeen: prof.lastLoginAt };

            const scoresSnap = await this.db.ref(`users/${uid}/scores`).once('value');
            const scores = scoresSnap.val() || {};

            const sessSnap = await this.db.ref(`users/${uid}/sessions`).limitToLast(5).once('value');
            const sessionsObj = sessSnap.val() || {};
            const sessions = Object.values(sessionsObj).sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));

            // Tính tổng điểm
            let totalScore = 0;
            let tasksCompleted = 0;
            Object.values(scores).forEach(s => {
              if (s && s.bestScore) {
                totalScore += Number(s.bestScore);
                tasksCompleted++;
              }
            });

            students.push({
              uid,
              displayName: prof.displayName || 'Học sinh',
              username: prof.username || '',
              online: presence.online === true,
              lastSeen: presence.lastSeen || prof.lastLoginAt,
              currentTask: presence.currentTask || 'Nghỉ ngơi',
              totalScore,
              tasksCompleted,
              scores,
              recentSessions: sessions
            });
          } catch (itemErr) {
            console.warn(`Error loading student ${uid}:`, itemErr);
          }
        }

        if (students.length > 0) return students;
      } catch (err) {
        console.warn('[FirebaseService] getStudentsInClassroom error:', err);
      }
    }

    // Mock students cho offline/demo
    return [
      {
        uid: 'hs_01',
        displayName: 'Nguyễn Minh Anh',
        username: 'minhanh01',
        online: true,
        lastSeen: new Date().toISOString(),
        currentTask: 'Task 1: Hành trình đến đích',
        totalScore: 2850,
        tasksCompleted: 3,
        scores: {
          'task1-reach': { bestScore: 960, attempts: 2 },
          'task2-fix': { bestScore: 940, attempts: 3 },
          'task3-new': { bestScore: 950, attempts: 2 }
        },
        recentSessions: [
          { sessionId: 's1', taskTitle: 'Hành trình đến đích', startedAt: new Date(Date.now() - 600000).toISOString(), summary: { finalSuccess: true, totalAttempts: 2, totalTimeSeconds: 120 } }
        ]
      },
      {
        uid: 'hs_02',
        displayName: 'Trần Gia Bảo',
        username: 'giabao2026',
        online: true,
        lastSeen: new Date().toISOString(),
        currentTask: 'Task 2: Chuyến đi bất ngờ',
        totalScore: 2720,
        tasksCompleted: 3,
        scores: {
          'task1-reach': { bestScore: 920, attempts: 3 },
          'task2-fix': { bestScore: 900, attempts: 4 },
          'task3-new': { bestScore: 900, attempts: 3 }
        },
        recentSessions: []
      },
      {
        uid: 'hs_03',
        displayName: 'Lê Khánh Linh',
        username: 'khanhlinh',
        online: false,
        lastSeen: new Date(Date.now() - 7200000).toISOString(),
        currentTask: 'Nghỉ ngơi',
        totalScore: 2640,
        tasksCompleted: 3,
        scores: {
          'task1-reach': { bestScore: 900, attempts: 2 },
          'task2-fix': { bestScore: 880, attempts: 5 }
        },
        recentSessions: []
      },
      {
        uid: 'hs_04',
        displayName: 'Phạm Đức Huy',
        username: 'duchuy',
        online: false,
        lastSeen: new Date(Date.now() - 86400000).toISOString(),
        currentTask: 'Nghỉ ngơi',
        totalScore: 1710,
        tasksCompleted: 2,
        scores: {
          'task1-reach': { bestScore: 880, attempts: 4 },
          'task2-fix': { bestScore: 830, attempts: 6 }
        },
        recentSessions: []
      }
    ];
  }

  // =========================================================================
  // REALTIME DATABASE DATA SYNC (HỌC TẬP, PHIÊN LÀM BÀI, NHẬT KÝ POLYA)
  // =========================================================================

  /**
   * LƯU / ĐỒNG BỘ PHIÊN HỌC TẬP LÊN REALTIME DATABASE
   */
  async saveSession(session) {
    if (!session || !session.sessionId) return;
    // YÊU CẦU: Không lưu dữ liệu chế độ khách
    if (this.account?.isAnonymous) {
      console.info('[FirebaseService] Guest mode: Session log is not saved.');
      return;
    }
    this.saveSessionLocally(session);

    if (this.db && this.account && !this.offlineMode) {
      try {
        const sanitized = this.sanitizeForFirebase(session);
        const uid = this.account.uid || this.account.id;

        const userSessionRef = this.db.ref(`users/${uid}/sessions/${session.sessionId}`);
        await userSessionRef.set(sanitized);

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
   */
  async saveTaskProgress(taskId, progressData = {}) {
    if (!taskId) return;
    // YÊU CẦU: Không lưu dữ liệu chế độ khách
    if (this.account?.isAnonymous) {
      console.info('[FirebaseService] Guest mode: Task progress is not saved.');
      return;
    }
    const uid = this.account?.uid || this.account?.id || 'local_user';

    const record = {
      taskId,
      completed: true,
      updatedAt: new Date().toISOString(),
      ...progressData
    };

    try {
      const allProg = JSON.parse(localStorage.getItem(this.STORAGE_PROGRESS_KEY) || '{}');
      allProg[taskId] = record;
      localStorage.setItem(this.STORAGE_PROGRESS_KEY, JSON.stringify(allProg));
    } catch (_) {}

    if (this.db && this.account && !this.offlineMode) {
      try {
        await this.db.ref(`users/${uid}/progress/${taskId}`).set(record);
      } catch (err) {
        console.warn('[FirebaseService] Realtime DB saveTaskProgress error:', err);
      }
    }
  }

  /**
   * TẢI TIẾN ĐỘ HOÀN THÀNH CỦA HỌC SINH
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
      localStorage.setItem('rml_user_role', account.role || 'student');
      if (account.classroomId) {
        localStorage.setItem('rml_classroom_id', account.classroomId);
      }
      if (account.className || account.class_name) {
        localStorage.setItem('rml_user_class', account.className || account.class_name);
      }
      if (account.schoolName) {
        localStorage.setItem('rml_user_school', account.schoolName);
      }
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
      localStorage.removeItem('rml_user_role');
      localStorage.removeItem('rml_classroom_id');
      localStorage.removeItem('rml_user_class');
      localStorage.removeItem('rml_user_school');
    } catch (_) {}
  }

  getLocalScores() {
    try {
      const raw = localStorage.getItem(this.STORAGE_SCORES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveLocalScores(scores) {
    try {
      localStorage.setItem(this.STORAGE_SCORES_KEY, JSON.stringify(scores || {}));
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

  registerOffline({ displayName, username, email, password, role = 'student', classroomId = '', className = '', schoolName = '' }) {
    try {
      const users = JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY) || '{}');
      const key = username.toLowerCase();
      if (users[key]) {
        throw new Error('Tên đăng nhập này đã được sử dụng trên thiết bị này.');
      }
      const uid = `local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const finalClassroom = role === 'teacher' && !classroomId ? this.generateClassCode() : classroomId;

      const account = {
        id: uid,
        uid,
        username: key,
        display_name: displayName,
        email,
        password,
        role,
        classroomId: finalClassroom || null,
        isAnonymous: false,
        className: className || null,
        schoolName: schoolName || null,
        class_name: className || null
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
        role: 'student',
        classroomId: null,
        isAnonymous: false,
        className: null,
        schoolName: null,
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

  sanitizeForFirebase(obj) {
    if (obj === null || obj === undefined) return null;
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (value === undefined) return null;
      return value;
    }));
  }

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
      case 'auth/popup-closed-by-user':
        return 'Cửa sổ đăng nhập đã bị đóng trước khi hoàn thành.';
      case 'auth/cancelled-popup-request':
        return 'Yêu cầu đăng nhập trước đó đã bị hủy.';
      case 'auth/popup-blocked':
        return 'Trình duyệt đã chặn cửa sổ đăng nhập Popup. Vui lòng cho phép mở popup và thử lại.';
      case 'auth/account-exists-with-different-credential':
        return 'Tài khoản này đã tồn tại với một phương thức đăng nhập khác. Vui lòng đăng nhập bằng phương thức tương ứng.';
      case 'auth/operation-not-allowed':
        return 'Phương thức đăng nhập này chưa được kích hoạt trong Firebase Console. Vui lòng bật Google / GitHub Provider trong phần Authentication > Sign-in method.';
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
