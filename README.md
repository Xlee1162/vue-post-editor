# Post Editor CMS — Frontend & AI Editorial Suite

Một hệ thống Editor bài viết kỹ thuật và CMS truyền thông đa ngôn ngữ, tích hợp AI Copilot, Slash Commands, Rich Text Formatting và dịch thuật thời gian thực.

---

## 🚀 Tính năng nổi bật

- **Editor Soạn Thảo Rich Text Chuyên Nghiệp**:
  - Hỗ trợ gõ trực tiếp trong vùng bài viết (`contenteditable`).
  - Thanh công cụ định dạng `editor-toolbar`: Bold (`B`), Italic (`I`), Strikethrough (`U`), Link, Code block, Comment highlight.
  - Tự động đồng bộ Tiêu đề bài viết (`v-model`) với thanh Topbar Header.

- **Slash Commands (`/`) Menu**:
  - Menu chèn khối nội dung nhanh bằng phím tắt `/` hoặc nút `/` trên thanh công cụ.
  - **Basic Blocks**: Paragraph, Heading 1/2/3, Bullet List, Numbered List, Checklist, Quote, Divider (`---`).
  - **Media & Files**: Image (URL / crop), Video embed, File attachments, Embed widget.
  - **AI & Technical Blocks**: Code Block syntax, Prompt Card, Model Comparison Table, Callout blocks (Info/Warning), Math formulas ($E=mc^2$).

- **AI Copilot ("✨ AI") & Backend Gateway Integration**:
  - Tích hợp AI Gateway backend chạy NodeJS + Fastify + TypeScript (port `3001`).
  - Hỗ trợ **Mock LLM Adapter** (dùng ngay không cần Ollama) và **Ollama LLM Adapter** (`qwen2.5:7b`).
  - Toast thông báo trạng thái AI realtime ở góc phải màn hình.

- **Dịch thuật Đa Ngôn Ngữ (Translation Suite)**:
  - Hỗ trợ dịch đồng thời bài viết sang Tiếng Việt (🇻🇳) và Tiếng Hàn (🇰🇷).
  - Kết nối SSE Stream theo dõi tiến độ dịch chi tiết cho từng ngôn ngữ.
  - Chế độ Review & Diff bài viết trước khi xuất bản.

---

## 💡 Hướng dẫn sử dụng chi tiết

### 1. Cách sử dụng Slash Commands (`/`)
1. **Mở menu**:
   - Nhấp vào nút **`/`** trên thanh công cụ `editor-toolbar`.
   - Hoặc gõ phím `/` trong vùng nội dung bài viết.
2. **Chọn loại khối nội dung**:
   - **Thêm tiêu đề**: Chọn `Heading 1`, `Heading 2`, `Heading 3` để tự động tạo heading và cập nhật cây **Outline** bên trái.
   - **Danh sách công việc**: Chọn `Checklist` để tạo danh sách checkbox tương tác.
   - **Chèn khối kỹ thuật**:
     - `Code Block`: Chèn khung mã nguồn định dạng sẵn.
     - `Prompt`: Chèn thẻ System/User Prompt chuyên dụng cho các bài viết AI Engineering.
     - `Model Comparison`: Chèn bảng so sánh hiệu năng các mô hình AI (Latency, Accuracy score).
     - `Callout`: Chèn hộp ghi chú nổi bật (Gợi ý/Cảnh báo).
     - `Math`: Chèn công thức toán học.
   - **Chèn Media**: Chọn `Image` hoặc `Video` để nhập URL xem trước trực tiếp.

### 2. Cách sử dụng nút AI Assistant ("✨ AI")
1. **Mở menu AI Copilot**:
   - Nhấp vào nút **`✨ AI`** màu tím/xanh nổi bật trên `editor-toolbar`.
2. **Xử lý đoạn văn bản được bôi đen (Selection Scope)**:
   - **Bôi đen 1 câu/đoạn văn** bất kỳ trong bài viết -> bấm `✨ AI` -> chọn tác vụ:
     - **`Improve writing` / `Make clearer`**: Tối ưu văn phong, làm rõ ý diễn đạt.
     - **`Make shorter` / `Make longer`**: Tóm gọn hoặc mở rộng đoạn văn.
     - **`Fix grammar`**: Sửa lỗi chính tả và ngữ pháp.
     - **`Change tone`**: Thay đổi giọng văn bài viết.
     - **`Explain`**: Giải thích khái niệm kỹ thuật trong văn bản.
     - **`Generate code` / `Generate example`**: Tự động sinh mã nguồn hoặc ví dụ minh họa liên quan.
   - *Kết quả*: AI sẽ tự động thay thế (replace) văn bản đã chọn bằng phiên bản AI viết lại, kèm toast thông báo hoàn tất.
3. **Xử lý toàn bài / Tạo nội dung mới (Article Scope)**:
   - Khi **không bôi đen văn bản** -> bấm `✨ AI` -> chọn tác vụ (ví dụ: `Summarize` hoặc `Generate example`):
   - *Kết quả*: AI sẽ tự động chèn một khối gợi ý AI chuyên nghiệp (`✨ AI (Summarize): ...`) ngay trong nội dung bài viết.
4. **Dịch thuật nhanh**:
   - Chọn mục **`Translate`** trong menu AI để mở bảng điều khiển dịch thuật đa ngôn ngữ.

---

## 🛠️ Cài đặt & Chạy ứng dụng

### Yêu cầu môi trường
- Node.js >= 22.18
- npm

### 1. Khởi chạy Frontend (Vue 3 Dev Server)
```bash
npm install
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:5173` (Vite dev server đã được cấu hình proxy `/api` tự động chuyển tiếp tới Backend ở port 3001).

### 2. Khởi chạy Backend AI Gateway (Node.js + Fastify)
```bash
cd server
npm install
npm run dev
```
Backend AI Gateway sẽ khởi tạo tại `http://localhost:3001`.

---

## 📁 Cấu trúc dự án

```text
post-editor/
├── server/                     # Backend AI Gateway (Node.js + Fastify)
│   ├── src/
│   │   ├── adapters/           # LLM Adapters (MockAdapter, OllamaAdapter)
│   │   ├── ai/                 # Task Registry, Prompt Manager, Editorial Profile
│   │   ├── routes/             # POST /api/ai/run, POST /api/ai/translate
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── config.ts
│   │   └── index.ts
│   ├── README.md               # Document chi tiết Backend
│   └── package.json
├── src/                        # Frontend Vue 3 App
│   ├── components/             # TranslateDialog, TranslationReview, TagInput
│   ├── services/               # ai.ts (API Client cho AI Gateway & SSE streaming)
│   ├── App.vue                 # Core Editor App UI & Handlers
│   └── main.ts
├── docs/                       # Tài liệu thiết kế & AI Specifications
├── vite.config.ts              # Proxy config /api -> localhost:3001
└── README.md
```
