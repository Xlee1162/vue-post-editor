# AI Editorial Copilot — Documentation Pack

Bộ tài liệu này mô tả triển khai AI Editorial Copilot cho CMS tạo bài viết.

## Files

- `00-AI-COPILOT-IMPLEMENTATION-PLAN.md` — roadmap, architecture, MVP, project structure
- `01-FRONTEND-IMPLEMENTATION.md` — Vue 3/Tiptap UI, AI menu, SSE, apply flow
- `02-BACKEND-API-IMPLEMENTATION.md` — AI Gateway, API contract, task registry, model router, validation
- `03-AI-LOGIC-AND-WORKFLOWS.md` — logic context, editorial profile, technical review, translation, versioning
- `04-OLLAMA-LLM-SETUP.md` — Ollama adapter, model profiles, prompt strategy, structured output, routing, security

## Recommended implementation order

1. Backend contract + schemas
2. Ollama adapter
3. Frontend `useAICopilot()`
4. Selection rewrite
5. Section/article review
6. Translation workflow
7. Advanced editorial rules

## Core architectural idea

```text
Vue 3 CMS
    ↓
AI Gateway
    ↓
Task + Context + Editorial Profile
    ↓
Model Router
    ↓
Ollama / Local LLM
    ↓
Validated Structured Result
    ↓
Human Review
    ↓
Editor Revision
```
