# AI Editorial Copilot — Backend & API Implementation

## 1. Mục tiêu backend

Backend là AI Gateway. Nó che giấu model runtime và tập trung toàn bộ business logic AI.

Responsibilities:

- request validation
- authorization
- context normalization
- editorial profile resolution
- prompt construction
- task/model routing
- Ollama invocation
- streaming
- structured output validation
- logging
- retry / timeout

## 2. Unified API

Khuyến nghị API chính:

```http
POST /api/ai/run
```

Request:

```json
{
  "task": "rewrite",
  "scope": "selection",
  "context": {
    "category": "best-practices",
    "contentType": "tutorial",
    "targetAudience": "intermediate",
    "sourceLanguage": "en"
  },
  "selection": {
    "text": "RAG retrieves relevant documents..."
  },
  "instruction": "Make this clearer and more concise"
}
```

Response phải có structured envelope:

```json
{
  "requestId": "req_123",
  "task": "rewrite",
  "status": "completed",
  "result": {
    "type": "suggestion",
    "original": "...",
    "suggested": "..."
  }
}
```

## 3. Review endpoint

Có thể dùng cùng `/api/ai/run`, nhưng task-specific schema:

```json
{
  "task": "review_technical",
  "scope": "article",
  "context": {
    "category": "best-practices",
    "contentType": "tutorial",
    "targetAudience": "advanced",
    "sourceLanguage": "en"
  },
  "document": { }
}
```

Response:

```json
{
  "result": {
    "type": "article_review",
    "score": 82,
    "dimensions": {
      "structure": 90,
      "clarity": 86,
      "technical": 81,
      "completeness": 76,
      "consistency": 92
    },
    "issues": [
      {
        "id": "issue_001",
        "severity": "warning",
        "type": "missing_section",
        "nodeId": "node_42",
        "title": "Missing evaluation section",
        "description": "The article explains retrieval and generation but does not discuss evaluation."
      }
    ]
  }
}
```

## 4. Translation API

Translation nên có endpoint riêng:

```http
POST /api/ai/translate
```

Request:

```json
{
  "articleId": "article_123",
  "sourceLanguage": "en",
  "targetLanguages": ["vi", "ko"],
  "sourceVersion": 12,
  "document": { }
}
```

Response envelope:

```json
{
  "requestId": "req_456",
  "translations": {
    "vi": {
      "status": "needs_review",
      "sourceVersion": 12,
      "translationVersion": 1
    },
    "ko": {
      "status": "needs_review",
      "sourceVersion": 12,
      "translationVersion": 1
    }
  }
}
```

## 5. Task registry

Backend nên có task registry:

```ts
interface AITaskDefinition {
  id: string
  allowedScopes: AIAIScope[]
  outputSchema: unknown
  promptProfile: string
  modelProfile: string
  stream: boolean
}
```

Ví dụ:

```ts
review_technical: {
  allowedScopes: ['section', 'article'],
  outputSchema: TechnicalReviewSchema,
  promptProfile: 'technical-reviewer-v1',
  modelProfile: 'technical-reviewer',
  stream: false,
}
```

## 6. Editorial Profile Resolver

Input:

```text
category
contentType
targetAudience
sourceLanguage
```

Output:

```json
{
  "tone": "professional-practical",
  "technicalDepth": "medium-high",
  "structureRules": [
    "problem",
    "approach",
    "example",
    "tradeoffs",
    "conclusion"
  ],
  "reviewRules": [
    "technical-consistency",
    "practical-example",
    "tradeoffs"
  ]
}
```

## 7. Prompt builder

Prompt builder ghép:

```text
System instructions
+ Editorial profile
+ Task instructions
+ Scope rules
+ Structured document
+ User instruction
```

Không nên để frontend tự gửi prompt hệ thống.

## 8. Model Router

Ví dụ:

```text
autocomplete        → fast-small
rewrite             → fast-medium
translation         → translation
article-review      → large-reviewer
technical-review    → large-technical
```

Model profile được cấu hình server-side.

## 9. Output validation

Mọi structured response phải validate bằng schema, ví dụ Zod.

Không trả JSON của LLM thẳng cho frontend nếu chưa validate.

Nếu invalid:

1. attempt repair/second pass
2. retry có giới hạn
3. trả lỗi có requestId

## 10. Timeout / retry

Gợi ý:

- connection timeout: ngắn
- generation timeout: dài hơn theo task
- retry tối đa: 1–2 lần
- không retry lỗi validation vô hạn

## 11. Logging

Log tối thiểu:

- requestId
- userId
- articleId nếu có
- task
- scope
- modelProfile
- model name
- latency
- status
- validation result
- error category

Không log nội dung nhạy cảm nếu không cần.
