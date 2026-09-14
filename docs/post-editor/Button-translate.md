Mình nghĩ `Translate` nên được thiết kế như **một workflow riêng có state, preview và review**, chứ không phải bấm nút → gọi API → thay nội dung ngay.

Với kiến trúc của bạn, flow đẹp nhất sẽ là:

```text
Author đang viết English
        ↓
      Translate
        ↓
Chọn ngôn ngữ đích
        ↓
Xác nhận Translate
        ↓
Backend tạo Translation Job
        ↓
Local AI / Ollama dịch
        ↓
Stream progress về frontend
        ↓
Tạo bản dịch tạm
        ↓
Author Review
        ↓
Edit / Accept
        ↓
Save Translation
        ↓
Publish khi đạt yêu cầu
```

## 1. Khi bấm `Translate`

Ví dụ bài hiện tại:

```text
Language
🇬🇧 English · SOURCE

Title:
How to Build a Production RAG System

Content:
...
```

Author click:

```text
🌐 Translate
```

**Không dịch ngay.**

Mở một dialog nhỏ:

```text
┌──────────────────────────────────────────┐
│ Translate Article                         │
├──────────────────────────────────────────┤
│                                          │
│ Source                                   │
│ 🇬🇧 English                              │
│                                          │
│ Translate to                             │
│                                          │
│ ☑ 🇻🇳 Vietnamese                         │
│ ☑ 🇰🇷 Korean                             │
│                                          │
│ Content                                  │
│ ☑ Title                                  │
│ ☑ Subtitle                               │
│ ☑ Article body                           │
│ ☑ Callouts                               │
│ ☑ Tables                                 │
│                                          │
│ Do not translate                         │
│ ✓ Code blocks                            │
│ ✓ URLs                                   │
│ ✓ Technical identifiers                  │
│                                          │
│ [Cancel]               [Translate]       │
└──────────────────────────────────────────┘
```

Mình rất thích có bước này vì author kiểm soát được **dịch cái gì**.

---

# 2. Nhưng title/subtitle cũng cần được coi là content

Mình sẽ coi article có nhiều vùng text:

```text
Article
├── Title
├── Subtitle
├── Body
├── Metadata
│   ├── SEO title
│   └── SEO description
└── Content blocks
```

Translation workflow có thể chọn:

```text
☑ Article content
☑ Title
☑ Subtitle
☐ SEO metadata
```

SEO có thể dịch sau hoặc dùng một workflow riêng.

---

# 3. Sau khi xác nhận, frontend không trực tiếp gọi Ollama

Frontend:

```text
POST /api/ai/translate
```

Request đại loại:

```json
{
  "articleId": "article_123",
  "sourceLanguage": "en",
  "targetLanguages": ["vi", "ko"],
  "sourceVersion": 12,
  "document": {
    "...": "Tiptap JSON"
  },
  "options": {
    "translateTitle": true,
    "translateSubtitle": true,
    "translateBody": true,
    "translateSeo": false
  }
}
```

Backend nhận request rồi tạo **translation job**.

---

# 4. Tại sao cần Job?

Vì bài dài + 2 ngôn ngữ có thể mất thời gian.

Thay vì:

```text
POST
 ↓
chờ 30 giây
 ↓
response
```

nên:

```text
POST /api/ai/translate
        ↓
      Job ID
        ↓
translation_abc123
```

Response ngay:

```json
{
  "jobId": "translation_abc123",
  "status": "queued"
}
```

Sau đó frontend mở stream:

```text
GET /api/ai/translate/translation_abc123/stream
```

hoặc WebSocket nếu bạn thích.

---

# 5. Backend bắt đầu xử lý từng language

Ví dụ:

```text
Translation Job
       │
       ├── Vietnamese
       │
       └── Korean
```

Có thể chạy song song nếu local hardware đủ mạnh.

UI:

```text
TRANSLATION

🇻🇳 Vietnamese
Preparing...        10%

🇰🇷 Korean
Queued              0%
```

Sau đó:

```text
🇻🇳 Vietnamese
Translating...      45%

🇰🇷 Korean
Translating...      32%
```

Rồi:

```text
🇻🇳 Vietnamese
Translated ✓

🇰🇷 Korean
Translated ✓
```

---

# 6. Quan trọng: đừng gửi cả bài cho Ollama trong một lần

Đây là chỗ cần thiết kế kỹ.

Ví dụ article có:

```text
Title
Introduction
Section 1
  Paragraph
  Paragraph
Section 2
  Code block
  Paragraph
Section 3
...
```

Backend nên **parse document thành các translation units**.

Ví dụ:

