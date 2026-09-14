AI 지식 플랫폼을 위한 현대적인 CMS “Create / Edit Post” 화면을 디자인하고 구현합니다.

이 플랫폼은 다음 3개 언어를 지원합니다.

-   English
-   Vietnamese
-   Korean

콘텐츠 작성 경험은 다음 세 가지 제품의 장점을 결합한 느낌이어야 합니다.

**Notion + GitBook + Modern Editorial CMS**

단, 기존 제품의 UI를 그대로 복제하지 말고 독창적인 디자인으로 구성합니다.

이 시스템의 주요 사용자는 AI 콘텐츠를 작성하는 관리자와 contributor입니다.

작성 가능한 콘텐츠 유형:

-   Learning
-   Tutorials
-   AI Guides
-   Best Practices
-   Research
-   AI Tools
-   AI Libraries
-   Prompt Engineering
-   Model Comparison
-   Technical Documentation
-   Community
-   Case Studies

이 화면은 일반적인 CRUD form이 아니라 **전문적인 document editor**처럼 느껴져야 합니다.

---

## 1. Technology / UI Direction

사용 기술:

-   Vue 3
-   TypeScript
-   Tailwind CSS
-   shadcn-vue 또는 이에 준하는 modern component system
-   Tiptap 또는 확장 가능한 block-based rich text editor
-   Responsive desktop-first layout

디자인 스타일:

-   Minimal
-   Premium
-   Modern
-   Technical but approachable
-   Notion과 GitBook을 연상시키는 높은 usability
-   AI / Technology 제품에 적합한 typography
-   충분한 whitespace
-   subtle border
-   subtle shadow
-   neutral background
-   명확한 visual hierarchy
-   keyboard 및 mouse interaction에 최적화

다음 스타일은 피합니다.

-   과도한 gradient
-   과도한 glassmorphism
-   지나치게 화려한 dashboard
-   오래된 WordPress 스타일
-   지나치게 복잡한 enterprise UI
-   너무 많은 rounded card
-   큰 decorative illustration

가장 중요한 것은 콘텐츠 작성 경험입니다.

---

## 2. Overall Layout

3-column editor layout을 사용합니다.

### Top Navigation Bar

상단 bar는 sticky 상태로 유지하고 다음 요소를 포함합니다.

-   Back to Posts
-   New Article 또는 article title
-   Autosave status
-   Preview
-   Translation
-   Save Draft
-   Publish

예:

Back to Posts | New Article | Saved ✓ | Preview | Translate | Save Draft | Publish

Autosave 상태:

-   Saving…
-   Saved just now
-   Unsaved changes
-   Failed to save

Autosave indicator는 작고 subtle하게 표시합니다.

---

## 3. Left Column — Document Outline

H1/H2/H3 heading을 기반으로 문서 outline을 자동 생성합니다.

예:

OUTLINE

Introduction

What is RAG?

Architecture

Retrieval

Reranking

Evaluation

Best Practices

Conclusion

기능:

-   heading 변경 시 자동 업데이트
-   현재 section highlight
-   클릭 시 해당 section으로 scroll
-   H1/H2/H3 hierarchy 지원
-   sticky 상태 유지

왼쪽 영역은 좁고 시각적으로 조용해야 합니다.

---

## 4. Center Column — Writing Canvas

가장 중요한 영역입니다.

일반적인 form이 아니라 전문적인 document editor처럼 느껴져야 합니다.

Editor 상단:

CATEGORY / CONTENT TYPE

예:

Best Practices · Tutorial

### Article title

큰 title input.

예:

How to Build a Production RAG System

그 아래:

### Subtitle / Excerpt

A practical guide to designing, evaluating, and maintaining reliable RAG systems.

그 다음 rich text editor를 배치합니다.

지원 block:

-   Paragraph
-   H1
-   H2
-   H3
-   Bold
-   Italic
-   Underline
-   Inline code
-   Link
-   Blockquote
-   Bullet list
-   Numbered list
-   Checklist
-   Divider
-   Image
-   Video
-   File
-   Table
-   Code block
-   Callout
-   Math / LaTeX
-   Embed
-   Prompt block
-   Model comparison block
-   AI example block

---

## 5. Slash Command

Editor에서 `/`를 입력하면 command menu를 표시합니다.

카테고리:

BASIC BLOCKS

-   Paragraph
-   Heading 1
-   Heading 2
-   Heading 3
-   Bullet List
-   Numbered List
-   Quote
-   Divider

MEDIA

-   Image
-   Video
-   File
-   Embed

AI / TECHNICAL

-   Code Block
-   Prompt
-   Model Comparison
-   AI Output
-   Callout
-   Math

지원 기능:

-   Keyboard navigation
-   Search/filter
-   Icon
-   Short description
-   Shortcut

---

## 6. Floating Toolbar

텍스트를 선택하면 floating toolbar:

