# 🤖 ROBOT MATH LAB — PHÒNG THÍ NGHIỆM TOÁN HỌC & ROBOT ẢO - RML-TEACHER-2026

> **Nền tảng mô phỏng toán chuyển động và điều khiển robot ảo dành cho học sinh tiểu học, tích hợp phương pháp giải quyết vấn đề Polya 4 bước, xác thực Firebase Authentication và lưu trữ đồng bộ dữ liệu thời gian thực trên Firebase Realtime Database.**

---

## 📑 MỤC LỤC
1. [Giới thiệu dự án](#-giới-thiệu-dự-án)
2. [Triết lý sư phạm & Mô hình toán học](#-triết-lý-sư-phạm--mô-hình-toán-học)
3. [Cấu trúc dự án sau khi chuẩn hoá](#-cấu-trúc-dự-án-sau-khi-chuẩn-hoá)
4. [Hai tính năng cập nhật chính](#-hai-tính-năng-cập-nhật-chính)
   - [4.1. Hệ thống Đăng ký, Đăng nhập & Quản lý tài khoản](#41-hệ-thống-đăng-ký-đăng-nhập--quản-lý-tài-khoản)
   - [4.2. Tích hợp Firebase Web App & Realtime Database](#42-tích-hợp-firebase-web-app--realtime-database)
5. [Cấu trúc dữ liệu trên Firebase Realtime Database](#-cấu-trúc-dữ-liệu-trên-firebase-realtime-database)
6. [Hướng dẫn cài đặt & Khởi chạy cục bộ](#-hướng-dẫn-cài-đặt--khởi-chạy-cục-bộ)
7. [Hướng dẫn cấu hình Firebase từ A đến Z](#-hướng-dẫn-cấu-hình-firebase-từ-a-đến-z)
8. [Hệ thống kiểm thử (Testing Suite)](#-hệ-thống-kiểm-thử-testing-suite)
9. [Hướng dẫn triển khai (Deployment)](#-hướng-dẫn-triển-khai-deployment)
10. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)

---

## 🌟 GIỚI THIỆU DỰ ÁN

**Robot Math Lab** là ứng dụng web tương tác học tập trực quan kết hợp giữa **Toán học chuyển động đều** (Toán lớp 4, 5) và **Mô phỏng Robotics**. Dự án giúp học sinh tiểu học:
- Vượt qua sự khô khan của các bài toán chuyển động $s = v \times t$ bằng cách trực tiếp "lập trình" thông số vận tốc, thời gian cho robot chạy trên đường đua ảo 2D/3D.
- Rèn luyện tư duy logic thông qua **Quy trình 4 bước giải quyết vấn đề của George Polya**.
- Tra cứu từ vựng STEM song ngữ (Việt - Anh) có phát âm giọng chuẩn bản ngữ qua Web Speech API.
- Xem lại toàn bộ hành trình tư duy và nỗ lực làm bài qua **Nhật ký học tập (Learning Journal)** chuẩn mã PS1–PS11.

---

## 🎓 TRIẾT LÝ SƯ PHẠM & MÔ HÌNH TOÁN HỌC

### 1. Quy trình 4 bước Polya (Polya's Problem-Solving Steps)
Ứng dụng dẫn dắt học sinh giải quyết nhiệm vụ toán học tuần tự qua 4 bước:
1. **Bước 1 - Hiểu bài toán (Understand the Problem):** Học sinh xác định dữ kiện đã cho (quãng đường $s$, vận tốc $v$, thời gian $t$), đại lượng cần tìm và các điều kiện ràng buộc.
2. **Bước 2 - Lập kế hoạch (Devise a Plan):** Lựa chọn công thức phù hợp ($s = v \times t$, $t = s \div v$, $v = s \div t$), đổi đơn vị đo (km sang m, phút sang giây), tính toán kết quả kỳ vọng.
3. **Bước 3 - Thực hiện kế hoạch & Mô phỏng (Carry Out the Plan & Simulation):** Cài đặt thông số cho Robot và nhấn nút cho Robot chạy trên đường chạy ảo. Quan sát trực quan quãng đường robot đi được so với vạch đích.
4. **Bước 4 - Nhìn lại & Đánh giá (Look Back & Reflect):** Đối chiếu kết quả robot chạy với yêu cầu đề bài. Nếu chưa chạm đích hoặc chạy quá đích, hệ thống hỗ trợ học sinh chẩn đoán nguyên nhân, tính toán lại và thực hiện thử nghiệm điều chỉnh.

### 2. Các nhiệm vụ học tập tiêu biểu
- **Nhiệm vụ 1: Hành trình đến đích (Reach the Goal):** Robot di chuyển quãng đường $42\text{ m}$ với vận tốc $7\text{ m/s}$. Học sinh tính thời gian cần cài đặt ($t = 42 \div 7 = 6\text{ giây}$).
- **Nhiệm vụ 2: Chuyến đi bất ngờ (The Unexpected Journey):** Quãng đường $1.2\text{ km} = 1200\text{ m}$, vận tốc $4\text{ m/s}$. Thử nghiệm chạy $240\text{ giây}$ chỉ đến $960\text{ m}$. Học sinh chẩn đoán độ lệch và điều chỉnh thời gian chính xác là $300\text{ giây} = 5\text{ phút}$.
- **Nhiệm vụ 3: Thử thách đúng giờ (The On-Time Challenge):** Robot cần đến địa điểm cách $1.5\text{ km}$ ($1500\text{ m}$) trong đúng $5\text{ phút}$ ($300\text{ giây}$). Học sinh tính vận tốc robot cần di chuyển ($v = 1500 \div 300 = 5\text{ m/s}$).

---

## 📂 CẤU TRÚC DỰ ÁN SAU KHI CHUẨN HOÁ

Dự án được cấu trúc lại một cách khoa học, tách bạch rõ ràng giữa tầng hiển thị giao diện, các bộ máy sư phạm (engines), tầng dịch vụ Firebase Cloud, tài nguyên dữ liệu và hệ thống kiểm thử:

```
Robotmathlab/
│
├── index.html                     # Trang web đơn (Single Page App) hoàn chỉnh
├── serve.js                       # HTTP server phát triển cục bộ có cấu hình bảo mật CSP
├── package.json                   # Định nghĩa dependencies, cấu hình engines và scripts test
├── package-lock.json              # Khóa phiên bản dependencies
│
├── database.rules.json            # Quy tắc bảo mật dữ liệu Firebase Realtime Database
├── firebase.json                  # Cấu hình triển khai Firebase Hosting & Database
├── vercel.json                    # Cấu hình triển khai Vercel (Routing & Security Headers)
├── .env.example                   # Biến môi trường mẫu
│
├── js/                            # Mã nguồn JavaScript frontend
│   ├── app.js                     # Bộ điều khiển chính (AppController) và định tuyến hash
│   ├── auth.js                    # Giao diện cổng đăng nhập/đăng ký & liên kết Firebase
│   ├── feedback-engine.js         # Bộ máy phản hồi thông minh khích lệ học sinh
│   ├── i18n.js                    # Đa ngôn ngữ song ngữ Tiếng Việt & Tiếng Anh
│   ├── kinematics-model.js        # Mô hình vật lý chuyển động đều toán học
│   ├── log-engine.js              # Ghi nhận tiến trình học tập chuẩn PS1-PS11 & Nhật ký
│   ├── math-hints.js              # Hệ thống gợi ý 3 tầng (Định hướng - Chiến lược - Tính toán)
│   ├── polya-engine.js            # Máy trạng thái chuyển bước Polya 1 -> 2 -> 3 -> 4
│   ├── simulation-engine.js       # Mô phỏng đường đua Robot ảo 2D trên HTML5 Canvas
│   ├── simulation-3d.js           # Mô phỏng Robot ảo không gian 3D (Three.js)
│   ├── simulation-3d-loader.js    # Trình nạp mô phỏng 3D linh hoạt
│   ├── simulation-3d.bundle.js    # Bản dựng bundle 3D tối ưu hóa
│   ├── sound-fx.js                # Bộ tạo hiệu ứng âm thanh sống động (Web Audio API)
│   ├── task-engine.js             # Quản lý giao diện bài học, kiểm tra đáp án & thước đo
│   ├── vocab-support.js           # Từ điển STEM Anh - Việt tương tác & Flashcard
│   │
│   ├── firebase/                  # TẦNG DỊCH VỤ FIREBASE
│   │   ├── firebase-config.js     # Khởi tạo & nạp thông số Firebase Web App
│   │   └── firebase-service.js    # Singleton quản lý Firebase Auth & Realtime Database Sync
│   │
│   └── tasks/                     # Dữ liệu cấu hình từng bài học
│       ├── task1-reach.js         # Cấu hình Nhiệm vụ 1
│       ├── task2-fix.js           # Cấu hình Nhiệm vụ 2
│       └── task3-new.js           # Cấu hình Nhiệm vụ 3
│
├── css/                           # Bảng định dạng giao diện (CSS)
│   ├── style.css                  # Giao diện tổng thể thân thiện cho học sinh tiểu học
│   ├── splash.css                 # Màn hình khởi động phong cách Retro Pixel Arcade 8-bit
│   ├── auth.css                   # Giao diện hộp thoại đăng nhập, đăng ký & trạng thái DB
│   └── mobile.css                 # Tối ưu hóa hiển thị trên máy tính bảng và điện thoại
│
├── data/                          # Dữ liệu tĩnh
│   └── vocab.json                 # Từ điển thuật ngữ Toán & Robot song ngữ
│
├── tests/                         # BỘ KIỂM THỬ TỰ ĐỘNG (TEST SUITE)
│   ├── unit/                      # Kiểm thử đơn vị (Unit Tests)
│   │   ├── kinematics.test.mjs    # Kiểm thử tính toán mô hình vật lý chuyển động
│   │   ├── password.test.mjs      # Kiểm thử mã hóa và xác thực mật khẩu
│   │   └── validate.test.mjs      # Kiểm thử chuẩn hoá dữ liệu nhập
│   ├── integration/               # Kiểm thử tích hợp (Integration Tests)
│   │   ├── test-splash-welcome.js # Kiểm thử màn hình khởi động, robot Sparky và song ngữ
│   │   ├── test-track-flow.js     # Kiểm thử toàn diện quy trình 3 nhiệm vụ toán học
│   │   └── test-firebase-service.js # Kiểm thử Auth, Realtime DB sync & Chế độ Offline
│   └── manual/                    # Kiểm thử giao diện thủ công
│       └── 3d-smoke.html          # Khung kiểm tra đồ họa 3D Three.js
│
├── docs/                          # Tài liệu kỹ thuật dự án
│   ├── 3d-simulation.md           # Hướng dẫn kiến trúc mô phỏng 3D
│   ├── auth-setup.md              # Ghi chú xác thực & triển khai
│   └── backend-php-plan.md        # Tài liệu tham khảo kiến trúc cũ
│
└── lib/ & api/ & scripts/ & db/   # Các mô-đun tiện ích mở rộng & schema lưu trữ
```

---

## 🚀 HAI TÍNH NĂNG CẬP NHẬT CHÍNH

### 4.1. Hệ thống Đăng ký, Đăng nhập & Quản lý tài khoản Tích hợp trên Màn hình Start
- **Tích hợp trực tiếp trên Màn hình Start (Direct Start Screen Integration):**
  - Loại bỏ hoàn toàn modal overlay tối màu che khuất giao diện. Khung đăng nhập, đăng ký và hồ sơ người dùng được gắn kết tự nhiên ngay bên trong Bảng điều khiển Arcade Signboard của màn hình Start (`#splash-screen`).
  - Khi chưa đăng nhập: Hiển thị ngay 2 tab `[ 🔑 Đăng nhập ]` và `[ ✨ Tạo tài khoản ]` với đầy đủ nút Đăng nhập nhanh Google, GitHub và Chế độ Khách.
  - Khi đã đăng nhập: Hiển thị Thẻ Chào mừng Hồ sơ Học tập với avatar robot, họ tên, trường học, lớp học, vai trò, huy hiệu đồng bộ dữ liệu và nút bấm 3D **START ▶** cỡ lớn để vào học ngay, cùng nút `🚪 Đổi tài khoản khác` tiện lợi.
- **Bổ sung trường thông tin Trường học & Lớp học khi Đăng ký (Bắt buộc):**
  - **Trường học (`school_name`):** Bắt buộc đối với cả Học sinh và Giáo viên (Ví dụ: `Tiểu học Chu Văn An`, `TH Dịch Vọng A`).
  - **Lớp học (`class_name`):**
    - Học sinh: Nhập lớp đang học (Ví dụ: `Lớp 4A1`, `Lớp 5B`).
    - Giáo viên: Nhập lớp hoặc khối phụ trách (Ví dụ: `Khối 4`, `Lớp 5A`).
  - Dữ liệu được lưu trữ và đồng bộ an toàn tại `/users/{uid}/profile/schoolName` và `/users/{uid}/profile/className`.
- **Đăng ký tài khoản (Sign Up):**
  - Học sinh nhập **Tên hiển thị**, **Trường học**, **Lớp của em**, **Tên đăng nhập** hoặc **Email**, và **Mật khẩu** (tối thiểu 6 ký tự).
  - Thân thiện với học sinh tiểu học: nếu các em chưa có email cá nhân, chỉ cần nhập tên đăng nhập đơn giản (ví dụ: `minhanh01`), hệ thống sẽ tự động liên kết tài khoản an toàn.
  - Tích hợp kiểm tra tính hợp lệ dữ liệu và hộp chọn cam kết bảo mật học tập.
- **Đăng nhập (Sign In):**
  - Đăng nhập linh hoạt bằng Tên đăng nhập hoặc Email cùng Mật khẩu.
  - Tự động duy trì phiên làm việc (`onAuthStateChanged`), không bắt học sinh phải đăng nhập lại khi tải lại trang.
- **Chế độ Học sinh khách (Guest Mode - Quick Explore):**
  - Cung cấp nút bấm tiện lợi **"🚀 Trải nghiệm ngay (Chế độ Khách)"**.
  - Cho phép học sinh, giáo viên thử nghiệm ngay lập tức các bài học với 1 cú click mà không bắt buộc tạo tài khoản.
  - **Chính sách dữ liệu khách:** Hệ thống **hoàn toàn không lưu dữ liệu** của phiên khách lên Cloud hay Bảng xếp hạng để tránh rác dữ liệu.
- **Đăng nhập một chạm qua Google (OAuth Social Sign-In):**
  - Hỗ trợ đăng nhập / tạo tài khoản nhanh qua tài khoản Google một cách an toàn và thuận tiện.
  - Giao diện được tối ưu hóa: ẩn hoàn toàn các đường line/divider phân tách thô cứng, viền nét đứt được loại bỏ để mang lại bố cục tối giản, liền mạch, hiện đại và sáng sủa nhất cho học sinh và giáo viên.
  - Tự động đồng bộ thông tin hồ sơ và tạo mã lớp học cho giáo viên khi đăng nhập lần đầu.
- **Nút Đăng xuất ở màn hình Start:**
  - Bổ sung nút **🚪 Đăng xuất** trực tiếp trên thanh công cụ của màn hình Arcade Start Screen để người dùng có thể đổi tài khoản ngay khi vào web.
- **Quản lý hồ sơ học sinh (Profile Management):**
  - Hiển thị thông tin tài khoản đang đăng nhập trong phần Cài đặt (Settings).
  - Cho phép học sinh đổi tên hiển thị bất kỳ lúc nào; tên mới được đồng bộ ngay lên Firebase Realtime Database.
  - Tính năng Đăng xuất (Sign Out) an toàn và xóa bộ nhớ đệm cục bộ khi cần đổi tài khoản trên máy tính dùng chung ở trường học.

---

### 4.2. Tích hợp Firebase Web App & Realtime Database
- **Nền tảng Firebase Web App:**
  - Sử dụng trực tiếp bộ Firebase SDK chính thức (v10 compat: App, Auth, Database) thông qua Google CDN, không phát sinh gánh nặng biên dịch phức tạp.
  - Phù hợp với kiến trúc web tĩnh triển khai nhanh, tải trang mượt mà trên mọi thiết bị máy tính trường học.
- **Đồng bộ thời gian thực (Realtime Database Sync):**
  - Mỗi thao tác của học sinh (bắt đầu bài, chọn công thức, nhập thông số, chạy mô phỏng, xem gợi ý, tra từ điển, hoàn thành bài) đều được bộ máy `LogEngine` tự động đồng bộ lên Firebase Realtime Database.
  - Lưu trữ đồng thời tại 2 cấp:
    1. Cấp độ người dùng: `/users/{uid}/sessions/{sessionId}` và `/users/{uid}/progress/{taskId}` để bảo vệ quyền riêng tư và theo dõi tiến độ cá nhân.
    2. Cấp độ tổng quan: `/sessions/{sessionId}` hỗ trợ giáo viên theo dõi tiến trình làm bài của lớp học.
- **Giám sát kết nối mạng trực tiếp (`.info/connected`):**
  - Tự động theo dõi trạng thái kết nối mạng của Realtime Database.
  - Hiển thị huy hiệu trực quan trên giao diện: **"🔥 Firebase Realtime: Đã kết nối"** (màu xanh lá) hoặc **"⚡ Chế độ Cục bộ (Local Demo)"** (màu vàng hổ phách).
- **Cơ chế dự phòng Offline / Local thông minh (Zero-Break Fallback):**
  - Nếu người dùng chưa nạp Firebase API key hoặc khi mất mạng internet, `FirebaseService` sẽ tự động chuyển sang chế độ lưu trữ cục bộ (`localStorage`).
  - Đảm bảo **ứng dụng không bao giờ bị đứng, treo hay báo lỗi màn hình trắng**; học sinh vẫn làm bài và trải nghiệm mô phỏng bình thường!

---

### 4.3. Phân quyền vai trò: Giáo Viên (Teacher) & Học Sinh (Student)
- **Tài khoản Học Sinh (Student):**
  - Mặc định khi đăng ký, có thể nhập **Mã Lớp** (Classroom Code, VD: `CLASS-A7X3`) do thầy cô cung cấp.
  - Được lưu điểm số, huy hiệu sao (1-3 sao), lịch sử giải toán và tham gia Bảng Xếp Hạng.
- **Tài khoản Giáo Viên (Teacher):**
  - Đăng ký bằng cách chọn tab "👨‍🏫 Giáo Viên" và nhập Mã xác thực giáo viên của trường học (mặc định: `RML-TEACHER-2026`).
  - Hệ thống tự động cấp phát cho giáo viên một **Mã Lớp Học duy nhất** (VD: `CLASS-A7X3`) để chia sẻ cho các em học sinh.
  - Tự động chuyển hướng vào **Bảng Điều Khiển Giáo Viên (Teacher Dashboard)** sau khi đăng nhập.

---

### 4.4. Bảng Điều Khiển Giáo Viên (Teacher Pedagogical Dashboard)
- **Giám sát trực tuyến thời gian thực (Live Presence):**
  - Theo dõi chính xác bao nhiêu học sinh đang online trong giờ học (🟢 Online) và học sinh đã rời phòng (⚪ Offline kèm thời gian).
  - Biết ngay học sinh đang làm bài nào hoặc đang nghỉ ngơi.
- **Thống kê tổng quan 4 chỉ số lớp học:**
  - 🟢 Số học sinh đang hoạt động.
  - 👥 Tổng số học sinh trong lớp.
  - ⭐ Điểm trung bình của cả lớp.
  - 📝 Tổng số bài toán đã được học sinh chinh phục.
- **Bảng danh sách học sinh & Nhật ký chi tiết:**
  - Xem danh sách toàn bộ học sinh trong lớp kèm điểm số và tiến độ.
  - Bấm **"🔍 Xem bài làm"** để mở modal chi tiết: xem lại từng phiên giải toán (thời gian làm bài, số lần thử nghiệm, thành công hay chưa, các bước tư duy Polya).
- **Sao chép mã lớp 1-click:** Nút tiện lợi giúp giáo viên sao chép mã lớp gửi cho học sinh hoặc phụ huynh.

---

### 4.5. Hệ Thống Chấm Điểm 1000 Điểm Dựa Trên Thời Gian Bắt Đầu Tới Hoàn Thành
- **Bộ máy tính điểm Polya (`ScoringEngine`):**
  - Thang điểm tối đa chuẩn hóa: **1000 điểm / bài học**.
  - **Thời gian thực hiện ($T$ giây):** Được đo đạc tự động từ thời điểm học sinh bấm bắt đầu bài học (`startedAt`) tới khi hoàn thành kiểm chứng Bước 4 (`completedAt`).
  - **Mốc thời gian chuẩn (Benchmark Target Time $T_{\text{target}}$):**
    - Bài 1 (Reach the Goal): $T_{\text{target}} = 45$ giây (bài toán cơ bản $s = v \times t$).
    - Bài 2 (The Unexpected Journey): $T_{\text{target}} = 90$ giây (bài toán có bước dừng sớm và gỡ lỗi).
    - Bài 3 (The On-Time Challenge): $T_{\text{target}} = 60$ giây (bài toán đổi đơn vị và tìm vận tốc).
  - **Bốn thành phần cấu thành điểm số:**
    1. **Điểm hoàn thành cốt lõi (Base Completion):** **500 điểm** khi hoàn thành đúng 4 bước Polya (`finalSuccess === true`).
    2. **Điểm tốc độ thời gian (Duration / Speed Score):** **Tối đa 300 điểm**.
       - Nếu $T \le T_{\text{target}}$: Đạt tối đa **300 điểm**.
       - Nếu $T > T_{\text{target}}$: Cứ mỗi 10 giây trễ hơn trừ 15 điểm: $\text{timeBonus} = 300 - \lfloor(T - T_{\text{target}}) / 10\rfloor \times 15$.
       - **Sàn bảo hiểm thời gian:** Tối thiểu **50 điểm** (đảm bảo khích lệ học sinh giải cẩn thận).
    3. **Điểm độ chính xác & số lần thử nghiệm (Accuracy Score):** **Tối đa 150 điểm**.
       - Thành công ngay lần 1: **150 điểm**.
       - Lần 2: **110 điểm**, Lần 3: **70 điểm**, Từ lần 4 trở lên: **30 điểm**.
    4. **Điểm độc lập tự lực (Self-Reliance Score):** **Tối đa 50 điểm**.
       - Khởi điểm: **50 điểm**.
       - Mỗi gợi ý (Hint) sử dụng: trừ 15 điểm.
       - Mỗi lần quay lại bước trước: trừ 10 điểm (Sàn tối thiểu: 0 điểm).
  - **Hệ thống Xếp Hạng Sao (Star Rating):**
    - ⭐⭐⭐ **3 Sao (Xuất Sắc):** $\ge 850$ điểm.
    - ⭐⭐ **2 Sao (Khá Giỏi):** $650 - 849$ điểm.
    - ⭐ **1 Sao (Hoàn Thành):** $< 650$ điểm.
  - **Hiển thị trực quan trên Modal Hoàn Thành Nhiệm Vụ:**
    - Cúp chiến thắng & Banner sao động.
    - Điểm số to rõ ràng: `⭐ 955 pts`.
    - Thời gian giải bài thực tế và mốc chuẩn: `⏱️ 75s (Chuẩn: 45s)`.
    - Bảng chi tiết 4 thành phần điểm (Hoàn thành, Tốc độ, Độ chính xác, Tự lực).
    - Lời khen ngợi sư phạm song ngữ (Anh - Việt).

---

### 4.6. Rà Soát & Khắc Phục Triệt Để Toàn Bộ Lỗi Điều Hướng (Navigation & Routing Engine)
- **Khắc phục lỗi kẹt màn hình `#start`:** Router hỗ trợ tải trực tiếp mọi hash URL hợp lệ (`#hub`, `#ranking`, `#teacher`, `#task/...`) mà không bị cưỡng ép viết đè về `#start`.
- **Phân luồng nút START thông minh theo vai trò:**
  - Nếu là tài khoản **Giáo Viên**: Nút START trên màn hình khởi động đưa thẳng vào **Teacher Dashboard (`#teacher`)**.
  - Nếu là tài khoản **Học Sinh**: Nút START đưa vào **Mission Hub (`#hub`)**.
- **Điều hướng Logo Thương Hiệu (`#brand-home-link`):** Bấm vào logo Robot Math Lab trên header sẽ đưa Giáo Viên về `#teacher` và đưa Học Sinh về `#hub`, luôn phản hồi ngay cả khi đang cùng route.
- **Tự động dọn dẹp Modal & Khôi phục thanh cuộn:** Mỗi khi chuyển trang giữa `#hub`, `#ranking`, `#teacher`, `#start`, hệ thống tự động:
  - Dừng và giải phóng mô phỏng đang chạy ngầm (`sim.destroy()`).
  - Đóng toàn bộ các backdrop modal đang mở (`settings-modal`, `teacher-student-modal`, `learning-journal`, `feedback-modal`).
  - Gỡ bỏ thuộc tính khóa cuộn `overflow: hidden`, đảm bảo trang luôn cuộn mượt mà.
- **Đóng modal thân thiện:** Hỗ trợ click ra ngoài backdrop hoặc nhấn phím `Escape` để đóng các modal chi tiết.
- **Nút Arcade từ Cài đặt:** Kích hoạt nút **"Mở ▶"** trong Settings Modal để quay lại màn hình Arcade 8-bit bất kỳ lúc nào.

---

### 4.7. Bảng Xếp Hạng Arcade (Ranking)
- **Bục vinh quang 3D (Podium Top 3):** Vinh danh 3 bạn dẫn đầu với hiệu ứng 🥇 Vàng, 🥈 Bạc, 🥉 Đồng.
- **Bảng danh sách chi tiết:** Hiển thị thứ hạng các bạn tiếp theo, tự động làm nổi bật (highlight) vị trí của học sinh đang đăng nhập.
- **Bộ lọc linh hoạt:** Xem Xếp hạng tổng (Overall) hoặc Xếp hạng theo từng bài (Task 1, Task 2, Task 3).
- **Huy hiệu điểm trên thẻ bài học:** Hiển thị điểm cao nhất (Best Score) của học sinh trực tiếp trên từng thẻ nhiệm vụ ở trang chủ.
- **Tuân thủ 100% UX/UI:** Giữ nguyên vẹn bảng màu, font chữ Baloo 2/Lexend, nút 3D Duolingo bouncy và không làm thay đổi trải nghiệm thân thiện với trẻ em.

---

## 🗄️ CẤU TRÚC DỮ LIỆU TRÊN FIREBASE REALTIME DATABASE

Dữ liệu được tổ chức theo cấu trúc JSON phân cấp khoa học và bảo mật:

```json
{
  "users": {
    "<UID>": {
      "profile": {
        "uid": "<UID>",
        "displayName": "Bé Lan",
        "username": "lan2026",
        "email": "lan2026@robotmathlab.edu",
        "role": "student",
        "classroomId": "CLASS-A7X3",
        "createdAt": "2026-11-15T07:45:00.000Z",
        "lastLoginAt": "2026-11-15T08:00:00.000Z"
      },
      "scores": {
        "task1-reach": {
          "bestScore": 960,
          "bestTime": 45,
          "attempts": 1,
          "lastAttemptAt": "2026-11-15T08:05:00.000Z"
        }
      },
      "progress": {
        "task1-reach": {
          "taskId": "task1-reach",
          "completed": true,
          "finalSuccess": true,
          "totalAttempts": 1,
          "totalTimeSeconds": 85,
          "updatedAt": "2026-11-15T08:05:00.000Z"
        },
        "task2-fix": {
          "taskId": "task2-fix",
          "completed": true,
          "finalSuccess": true,
          "totalAttempts": 2,
          "totalTimeSeconds": 140,
          "updatedAt": "2026-11-15T08:12:00.000Z"
        }
      },
      "sessions": {
        "<sessionId>": {
          "sessionId": "sess_1731657600_abc123",
          "taskId": "task1-reach",
          "taskTitle": "Nhiệm vụ 1: Hành trình đến đích",
          "studentName": "Bé Lan",
          "startedAt": "2026-11-15T08:00:00.000Z",
          "completedAt": "2026-11-15T08:05:00.000Z",
          "currentStep": 4,
          "summary": {
            "totalAttempts": 1,
            "totalTimeSeconds": 85,
            "finalSuccess": true,
            "backwardStepsCount": 0
          },
          "supportUsage": {
            "vocabLookups": [
              { "word": "velocity", "vi": "vận tốc", "step": 1, "timestamp": "..." }
            ],
            "mathHints": [
              { "level": 1, "step": 2, "hintTitle": "Gợi ý công thức", "timestamp": "..." }
            ]
          },
          "events": [
            {
              "id": "evt_01",
              "code": "PS1",
              "label": "Xác định dữ kiện bài toán",
              "step": 1,
              "timestamp": "2026-11-15T08:01:00.000Z"
            },
            {
              "id": "evt_02",
              "code": "PS7",
              "label": "Quan sát kết quả mô phỏng",
              "step": 3,
              "data": { "speed": 7, "time": 6, "distance": 42, "target": 42 },
              "timestamp": "2026-11-15T08:03:30.000Z"
            }
          ]
        }
      }
    }
  },
  "sessions": {
    "<sessionId>": {
      "uid": "<UID>",
      "sessionId": "sess_1731657600_abc123",
      "taskId": "task1-reach",
      "studentName": "Bé Lan",
      "summary": { "finalSuccess": true, "totalAttempts": 1 },
      "syncedAt": "2026-11-15T08:05:00.000Z"
    }
  },
  "classrooms": {
    "CLASS-A7X3": {
      "teacherUid": "<TEACHER_UID>",
      "teacherName": "Cô Thu Hà",
      "className": "Lớp 5A Sư Phạm",
      "students": {
        "<STUDENT_UID_1>": true,
        "<STUDENT_UID_2>": true
      }
    }
  },
  "presence": {
    "<UID>": {
      "online": true,
      "displayName": "Bé Lan",
      "currentTask": "Nhiệm vụ 1: Hành trình đến đích",
      "lastSeen": "2026-11-15T08:05:00.000Z"
    }
  },
  "leaderboard": {
    "global": {
      "<UID>": {
        "displayName": "Bé Lan",
        "totalScore": 2850,
        "completedTasksCount": 3
      }
    },
    "byTask": {
      "task1-reach": {
        "<UID>": { "displayName": "Bé Lan", "score": 960, "timeSeconds": 45 }
      }
    }
  },
  "usernames": {
    "lan2026": "<UID>",
    "minhanh01": "<UID_KHAC>"
  }
}
```

---

## 💻 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY CỤC BỘ

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 20 trở lên (khuyến nghị Node LTS).
- **Trình duyệt**: Chrome, Edge, Safari hoặc Firefox phiên bản hiện đại có hỗ trợ HTML5 Canvas và Web Audio API.

### 2. Các bước khởi chạy
1. **Mở thư mục dự án:**
   ```bash
   cd c:/Users/Phamv/OneDrive/Desktop/Robotmathlab
   ```

2. **Khởi chạy máy chủ phát triển (Development Server):**
   ```bash
   npm start
   # hoặc:
   node serve.js
   ```

3. **Truy cập ứng dụng:**
   Mở trình duyệt và truy cập vào địa chỉ:
   ```
   http://localhost:3000
   ```
   *(Server `serve.js` đã được tích hợp đầy đủ HTTP Security Headers, Content Security Policy cho Firebase và chống tấn công dò quét thư mục).*

---

## 🔧 HƯỚNG DẪN CẤU HÌNH FIREBASE TỪ A ĐẾN Z

Để kết nối dữ liệu dự án với tài khoản Firebase của bạn, thực hiện các bước đơn giản sau:

### Bước 1: Tạo dự án trên Firebase Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và đăng nhập tài khoản Google.
2. Bấm **Add project** (Thêm dự án), đặt tên là `robot-math-lab` (hoặc tên tuỳ chọn).
3. Bấm **Continue** để hoàn tất tạo dự án.

### Bước 2: Kích hoạt Firebase Authentication
1. Tại menu bên trái, vào mục **Build** > **Authentication**.
2. Chọn thẻ **Sign-in method**:
   - **Email/Password**: Bấm Enable và bấm **Save**.
   - **Anonymous**: Bấm Enable và bấm **Save** (để hỗ trợ Chế độ Khách trải nghiệm nhanh).

### Bước 3: Tạo Firebase Realtime Database
1. Tại menu bên trái, vào **Build** > **Realtime Database**.
2. Bấm **Create Database**.
3. Chọn vị trí lưu trữ (khuyến nghị chọn `Singapore (asia-southeast1)` để có tốc độ truy xuất nhanh nhất tại Việt Nam).
4. Chọn chế độ **Start in locked mode** (Chế độ khoá).
5. Sau khi tạo xong, chuyển sang tab **Rules** (Quy tắc), dán nội dung từ file [database.rules.json](database.rules.json) vào và bấm **Publish**.

### Bước 4: Thêm Web App và lấy mã cấu hình
1. Tại màn hình **Project Overview**, bấm vào biểu tượng Web `</>` để tạo ứng dụng web.
2. Đặt tên App là `Robot Math Lab Web`.
3. Firebase sẽ hiển thị đoạn mã `firebaseConfig`, ví dụ:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     authDomain: "robot-math-lab-xxxxx.firebaseapp.com",
     databaseURL: "https://robot-math-lab-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "robot-math-lab-xxxxx",
     storageBucket: "robot-math-lab-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

### Bước 5: Dán cấu hình vào dự án
Mở file [js/firebase/firebase-config.js](js/firebase/firebase-config.js) và thay thế thông số trong `defaultFirebaseConfig` bằng cấu hình của bạn:
```javascript
const defaultFirebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "robot-math-lab-xxxxx.firebaseapp.com",
  databaseURL: "https://robot-math-lab-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "robot-math-lab-xxxxx",
  storageBucket: "robot-math-lab-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```
Lưu file và tải lại trang web. Bạn sẽ thấy biểu tượng **"🔥 Firebase Realtime: Đã kết nối"** xuất hiện trên thanh công cụ!

*(Mẹo: Bạn cũng có thể mở DevTools Console và gọi lệnh `RML_SET_FIREBASE_CONFIG(yourConfig)` để lưu cấu hình trực tiếp mà không cần sửa file code).*

---

## 🧪 HỆ THỐNG KIỂM THỬ (TESTING SUITE)

Dự án sở hữu bộ kiểm thử tự động toàn diện giúp xác minh độ chính xác của toán học, thuật toán mô phỏng và luồng tương tác người dùng:

### 1. Chạy toàn bộ kiểm thử (All Tests)
```bash
npm run test:all
```

### 2. Chạy kiểm thử đơn vị (Unit Tests)
Kiểm tra mô hình chuyển động đều kinematics, mã hóa mật khẩu và kiểm tra dữ liệu đầu vào:
```bash
npm run test:unit
```
*Kết quả:* 14/14 bài kiểm tra pass tuyệt đối.

### 3. Chạy kiểm thử tích hợp (Integration Tests)
Kiểm tra giao diện chào đón, luồng giải 3 nhiệm vụ toán học và tầng dịch vụ Firebase:
```bash
npm run test:integration
```
Bao gồm:
- `test-splash-welcome.js`: Xác minh hiển thị màn hình Pixel Art, song ngữ Anh - Việt, tương tác robot Sparky.
- `test-track-flow.js`: Mô phỏng tự động học sinh giải cả 3 nhiệm vụ từ Bước 1 đến Bước 4, mở đường chạy robot, chẩn đoán độ lệch và xác minh công thức.
- `test-firebase-service.js`: Kiểm tra tạo tài khoản, đăng nhập, đổi mật khẩu sai, chế độ khách, lưu phiên học và đồng bộ tiến độ lên Realtime Database.

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT)

### 1. Triển khai lên Firebase Hosting
Dự án đã cấu hình sẵn [firebase.json](firebase.json). Chỉ cần chạy:
```bash
# Đăng nhập Firebase CLI (nếu chưa)
npx firebase login

# Triển khai cả Hosting và Database Rules
npx firebase deploy
```

### 2. Triển khai lên Vercel
Dự án đã cấu hình sẵn [vercel.json](vercel.json).
```bash
npx vercel --prod
```

### 3. Triển khai lên GitHub Pages
Dự án là ứng dụng Single Page App tĩnh, bạn có thể đẩy trực tiếp lên nhánh `gh-pages` hoặc thư mục root của repository.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ | Mục đích |
|---|---|---|
| **Frontend Core** | HTML5, CSS3 Modern, Vanilla JavaScript (ES2020+) | Tối ưu tốc độ tải, giao diện nhẹ nhàng, không phụ thuộc framework cồng kềnh |
| **Authentication** | Google Firebase Authentication | Xác thực người dùng, bảo mật mật khẩu, duy trì phiên, đăng nhập khách |
| **Realtime Database** | Google Firebase Realtime Database | Lưu trữ dữ liệu đám mây theo thời gian thực (JSON tree NoSQL), đồng bộ tức thì |
| **2D Simulation** | HTML5 Canvas API | Vẽ đường chạy robot, thước đo vạch đích, bánh xe xoay và chuyển động mượt mà |
| **3D Simulation** | Three.js (WebGL) & esbuild | Mô phỏng không gian robot 3 chiều tương tác trực quan |
| **Audio Engine** | Web Audio API | Hiệu ứng âm thanh điện tử Arcade 8-bit và tiếng động cơ robot |
| **Speech Engine** | Web Speech Synthesis API | Phát âm chuẩn từ vựng tiếng Anh STEM bản ngữ |
| **Local Server** | Node.js Built-in HTTP Server | Phục vụ file tĩnh và áp dụng chính sách Content Security Policy (CSP) chặt chẽ |

---

## 👨‍💻 BẢN QUYỀN & PHÁT TRIỂN

- **Dự án:** Robot Math Lab (Phòng thí nghiệm Toán Chuyển Động & Robot)
- **Đơn vị nghiên cứu & phát triển:** Trường Đại học Sư phạm Hà Nội (Hanoi National University of Education - HNUE)
- **Năm phát triển:** 2026
- **Giấy phép:** MIT License

---
*Chúc các em học sinh có những giờ học Toán và Lập trình Robot thật vui và bổ ích cùng bạn robot Sparky! 🚀✨*
