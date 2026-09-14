# AI Editorial Copilot — Implementation Plan

## 1. Mục tiêu

Xây dựng AI Editorial Copilot cho CMS tạo bài viết của nền tảng AI. Hệ thống hỗ trợ author trong 4 cấp context:

- `selection`: đoạn text đang chọn
- `block`: block hiện tại
- `section`: section hiện tại
- `article`: toàn bộ bài

AI phải dựa trên 4 metadata chính để điều chỉnh cách viết/review:

- `category`
- `contentType`
- `targetAudience`
- `sourceLanguage`

Translation English/Vietnamese/Korean là subsystem riêng nhưng dùng chung AI Gateway.

## 2. Nguyên tắc kiến trúc

1. Vue không gọi trực tiếp Ollama.
2. Frontend chỉ gửi intent + context + structured content.
3. Backend/AI Gateway chịu trách nhiệm prompt, rule, model routing và validation.
4. Tiptap JSON là canonical editor format.
5. AI không tự ý overwrite nội dung human-edited.
6. Review trả structured findings thay vì plain text.
7. Generation/rewrite/translation nên hỗ trợ streaming qua SSE.
8. Code, URL, model name, identifiers và cấu trúc document phải được bảo vệ khỏi dịch nhầm.
9. Translation phải theo source version để phát hiện `outdated`.

## 3. MVP

### Phase 1 — Foundation

- Tiptap editor
- AI button theo context
- `/api/ai/run`
- Ollama adapter
- SSE streaming
- task registry
- context builder
- structured output validation

### Phase 2 — Writing AI

- rewrite
- improve
- expand
- shorten
- continue writing
- generate example
- generate section

### Phase 3 — Review AI

- article review
- section review
- technical review
- terminology consistency
- missing content suggestions
- quality scorecard

### Phase 4 — Translation

- `/api/ai/translate`
- EN → VI/KO
- per-language status
- review comparison
- source-version tracking
- outdated detection

### Phase 5 — Advanced Editorial Intelligence

- editorial rules
- category/content-type profiles
- article-wide Ask AI
- smart suggestions
- optional focal-point detection for cover

## 4. Thành phần chính

```text
Vue 3 CMS
 ├─ Tiptap Editor
 ├─ AI Context Menu
 ├─ AI Side Panel
 └─ Translation UI
        │
        ▼
AI Gateway
 ├─ Request Validator
 ├─ Context Builder
 ├─ Editorial Profile Resolver
 ├─ Task Router
 ├─ Prompt Manager
 ├─ Model Router
 ├─ Ollama Adapter
 ├─ Output Validator
 └─ SSE Stream
        │
        ▼
Ollama / Local LLM
```

## 5. Suggested project layout

```text
apps/
  web/
    src/
      components/ai/
      composables/useAICopilot.ts
      services/ai.ts
      editor/

  api/
    src/
      ai/
        controller/
        services/
        prompts/
        policies/
        adapters/
        schemas/
        tasks/
        routing/
      translation/
      articles/
      revisions/
```

## 6. Definition of Done cho MVP

- AI menu thay đổi theo scope.
- User có thể rewrite selection và preview diff trước khi apply.
- User có thể generate section vào article.
- Article review trả issues có `nodeId`.
- Technical review có severity và evidence/rationale.
- Frontend không chứa Ollama credentials hoặc internal endpoint.
- Ollama model có thể đổi mà không đổi frontend contract.
- LLM response được validate trước khi hiển thị/apply.
- Có log request latency, task, model, token usage nếu runtime cung cấp.