[B] [I] [U] [Link] [Code] [Comment] [✨ AI]

표시.

특히:

✨ AI

버튼을 중요하게 디자인합니다.

클릭하면 AI assistant menu:

-   Improve writing
-   Make clearer
-   Make shorter
-   Make longer
-   Fix grammar
-   Change tone
-   Explain
-   Generate example
-   Generate code
-   Summarize
-   Translate

추가:

Custom instruction…

AI는 선택한 text 또는 현재 block을 대상으로 동작해야 합니다.

---

## 7. AI-specific Content Blocks

AI 콘텐츠에 적합한 전용 block을 제공합니다.

### Prompt Block

PROMPT

System:
You are an expert AI assistant...

User:
Analyze the following document...

Model:
GPT-5

Temperature:
0.7

instruction, input, model, parameters, output을 시각적으로 구분합니다.

### Code Block

다음을 제공합니다.

-   Programming language
-   Syntax highlighting
-   Copy button
-   Optional Run button

### Model Comparison Block

다음과 같은 비교 정보를 쉽게 작성할 수 있도록 합니다.

Model | Cost | Speed | Context | Score

---

## 8. Right Column — Post Settings

오른쪽 sidebar는 collapsible sections로 구성합니다.

### Publish

Status:

Draft / In Review / Published

Visibility:

Public / Private

Actions:

Save Draft
Publish

### Content

Category:

-   Learning
-   Library
-   Best Practices
-   Community

Content Type:

-   Article
-   Tutorial
-   Guide
-   Case Study
-   Research
-   Tool
-   Prompt
-   News

Tags:

RAG
LLM
Agents
Prompt Engineering
AI Engineering

사용자가 custom tag도 생성할 수 있어야 합니다.

### Author

Author selector.

### Cover Image

현재 cover를 보여줍니다.

Frontend card:

480 × 270 px

Aspect ratio:

16:9

Actions:

-   Upload image
-   Replace image
-   Remove image
-   Adjust crop

---

## 9. Cover Image Crop UX

매우 중요한 기능입니다.

사용자가:

Adjust crop

을 누르면 crop editor를 표시합니다.

이미지는 실제 frontend card와 동일한 16:9 viewport 안에서 보여야 합니다.

Preview:

480 × 270

작성자는 다음을 할 수 있어야 합니다.

-   이미지 drag
-   zoom
-   horizontal reposition
-   vertical reposition
-   reset
-   apply

고정된 16:9 viewport 아래에서 이미지를 이동시키는 방식으로 구현합니다.

사용자는 이미지가 실제 website에서 어떻게 보일지 즉시 확인할 수 있어야 합니다.

가능하면 crop된 새로운 이미지 파일을 매번 생성하지 말고 crop metadata를 저장합니다.

예:

{
"positionX": 0.62,
"positionY": 0.38,
"zoom": 1.12
}

---

## 10. Smart Focal Point

추후 확장 가능한 기능:

Auto Focus

이미지 업로드 후 다음 영역을 탐지할 수 있습니다.

-   Face
-   Main subject
-   Text
-   Important visual region

그리고 가장 적합한 focal point를 제안합니다.

사용자는 drag를 통해 항상 직접 수정할 수 있어야 합니다.

첫 번째 버전에서는 실제 AI detection을 완성하지 않아도 되지만 UI architecture는 이를 지원할 수 있도록 설계합니다.

---

## 11. Translation System

지원 언어는 정확히 세 개입니다.

-   English
-   Vietnamese
-   Korean

모든 article에는 source language가 하나 존재합니다.

예:

English = SOURCE

Vietnamese = Translation

Korean = Translation

일반 편집 모드에서 세 개의 전체 editor를 나란히 보여주지 않습니다.

한 번에 하나의 language만 편집합니다.

Editor 상단에 language switcher:

English · Vietnamese · Korean

예:

🇬🇧 English
SOURCE

🇻🇳 Vietnamese
Translation

🇰🇷 Korean
Translation

---

## 12. Automatic Translation Workflow

English가 source인 경우:

Translate 클릭.

다음 화면:

Translate Article

From:
English

To:

☑ Vietnamese
☑ Korean

Buttons:

Translate All
Cancel

Frontend는 local translation API를 호출합니다.

예상 API:

POST /api/translate

Request:

{
"sourceLanguage": "en",
"targetLanguages": ["vi", "ko"],
"content": {...}
}

각 language마다 translation progress를 표시합니다.

예:

Vietnamese
Translating…

Korean
Waiting…

완료 후:

Vietnamese
Translated ✓

Korean
Translated ✓

translation 중에도 전체 UI를 불필요하게 막지 않습니다.

---

## 13. Document Structure Preservation

전체 HTML 문자열을 단순히 번역하지 않습니다.

가능하면 structured document data를 translation API에 전달합니다.

번역 대상:

-   paragraph text
-   heading text
-   quote text
-   description
-   callout text
-   table text