```text
unit_001 → title
unit_002 → subtitle
unit_003 → paragraph
unit_004 → paragraph
unit_005 → heading
unit_006 → paragraph
unit_007 → code
unit_008 → paragraph
```

Sau đó:

```text
Text node
   ↓
Translate

Code node
   ↓
Preserve unchanged

Image node
   ↓
Preserve unchanged
```

Điều này giúp:

* không làm hỏng cấu trúc Tiptap
* dễ retry
* dễ hiển thị progress
* dễ review từng block
* dễ xác định bản dịch bị lỗi

---

# 7. Có 2 mức chunking

Mình không khuyên translate từng sentence.

Nên chunk theo **semantic block/section**.

Ví dụ:

```text
Section: Retrieval

Paragraph 1
Paragraph 2
Paragraph 3
```

gửi cùng nhau nếu kích thước phù hợp.

Nhưng:

```text
Code block
```

tách riêng và **không dịch**.

Một chunk có thể dạng:

```json
{
  "unitId": "section_02",
  "type": "paragraph_group",
  "content": [
    {
      "nodeId": "node_31",
      "text": "RAG combines retrieval..."
    },
    {
      "nodeId": "node_32",
      "text": "The retriever..."
    }
  ]
}
```

---

# 8. Prompt gửi cho Ollama không nên chỉ là “dịch sang Vietnamese”

Backend tạo prompt theo context.

Ví dụ:

```text
You are a professional technical translator
for an AI knowledge platform.

Source language:
English

Target language:
Vietnamese

Category:
Best Practices

Content type:
Tutorial

Target audience:
Intermediate AI engineers

Rules:
- Preserve technical meaning.
- Do not translate programming code.
- Preserve product names and model names.
- Preserve URLs.
- Keep Markdown/Tiptap structure.
- Use natural Vietnamese technical terminology.
- Do not add information.
- Do not remove information.
- Do not hallucinate.
- Preserve inline formatting.
```

Sau đó mới truyền content.

Đây là lúc `Category + Content Type + Target Audience + Source Language` thực sự phát huy tác dụng.

---

# 9. Mình sẽ thêm “Translation Glossary”

Đây là feature rất đáng làm cho website AI.

Ví dụ hệ thống có:

```text
Glossary

retrieval
→ truy xuất

retriever
→ bộ truy xuất

reranking
→ tái xếp hạng

embedding
→ embedding

prompt engineering
→ kỹ thuật prompt
```

Hoặc cho phép admin định nghĩa:

```text
English                 Vietnamese
------------------------------------------
agent                    tác nhân AI
retrieval                truy xuất
hallucination             hiện tượng ảo giác
```

Korean cũng có glossary riêng.

Khi dịch, backend đưa glossary vào context:

```text
Preferred terminology:
retrieval = truy xuất
retriever = bộ truy xuất
```

Điều này giúp toàn website dịch **nhất quán**.

---

# 10. Translation xong không nên Publish ngay

Sau khi Ollama hoàn tất:

```text
🇻🇳 Vietnamese
AI translated
Needs Review

🇰🇷 Korean
AI translated
Needs Review
```

Bản dịch được lưu thành **draft translation**.

Không được automatically publish.

---

# 11. Sau đó UI nên chuyển sang Translation Review

Ví dụ author click:

```text
🇻🇳 Vietnamese
Needs Review
```

Mở:

```text
┌───────────────────────┬────────────────────────┐
│ 🇬🇧 English            │ 🇻🇳 Vietnamese         │
├───────────────────────┼────────────────────────┤
│ RAG combines          │ RAG kết hợp             │
│ retrieval with        │ khả năng truy xuất      │
│ generation.           │ với sinh nội dung.      │
│                       │                         │
│                       │ ✎ editable              │
└───────────────────────┴────────────────────────┘
```

Author có thể sửa trực tiếp bản dịch.

---

# 12. Review nên block-by-block

Mỗi block có status:

```text
✓ Reviewed
⚠ Needs review
AI translated
Edited
```

Ví dụ:

```text
Introduction
✓ Reviewed

Architecture
⚠ Needs review

Retrieval
✓ Reviewed

Code Example
— Preserved
```

Điều này tốt hơn việc bắt author đọc lại cả bài mà không biết mình đã review tới đâu.

---

# 13. Author chỉnh bản dịch

Ví dụ AI dịch:

> RAG combines retrieval with generation.

Author sửa thành:

> RAG kết hợp cơ chế truy xuất thông tin với quá trình sinh câu trả lời.

Sau khi edit:

```text
Status:
AI translated → Human edited
```

