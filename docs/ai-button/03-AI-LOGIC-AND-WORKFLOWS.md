# AI Editorial Copilot — Logic & Workflows

## 1. Core flow

```text
User action
   ↓
Determine scope
   ↓
Collect context
   ↓
Build AI request
   ↓
AI Gateway
   ↓
Resolve Editorial Profile
   ↓
Resolve Task
   ↓
Resolve Model
   ↓
Build Prompt
   ↓
Local LLM
   ↓
Validate Output
   ↓
Return suggestion/review
   ↓
Human accepts/rejects/edits
```

## 2. Scope rules

### Selection

Input nhỏ nhất, ưu tiên low-latency model.

### Block

Có thể tham chiếu paragraph lân cận khi cần.

### Section

Được phép nhìn toàn section.

### Article

Được phép nhìn metadata + outline + toàn article hoặc summary/chunks.

## 3. Editorial Profile

`Category + Content Type + Target Audience + Source Language` tạo ra editorial profile.

Ví dụ:

```text
Best Practices + Tutorial + Intermediate + English
```

→ professional, practical, medium-high technical depth, cần examples và trade-offs.

## 4. Technical Review Logic

Technical review không chỉ chấm grammar.

### A. Structure

Kiểm tra:

- logical flow
- heading hierarchy
- section completeness
- repetition

### B. Technical consistency

Kiểm tra:

- terminology
- acronyms
- model names
- concepts
- contradictory claims
- inconsistent definitions

### C. Potential factual issues

Không khẳng định đúng/sai nếu không có evidence.

Dùng cảnh báo:

```text
Potential technical issue
This claim may require verification or a reference.
```

### D. Practical usefulness

Kiểm tra:

- practical examples
- code where appropriate
- edge cases
- trade-offs
- common mistakes
- production considerations

### E. Completeness

Xác định concept quan trọng còn thiếu dựa trên content type và category.

## 5. Review severity

```text
info
suggestion
warning
critical
```

`critical` chỉ dành cho vấn đề thực sự nghiêm trọng và cần human verification.

## 6. Human-in-the-loop

AI không tự commit content.

Flow:

```text
AI result
   ↓
Preview
   ↓
Accept / Edit / Ignore
   ↓
Editor transaction
   ↓
Revision saved
```

## 7. Translation logic

Source version là mốc kiểm soát.

Ví dụ:

```text
English v12
   ↓ translate
Vietnamese v1 ← sourceVersion 12
Korean v1     ← sourceVersion 12
```

Nếu English lên v13:

```text
English v13
Vietnamese v1 → OUTDATED
Korean v1     → OUTDATED
```

Không overwrite các bản dịch human-edited.

## 8. Translation structured-content rules

Translate:

- paragraph text
- heading text
- quote text
- callout text
- table cell text

Preserve:

- code
- URLs
- links structure
- image nodes
- file references
- model identifiers
- command syntax
- variable names

## 9. Long article strategy

Không gửi mù toàn bộ article nếu vượt context budget.

Chiến lược:

1. lấy outline
2. tạo section summaries
3. chọn relevant sections
4. chạy task trên relevant context
5. với full review, chạy multi-pass

Ví dụ:

```text
Pass 1 → structure
Pass 2 → terminology
Pass 3 → technical risks
Pass 4 → completeness
Pass 5 → aggregate report
```

## 10. AI suggestion confidence

Nếu có confidence, xem nó là signal chứ không phải truth.

```text
high
medium
low
```

User vẫn phải quyết định.

## 11. AI-generated content provenance

Nên ghi metadata nội bộ:

```json
{
  "generatedBy": "ai",
  "modelProfile": "rewrite",
  "model": "...",
  "requestId": "..."
}
```

Human edit sau đó tạo revision mới.

## 12. Ask AI about article

Article-level assistant nhận:

- title
- metadata
- outline
- selected sections hoặc summary
- relevant document content

Ví dụ query:

> Which section is weakest?
> What information is missing?
> Are technical terms used consistently?

Nếu AI tham chiếu content, nên trả `nodeId` hoặc section anchor để UI có thể navigate.