그대로 유지해야 하는 것:

-   heading structure
-   paragraph structure
-   lists
-   links
-   images
-   tables structure
-   code blocks
-   URLs
-   technical identifiers
-   model names
-   programming syntax
-   file names
-   commands

특히 code는 자동 번역하지 않습니다.

---

## 14. Translation Status

각 language마다 독립적인 status가 존재해야 합니다.

예:

TRANSLATIONS

🇬🇧 English
Published

🇻🇳 Vietnamese
Translated · Needs Review

🇰🇷 Korean
Translated · Reviewed

상태:

-   Not translated
-   Translating
-   Translated
-   Needs review
-   Reviewed
-   Outdated
-   Published

---

## 15. Translation Review Mode

Vietnamese → Review를 클릭하면 review interface를 엽니다.

2-column comparison:

LEFT:
🇬🇧 English

RIGHT:
🇻🇳 Vietnamese

예:

English:
RAG combines retrieval with generation.

Vietnamese:
RAG kết hợp khả năng truy xuất với khả năng sinh nội dung.

Vietnamese content는 완전히 editable이어야 합니다.

지원 기능:

-   Edit
-   Accept
-   Rewrite
-   Review block by block

자동 번역임을 명확하게 표시합니다.

예:

AI translated

또는:

Auto-translated · Needs review

---

## 16. Translation Versioning

English source가 변경된 이후 Vietnamese/Korean translation을 자동으로 overwrite하지 않습니다.

대신:

English updated

Vietnamese translation may be outdated.

[Review Changes]

Korean translation may be outdated.

[Review Changes]

source version과 translated version 사이의 관계를 추적해야 합니다.

예:

English:
Updated

Vietnamese:
Outdated

Korean:
Outdated

---

## 17. Shared Cover

기본적으로 세 language는 하나의 cover를 공유합니다.

예:

English
same cover

Vietnamese
same cover

Korean
same cover

Option:

☑ Use same cover image for all languages

추가 option:

Use language-specific cover

cover에 특정 언어의 텍스트가 포함되어 있을 경우 language-specific cover를 사용할 수 있어야 합니다.

---

## 18. SEO

SEO section:

-   Slug
-   Meta title
-   Meta description
-   OG image
-   Canonical URL

character counter 포함.

예:

Meta title
How to Build a Production RAG System
42 / 60

Meta description
Learn how to design reliable production-ready RAG systems.
68 / 160

---

## 19. Save / Publish Workflow

다음을 지원합니다.

Save Draft

Preview

Submit for Review

Publish

Sticky top bar.

상태:

Saved ✓

또는:

Unsaved changes

Publish는 language별로 관리할 수 있어야 합니다.

예:

English
Published

Vietnamese
Draft

Korean
Needs Review

Actions:

Publish English

또는:

Publish Reviewed Languages

---

## 20. Responsive Design

Desktop을 primary environment로 합니다.

작은 화면에서는:

-   Left outline → collapse
-   Right settings → drawer
-   Writing canvas → 충분한 공간 확보
-   Top actions → 항상 접근 가능
-   세 개의 column을 작은 화면에 억지로 넣지 않음

---

## 21. Visual Direction

Editor 자체는 시각적으로 매우 조용해야 합니다.

강조할 요소:

-   Article title
-   Current language
-   Content
-   Publish state
-   Translation state

약하게 표현할 요소:

-   Metadata
-   Border
-   Secondary actions

Editor 전체를 카드 기반 dashboard처럼 만들지 않습니다.

Writing canvas는 넓고 깨끗하며 충분한 whitespace를 유지합니다.

---

## 22. 최종 화면 구조

TOP BAR

← Posts
New Article
Saved ✓
Preview
Translate
Save Draft
Publish

MAIN

OUTLINE | WRITING CANVAS | SETTINGS

OUTLINE

Introduction
What is RAG?
Architecture
Retrieval
Evaluation
Best Practices

WRITING CANVAS

🇬🇧 English · SOURCE

How to Build a Production RAG System

A practical guide to...

[Rich editor]

SETTINGS

Publish
Draft

Content
Best Practices
Tutorial

Tags
RAG
LLM
AI Engineering

Cover
[16:9 preview]
[Adjust]

Translations
🇬🇧 English · Source
🇻🇳 Vietnamese · Needs Review
🇰🇷 Korean · Reviewed

SEO
Slug
Description

최종 제품의 느낌은 **AI 지식 플랫폼을 위한 전문적인 editorial workspace**여야 합니다.

Notion의 편안한 writing experience, GitBook의 structured documentation, 현대적인 CMS의 publishing workflow를 결합합니다.

장식적인 요소보다 다음을 우선합니다:

-   UX
-   keyboard accessibility
-   content hierarchy
-   multilingual workflow
-   translation review
-   정확한 16:9 cover cropping
-   안정적인 draft/publish workflow