Sau khi author xác nhận:

```text
Reviewed ✓
```

---

# 14. Khi source English thay đổi

Đây là phần rất quan trọng.

Giả sử:

```text
English version = 12
Vietnamese translated from = 12
Korean translated from = 12
```

Sau đó author sửa English:

```text
English version = 13
```

Backend biết:

```text
Vietnamese sourceVersion = 12
Korean sourceVersion = 12
English currentVersion = 13
```

→ cả hai trở thành:

```text
Outdated
```

Nhưng:

**KHÔNG xóa translation hiện tại.**

UI:

```text
🇻🇳 Vietnamese
Outdated

English source has changed.

[Review Changes]
[Re-translate]
```

---

# 15. Re-translate không được overwrite bản dịch cũ

Mình sẽ cho:

```text
Re-translate
```

và sau đó:

```text
Current Vietnamese
       │
       ├── Human-edited version
       │
       └── New AI translation
```

UI có thể cho compare:

```text
Current translation
vs
New AI translation
```

Author chọn:

```text
Use new translation
Merge manually
Keep current
```

Đây là cách an toàn nhất vì bản dịch có thể đã được con người chỉnh rất nhiều.

---

# 16. Cuối cùng mới Publish

Workflow:

```text
English
Published

Vietnamese
Translated
     ↓
Reviewed
     ↓
Published

Korean
Translated
     ↓
Reviewed
     ↓
Published
```

Không bắt buộc ba ngôn ngữ phải publish cùng lúc.

Ví dụ:

```text
🇬🇧 English       Published
🇻🇳 Vietnamese    Published
🇰🇷 Korean        Draft
```

hoàn toàn hợp lệ.

Frontend website chỉ hiển thị language nào đang `Published`.

---

# 17. State machine mình sẽ dùng

### Article language state

```text
NOT_CREATED
    ↓
TRANSLATING
    ↓
TRANSLATED
    ↓
NEEDS_REVIEW
    ↓
REVIEWED
    ↓
PUBLISHED
```

Nếu source thay đổi:

```text
PUBLISHED
    ↓
OUTDATED
```

Có thể quay lại:

```text
OUTDATED
    ↓
RETRANSLATING
    ↓
NEEDS_REVIEW
```

---

# 18. Toàn bộ flow nhìn sẽ như này

```text
                Author
                  │
                  ▼
         Click "Translate"
                  │
                  ▼
       Translation Dialog
                  │
        Select VI + KO
                  │
                  ▼
       POST /api/ai/translate
                  │
                  ▼
          Create Job
                  │
                  ▼
        Translation Queue
             /       \
            /         \
           ▼           ▼
     Vietnamese       Korean
        Ollama         Ollama
           │             │
           ▼             ▼
     Structured        Structured
      result            result
           \             /
            \           /
             ▼         ▼
              Draft
                │
                ▼
          Needs Review
                │
          ┌─────┴─────┐
          ▼           ▼
        Edit        Accept
          \           /
           \         /
            ▼       ▼
             Reviewed
                │
                ▼
             Publish
```

---

# 19. Và có một chi tiết mình rất khuyến khích

Trong dialog Translate, hiển thị **Estimated AI impact** không cần thiết; nhưng nên hiển thị **Translation memory / glossary status**:

```text
Translation settings

Source
🇬🇧 English

Target
☑ 🇻🇳 Vietnamese
☑ 🇰🇷 Korean

Glossary
✓ 24 preferred terms

Preserve
✓ Code
✓ URLs
✓ Model names
✓ Product names

Mode
● Full article
○ Selected section
○ Selected blocks
```

Như vậy sau này author còn có thể bôi đen một section rồi:

```text
Translate → Vietnamese
```

thay vì lúc nào cũng dịch toàn bài.

---

## Kiến trúc mình chốt cho feature này

```text
Vue/Tiptap
   │
   ▼
Translation UI
   │
   ▼
Translation API
   │
   ├── Job Manager
   ├── Document Parser
   ├── Translation Context
   ├── Glossary
   ├── Chunker
   ├── Model Router
   └── Output Validator
            │
            ▼
          Ollama
            │
            ▼
     Structured Translation
            │
            ▼
     Draft Translation
            │
            ▼
        Human Review
            │
            ▼
      Published Version
```

**Điểm cốt lõi:** `Translate` chỉ tạo ra **AI-generated translation draft**. Nó không bao giờ trực tiếp biến thành nội dung published. Điều này giữ cho workflow 3 ngôn ngữ của bạn an toàn, có thể review, có versioning và không làm mất các chỉnh sửa thủ công của author.
