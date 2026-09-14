# AI Editorial CMS Mockup

Một mock UI cho hệ thống editor nội dung AI đa ngôn ngữ, tập trung vào trải nghiệm viết bài, review, dịch thuật và quản lý cover image trong một CMS hiện đại.

## Mục tiêu dự án

Dự án này là một giao diện frontend dạng prototype để mô phỏng một editor bài viết chuyên nghiệp cho nền tảng AI content, gồm:

- sidebar outline
- editor nội dung chính
- panel cài đặt bài viết
- menu AI Assistant
- slash commands
- modal dịch thuật đa ngôn ngữ
- cover image upload + crop
- responsive layout cho desktop/tablet/mobile

## Tính năng hiện có

- Giao diện CMS sáng tạo, theo phong cách premium editorial
- Chế độ viết bài với title, subtitle, các khối nội dung và bảng so sánh
- AI menu với các action như: improve writing, summarize, explain, generate example
- Slash command menu cho block insertion
- Translation modal hỗ trợ EN / VI / KO
- Cover upload và crop tương tác
- Zoom và kéo ảnh trong crop modal
- Export ảnh crop sang định dạng WebP
- Layout responsive cho các độ rộng phổ biến

## Công nghệ sử dụng

- Vue 3
- TypeScript
- Vite
- CSS modules / scoped CSS

## Cấu trúc thư mục chính

```text
post-editor/
├─ docs/
│  ├─ ai-button/
│  ├─ 04-OLLAMA-LLM-SETUP.md
│  └─ ...
├─ public/
├─ src/
│  ├─ assets/
│  ├─ App.vue
│  ├─ main.ts
│  └─ ...
├─ .gitignore
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ README.md
└─ package-lock.json
```

## Yêu cầu môi trường

- Node.js >= 22.18 hoặc >= 24.12
- npm

## Cài đặt

```bash
npm install
```

## Chạy dự án ở chế độ dev

```bash
npm run dev -- --host 0.0.0.0
```

Mặc định Vite sẽ chạy trên localhost, ví dụ:

- http://localhost:5173/
- hoặc port khác nếu port 5173 đang bận

## Build production

```bash
npm run build
```

## Preview production build

```bash
npm run preview -- --host 0.0.0.0
```

## Lưu ý thiết kế

Dự án hiện là một prototype frontend, không có backend thật, không tích hợp API AI thực tế, không lưu dữ liệu xuống database. Mục tiêu là kiểm chứng UX/editorial trải nghiệm trước khi triển khai phần backend và AI Gateway.

## Roadmap gợi ý

- tích hợp Tiptap editor thực tế
- thêm AI Gateway / backend service
- tích hợp Ollama hoặc mô hình local
- thêm streaming response
- hỗ trợ review, diff và apply content
- thêm export / publish flow
- quản lý article và revision history

## Tài liệu liên quan

- [docs/ai-button/00-AI-COPILOT-IMPLEMENTATION-PLAN.md](docs/ai-button/00-AI-COPILOT-IMPLEMENTATION-PLAN.md)
- [docs/04-OLLAMA-LLM-SETUP.md](docs/04-OLLAMA-LLM-SETUP.md)

## Ghi chú

Dự án hiện tập trung vào UX của một CMS AI editorial và mockup editor, phù hợp để demo giao diện, kế hoạch kiến trúc và thử nghiệm layout trước khi triển khai hệ thống đầy đủ.
