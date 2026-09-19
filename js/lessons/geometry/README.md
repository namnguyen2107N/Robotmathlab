# Kiến Trúc Mô-đun Mở Rộng: Hình Học & Đo Lường Lớp 4
## (Grade 4 Geometry & Measurement Modular Architecture)

Tài liệu này xác định kiến trúc kỹ thuật để mở rộng hệ thống sang mạch nội dung **Hình học và Đo lường Lớp 4**, kế thừa hoàn toàn khung **Pólya 4 bước** và cơ chế **Telemetry** đã xây dựng cho mạch Chuyển động đều Lớp 5.

---

## 1. Nguyên Tắc Thiết Kế Kế Thừa (Inheritance & Extensibility)

Tất cả các bài học Hình học Lớp 4 sẽ kế thừa từ lớp cơ sở `LessonBase` (`js/lessons/lesson-base.js`):

```javascript
class GeometryLessonBase extends LessonBase {
  constructor(config) {
    super(config);
    this.topic = 'geometry';
    this.grade = 4;
    this.gridSize = config.gridSize || 20; // 20px mỗi ô lưới
  }

  setupGeometryCanvas(simEngine) {
    // Chuyển chế độ canvas từ đường chạy 1D sang lưới toạ độ 2D (Grid & Turtle Geometry)
  }
}
```

---

## 2. Ánh Xạ Khung Pólya Vào Mạch Hình Học Lớp 4

| Bước Pólya | Hành động học sinh trong Hình học | Công cụ tương tác trên Canvas |
|---|---|---|
| **1. Hiểu vấn đề** | Phân loại cạnh đã biết, cạnh chưa biết, hình dạng (Chữ nhật, Vuông, Bình hành, Thoi), yêu cầu bài toán (Chu vi hay Diện tích). | Thẻ dữ kiện kéo thả: Chiều dài $a$, Chiều rộng $b$, Chu vi $P$, Diện tích $S$. |
| **2. Lập kế hoạch** | Chọn công thức hình học phù hợp: $P = (a + b) \times 2$, $S = a \times b$, $P = a \times 4$, $S = a \times a$. | Lưới công thức trực quan, tam giác phân rã hình. |
| **3. Thực hiện** | Lập trình Robot di chuyển vẽ đường viền (Chu vi) hoặc quét sơn diện tích bề mặt (Diện tích) trên lưới ô vuông. | Bộ lệnh điều khiển Robot: `Tiến(a)`, `RẽPhải(90°)`, `ĐoDiệnTích()`. |
| **4. Kiểm tra & Nhìn lại** | So sánh số ô vuông robot đã quét với công thức nhân; kiểm tra tính nhất quán của đơn vị ($cm, cm^2, m, m^2$). | Đồ thị so sánh hình vẽ thực tế và đáp số giải tích. |

---

## 3. Danh Mục 5 Bài Mẫu Đề Xuất Cho Lớp 4

1. **Geo-1: Robot Canh Gác Nông Trại** – Tính chu vi hình chữ nhật ($P = (a + b) \times 2$) khi robot đi tuần quanh hàng rào.
2. **Geo-2: Robot Lát Gạch Sân Trường** – Khái niệm diện tích và tính diện tích hình chữ nhật ($S = a \times b$) bằng cách đếm và nhân số hàng gạch.
3. **Geo-3: Robot Vẽ Hoa Văn Hình Vuông** – Chu vi và diện tích hình vuông ($P = 4a, S = a^2$).
4. **Geo-4: Robot Chuyển Đổi Đơn Vị Đo** – Chuyển đổi giữa $m^2, dm^2, cm^2$ thông qua mô phỏng phóng to thu nhỏ lưới đơn vị.
5. **Geo-5: Robot Tìm Góc Vuông & Góc Nhọn** – Robot xoay cảm biến góc (90 độ, nhọn, tù) để vượt chướng ngại vật trong mê cung.

---

## 4. Cấu Trúc File Dự Kiến
```
js/lessons/geometry/
├── README.md                 # Tài liệu kiến trúc này
├── geometry-lesson-base.js  # Lớp cơ sở cho hình học (lưới 2D, turtle graphics)
├── lesson-geo1.js           # Chu vi hình chữ nhật
├── lesson-geo2.js           # Diện tích hình chữ nhật
├── lesson-geo3.js           # Chu vi & Diện tích hình vuông
├── lesson-geo4.js           # Đơn vị đo diện tích
└── lesson-geo5.js           # Góc và đường thẳng song song/vuông góc
```
