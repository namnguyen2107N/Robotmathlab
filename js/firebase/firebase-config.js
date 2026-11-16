/**
 * ROBOT MATH LAB - FIREBASE CONFIGURATION
 * 
 * Hướng dẫn cấu hình:
 * 1. Đăng nhập vào Firebase Console: https://console.firebase.google.com/
 * 2. Tạo một Project mới (hoặc chọn project có sẵn).
 * 3. Thêm một Web App (biểu tượng </>), copy cấu hình firebaseConfig.
 * 4. Bật Authentication > Sign-in method:
 *    - Email/Password: Enable
 *    - Anonymous: Enable (cho chế độ Học sinh khách / Demo)
 * 5. Bật Realtime Database > Create Database (chọn location Singapore hoặc gần nhất):
 *    - Import file database.rules.json vào tab Rules.
 * 6. Dán các thông số cấu hình vào bên dưới hoặc gán vào window.FIREBASE_CONFIG.
 */
(function (global) {
  'use strict';

  // Cấu hình mẫu / Mặc định cho Firebase Web App
  const defaultFirebaseConfig = {
    apiKey: "AIzaSyCEJAVdhofGxrZYns7io6igIO-4Aieb7JI",
    authDomain: "robotmathlab.firebaseapp.com",
    databaseURL: "https://robotmathlab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "robotmathlab",
    storageBucket: "robotmathlab.firebasestorage.app",
    messagingSenderId: "59077093864",
    appId: "1:59077093864:web:4c9843a858cdf845de5c5d"
  };

  // Đọc cấu hình tuỳ chỉnh nếu người dùng đã lưu trong localStorage
  const savedCustomConfig = (() => {
    try {
      const raw = localStorage.getItem('rml_firebase_config_custom');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const activeConfig = global.FIREBASE_CONFIG || savedCustomConfig || defaultFirebaseConfig;

  // Kiểm tra cấu hình có phải là thông số thật hay là template
  function isConfigReady(config) {
    if (!config || typeof config !== 'object') return false;
    const key = config.apiKey || '';
    const dbUrl = config.databaseURL || '';
    return (
      key.length > 20 &&
      !key.includes('YOUR_API_KEY_HERE') &&
      dbUrl.length > 10 &&
      !dbUrl.includes('robot-math-lab-default-rtdb')
    );
  }

  const isConfigured = isConfigReady(activeConfig);

  global.RML_FIREBASE_CONFIG = activeConfig;
  global.RML_FIREBASE_CONFIGURED = isConfigured;

  // Tiện ích hỗ trợ người dùng cập nhật cấu hình trực tiếp từ giao diện hoặc console
  global.RML_SET_FIREBASE_CONFIG = function (config) {
    if (config && typeof config === 'object') {
      try {
        localStorage.setItem('rml_firebase_config_custom', JSON.stringify(config));
        global.RML_FIREBASE_CONFIG = config;
        global.RML_FIREBASE_CONFIGURED = isConfigReady(config);
        console.log('[FirebaseConfig] Updated Firebase config. Reloading page...');
        location.reload();
        return true;
      } catch (e) {
        console.error('[FirebaseConfig] Failed to save config:', e);
        return false;
      }
    }
    return false;
  };

})(typeof window !== 'undefined' ? window : globalThis);
