# Post Editor AI Gateway — Backend Service

Backend service đóng vai trò **AI Gateway** trung gian giữa Vue 3 Post Editor Frontend và hệ thống sinh ngôn ngữ tự nhiên LLM (Ollama local / Mock Adapter). 

Hệ thống được thiết kế theo nguyên tắc **Server-side Prompt Management**, tách biệt hoàn toàn logic xây dựng prompt và xử lý AI ra khỏi giao diện người dùng.

---

## 🏗️ Kiến trúc & Công nghệ

- **Core Framework**: Node.js (ES2024) + Fastify 5.x
- **Language & Runtime**: TypeScript + `tsx` (Hot-reloading & dev execution)
- **Validation Schema**: Zod (Runtime validation & type inference)
- **Logger**: Pino + `pino-pretty`
- **LLM Abstraction**: LLM Adapter Pattern (`MockAdapter` & `OllamaAdapter`)

---

## 📁 Cấu trúc thư mục Server

```text
server/
├── src/
│   ├── adapters/               # Lớp trừu tượng kết nối LLM
│   │   ├── llm-adapter.ts      # Interface định nghĩa contract cho LLM Adapters
│   │   └── mock-adapter.ts     # Mock Adapter hỗ trợ dev offline / thử nghiệm
│   ├── ai/                     # Quản lý tác vụ AI & Prompt
│   │   ├── task-registry.ts    # Đăng ký danh sách các tác vụ AI & scope cho phép
│   │   ├── prompt-manager.ts   # Xây dựng System/User Prompt chuẩn hóa
│   │   └── editorial-profile.ts# Cấu hình phong cách viết & đối tượng độc giả
│   ├── routes/                 # API Endpoint routes
│   │   ├── ai-run.ts           # POST /api/ai/run (AI Writing & Review)
│   │   └── ai-translate.ts     # POST /api/ai/translate & GET SSE stream
│   ├── schemas/                # Zod validation schemas
│   │   └── ai-schemas.ts       # Định nghĩa request/response contract
│   ├── config.ts               # Configuration loader & Model profiles
│   └── index.ts                # Server Entrypoint & Fastify setup
├── .env                        # Cấu hình môi trường
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Các API Endpoints Chi Tiết

### 1. Health Check
* **`GET /api/health`**
  - **Mô tả**: Kiểm tra trạng thái hoạt động của AI Gateway và adapter đang được kích hoạt.
  - **Response Sample**:
    ```json
    {
      "status": "ok",
      "adapter": "mock",
      "timestamp": "2026-09-15T00:10:13.138Z"
    }
    ```

---

### 2. AI Writing & Review Endpoint
* **`POST /api/ai/run`**
  - **Mô tả**: Endpoint hợp nhất xử lý tất cả tác vụ AI Copilot (viết lại, làm ngắn, mở rộng, giải thích, tóm tắt, tạo mã nguồn, v.v.).
  - **Headers**:
    - `Content-Type: application/json`
    - `Accept: application/json` (cho kết quả JSON nguyên khối) hoặc `Accept: text/event-stream` (cho SSE streaming chunks).
  - **Request Body Contract**:
    ```json
    {
      "task": "rewrite",
      "scope": "selection",
      "context": {
        "category": "Best Practices",
        "contentType": "Tutorial",
        "targetAudience": "Developers",
        "sourceLanguage": "en"
      },
      "selection": {
        "text": "Retrieval augmented generation enables factual grounding."
      }
    }
    ```
  - **Response Sample (JSON)**:
    ```json
    {
      "requestId": "req_CcxTBejZEam8",
      "task": "rewrite",
      "status": "completed",
      "result": {
        "type": "suggestion",
        "original": "Retrieval augmented generation enables factual grounding.",
        "suggested": "Retrieval-augmented generation (RAG) grounds language model responses in verified external evidence, significantly reducing hallucinations and improving domain accuracy."
      },
      "meta": {
        "model": "mock-qwen2.5:7b",
        "latencyMs": 1290,
        "tokensUsed": 320
      }
    }
    ```

---

### 3. Translation Job Endpoints
* **`POST /api/ai/translate`**
  - **Mô tả**: Khởi tạo tác vụ dịch thuật đa ngôn ngữ ngầm (Background Translation Job).
  - **Request Body**:
    ```json
    {
      "sourceLanguage": "English",
      "targetLanguages": ["vi", "ko"],
      "document": {
        "title": "Production RAG Systems",
        "blocks": [{ "type": "paragraph", "text": "Building RAG systems requires reliable evaluation." }]
      },
      "options": {
        "translateTitle": true,
        "translateBody": true
      }
    }
    ```
  - **Response**:
    ```json
    {
      "jobId": "job_9xK2mP1aQ",
      "status": "queued"
    }
    ```

* **`GET /api/ai/translate/:jobId/stream`**
  - **Mô tả**: Endpoint SSE (`text/event-stream`) phát các sự kiện tiến độ dịch thuật theo thời gian thực.
  - **Các Event SSE**:
    - `event: progress`: Phát phần trăm tiến độ từng ngôn ngữ (`progress: 45`).
    - `event: lang_done`: Thông báo dịch xong 1 ngôn ngữ cụ thể.
    - `event: job_completed`: Thông báo hoàn tất toàn bộ công việc dịch.

---

## 🛠️ Cấu hình Môi Trường (`.env`)

Tạo hoặc chỉnh sửa file `server/.env`:

```env
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODEL=qwen2.5:7b
LOG_LEVEL=info
```

---

## 🚀 Hướng Dẫn Chạy Backend

### 1. Cài đặt thư viện
```bash
cd server
npm install
```

### 2. Chạy ở chế độ Development (Hot-reload)
```bash
npm run dev
```

### 3. Kiểm tra TypeScript Types
```bash
npm run check
```

---

## 🧪 Thử nghiệm với PowerShell / cURL

#### Test AI Run Endpoint:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/ai/run" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"task":"rewrite","scope":"selection","context":{"category":"Best Practices","contentType":"Tutorial","targetAudience":"Developers","sourceLanguage":"en"},"selection":{"text":"RAG is awesome"}}' | ConvertTo-Json -Depth 5
```

#### Test Translation Endpoint:
```powershell
$job = Invoke-RestMethod -Uri "http://localhost:3001/api/ai/translate" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"sourceLanguage":"English","targetLanguages":["vi","ko"],"document":{"title":"Testing AI Gateway"}}'
Write-Host "Created Job ID:" $job.jobId
```
