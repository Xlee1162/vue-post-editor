# AI Editorial Copilot — Frontend Implementation

## 1. UI responsibilities

Frontend chịu trách nhiệm:

- hiển thị AI menu theo context
- thu thập Tiptap JSON trong scope cần thiết
- gửi request tới AI Gateway
- render streaming state
- render suggestion/diff
- cho phép Accept/Reject/Edit
- không chứa prompt nghiệp vụ cốt lõi

## 2. Core composable

```ts
export type AIAIScope = 'selection' | 'block' | 'section' | 'article'

export type AITask =
  | 'rewrite'
  | 'improve_writing'
  | 'shorten'
  | 'expand'
  | 'continue_writing'
  | 'generate_example'
  | 'generate_section'
  | 'review_section'
  | 'review_article'
  | 'review_technical'
  | 'review_seo'

export interface AIContext {
  category: string
  contentType: string
  targetAudience: string
  sourceLanguage: 'en' | 'vi' | 'ko'
}

export interface AIRunRequest {
  task: AITask
  scope: AIAIScope
  context: AIContext
  document?: unknown
  selection?: unknown
  nodeId?: string
  instruction?: string
}
```

Tạo `useAICopilot()`:

```ts
const {
  run,
  cancel,
  status,
  result,
  error,
} = useAICopilot()
```

## 3. Context extraction

### Selection

Lấy text + node range + parent context.

### Block

Lấy node hiện tại và metadata tối thiểu.

### Section

Lấy heading hiện tại và các block cho tới heading cùng cấp kế tiếp.

### Article

Gửi toàn document nếu kích thước nằm trong context budget. Với bài rất dài, backend nên chunk/summarize thay vì gửi mù toàn bộ.

## 4. AI menu UX

### Selection

```text
Writing
  Improve
  Rewrite
  Shorten
  Expand

Content
  Explain
  Generate example

Technical
  Add code example
  Add pros & cons
```

### Block

```text
Improve block
Continue writing
Add example
Add technical details
Change format
```

### Section

```text
Review section
Improve structure
Find missing concepts
Generate example
Suggest subsection
```

### Article

```text
Review article
Technical review
Check consistency
Find repetition
Suggest missing sections
SEO review
Generate summary
```

## 5. Apply strategy

AI result không ghi thẳng vào editor. Luôn qua một apply layer:

```text
AI response
   ↓
validate
   ↓
show diff / preview
   ↓
user accepts
   ↓
apply transaction
   ↓
save revision
```

Các action nên hỗ trợ:

- `replace`
- `insert_below`
- `insert_at_cursor`
- `copy`
- `dismiss`

## 6. AI side panel

Dùng cho task article-level.

Nội dung gợi ý:

```text
AI Editorial Copilot

Review
  Structure         90
  Clarity           86
  Technical         81
  Completeness      76

Issues
  ⚠ Missing evaluation section
  ⚠ Terminology inconsistency
  💡 Add practical example
```

Click issue phải focus vào `nodeId` tương ứng.

## 7. SSE client

Sử dụng `fetch()` hoặc EventSource-compatible wrapper.

Pseudo-flow:

```ts
const response = await fetch('/api/ai/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  },
  body: JSON.stringify(payload),
})
```

Đọc event:

- `started`
- `progress`
- `chunk`
- `result`
- `error`
- `done`

## 8. UX states

Mỗi AI action nên có:

- idle
- preparing
- running
- streaming
- completed
- failed
- cancelled

Không disable toàn bộ editor trong khi AI chạy.

## 9. Security

Frontend không được gọi trực tiếp:

```text
http://localhost:11434
```

Chỉ gọi API của application backend.
