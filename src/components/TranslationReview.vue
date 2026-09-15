<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  visible: boolean;
  sourceLanguage: string;
  targetLanguage: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'accept'): void;
}>();

interface ReviewBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'quote' | 'code';
  source: string;
  translated: string;
  status: 'ai-translated' | 'edited' | 'reviewed';
  editable: boolean;
}

const blocks = ref<ReviewBlock[]>([
  {
    id: 'b1',
    type: 'heading',
    source: 'How to Build a Production RAG System',
    translated: 'Cách Xây Dựng Hệ Thống RAG Cho Production',
    status: 'reviewed',
    editable: false,
  },
  {
    id: 'b2',
    type: 'paragraph',
    source: 'A practical guide to designing, evaluating, and maintaining reliable RAG systems.',
    translated: 'Hướng dẫn thực hành về thiết kế, đánh giá và duy trì các hệ thống RAG đáng tin cậy.',
    status: 'reviewed',
    editable: false,
  },
  {
    id: 'b3',
    type: 'paragraph',
    source: 'Retrieval-augmented generation is not just a pattern; it is a delivery system for trustworthy AI products.',
    translated: 'Retrieval-augmented generation không chỉ là một mô hình; đây là hệ thống phân phối cho các sản phẩm AI đáng tin cậy.',
    status: 'ai-translated',
    editable: false,
  },
  {
    id: 'b4',
    type: 'heading',
    source: 'Introduction',
    translated: 'Giới thiệu',
    status: 'reviewed',
    editable: false,
  },
  {
    id: 'b5',
    type: 'paragraph',
    source: 'Most teams start with a simple prompt and a vector database. That gets them an impressive demo, but production systems need much more: retrieval quality, latency control, observability, and a repeatable evaluation loop.',
    translated: 'Hầu hết các đội nhóm bắt đầu với một prompt đơn giản và một cơ sở dữ liệu vector. Điều này giúp họ có một demo ấn tượng, nhưng hệ thống production cần nhiều hơn thế: chất lượng truy xuất, kiểm soát độ trễ, khả năng quan sát và một vòng lặp đánh giá có thể lặp lại.',
    status: 'ai-translated',
    editable: false,
  },
  {
    id: 'b6',
    type: 'quote',
    source: '"The hardest part of RAG is not retrieval itself — it is making the full system reliable under real-world traffic."',
    translated: '"Phần khó nhất của RAG không phải là việc truy xuất — mà là làm cho toàn bộ hệ thống hoạt động đáng tin cậy dưới lưu lượng thực tế."',
    status: 'ai-translated',
    editable: false,
  },
  {
    id: 'b7',
    type: 'heading',
    source: 'What is RAG?',
    translated: 'RAG là gì?',
    status: 'reviewed',
    editable: false,
  },
  {
    id: 'b8',
    type: 'paragraph',
    source: 'In practice, a production RAG system combines a retriever, a generator, and a disciplined evaluation framework. The model is not the system; the system is the product.',
    translated: 'Trong thực tế, một hệ thống RAG production kết hợp một bộ truy xuất, một bộ sinh và một framework đánh giá có kỷ luật. Mô hình không phải là hệ thống; hệ thống chính là sản phẩm.',
    status: 'ai-translated',
    editable: false,
  },
  {
    id: 'b9',
    type: 'code',
    source: `const results = await retriever.search(query, {\n  topK: 8,\n  filters: { domain: 'docs', language: 'en' }\n})`,
    translated: `const results = await retriever.search(query, {\n  topK: 8,\n  filters: { domain: 'docs', language: 'en' }\n})`,
    status: 'reviewed',
    editable: false,
  },
]);

const editingBlock = ref<string | null>(null);

function statusLabel(status: string) {
  switch (status) {
    case 'ai-translated': return 'AI Translated';
    case 'edited': return 'Edited';
    case 'reviewed': return 'Reviewed ✓';
    default: return '';
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'ai-translated': return 'badge-ai';
    case 'edited': return 'badge-edited';
    case 'reviewed': return 'badge-reviewed';
    default: return '';
  }
}

function typeIcon(type: string) {
  switch (type) {
    case 'heading': return 'H';
    case 'paragraph': return '¶';
    case 'quote': return '"';
    case 'code': return '</>';
    default: return '•';
  }
}

function startEdit(block: ReviewBlock) {
  editingBlock.value = block.id;
  block.editable = true;
}

function finishEdit(block: ReviewBlock) {
  editingBlock.value = null;
  block.editable = false;
  block.status = 'edited';
}

function markReviewed(block: ReviewBlock) {
  block.status = 'reviewed';
  block.editable = false;
  editingBlock.value = null;
}

function acceptAll() {
  blocks.value.forEach((b) => {
    b.status = 'reviewed';
    b.editable = false;
  });
  editingBlock.value = null;
}

const reviewedCount = ref(0);
function updateCount() {
  reviewedCount.value = blocks.value.filter(b => b.status === 'reviewed').length;
}

function handleClose() {
  editingBlock.value = null;
  emit('close');
}
</script>

<template>
  <div v-if="visible" class="review-backdrop" @click="handleClose">
    <div class="review-panel" @click.stop>
      <div class="review-header">
        <div class="review-header-left">
          <div class="eyebrow">Translation Review</div>
          <h3>{{ sourceLanguage }} → {{ targetLanguage }}</h3>
        </div>
        <div class="review-header-right">
          <button class="action-btn subtle" @click="acceptAll">Accept All</button>
          <button class="action-btn primary" @click="emit('accept')">Done</button>
          <button class="close-button" @click="handleClose">✕</button>
        </div>
      </div>

      <div class="review-stats">
        <span class="stat-item">
          <span class="stat-dot reviewed"></span>
          {{ blocks.filter(b => b.status === 'reviewed').length }} Reviewed
        </span>
        <span class="stat-item">
          <span class="stat-dot ai"></span>
          {{ blocks.filter(b => b.status === 'ai-translated').length }} AI Translated
        </span>
        <span class="stat-item">
          <span class="stat-dot edited"></span>
          {{ blocks.filter(b => b.status === 'edited').length }} Edited
        </span>
      </div>

      <div class="review-columns">
        <div class="col-header source-header">
          <span class="col-flag">🇬🇧</span> {{ sourceLanguage }}
          <span class="col-tag">SOURCE</span>
        </div>
        <div class="col-header target-header">
          <span class="col-flag">🇻🇳</span> {{ targetLanguage }}
          <span class="col-tag editable-tag">EDITABLE</span>
        </div>
      </div>

      <div class="review-body">
        <div
          v-for="block in blocks"
          :key="block.id"
          class="review-row"
          :class="[`type-${block.type}`, { editing: editingBlock === block.id }]"
        >
          <div class="row-meta">
            <span class="type-icon">{{ typeIcon(block.type) }}</span>
            <span class="status-badge" :class="statusClass(block.status)">
              {{ statusLabel(block.status) }}
            </span>
          </div>

          <div class="row-content">
            <div class="source-col">
              <div v-if="block.type === 'code'" class="code-display">
                <pre>{{ block.source }}</pre>
              </div>
              <div v-else-if="block.type === 'heading'" class="heading-display">
                {{ block.source }}
              </div>
              <div v-else-if="block.type === 'quote'" class="quote-display">
                {{ block.source }}
              </div>
              <div v-else class="text-display">
                {{ block.source }}
              </div>
            </div>

            <div class="target-col">
              <div v-if="block.type === 'code'" class="code-display preserved">
                <pre>{{ block.translated }}</pre>
                <span class="preserved-badge">Preserved</span>
              </div>
              <template v-else>
                <textarea
                  v-if="block.editable"
                  v-model="block.translated"
                  class="edit-textarea"
                  rows="3"
                  @blur="finishEdit(block)"
                ></textarea>
                <div v-else class="text-display" :class="{ clickable: block.type !== 'code' }">
                  <span v-if="block.type === 'heading'" class="heading-display">{{ block.translated }}</span>
                  <span v-else-if="block.type === 'quote'" class="quote-display">{{ block.translated }}</span>
                  <span v-else>{{ block.translated }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="row-actions" v-if="block.type !== 'code'">
            <button
              v-if="!block.editable"
              class="row-btn"
              @click="startEdit(block)"
              title="Edit translation"
            >✎</button>
            <button
              v-if="block.status !== 'reviewed'"
              class="row-btn accept"
              @click="markReviewed(block)"
              title="Mark as reviewed"
            >✓</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.review-panel {
  width: min(960px, calc(100vw - 40px));
  max-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 32px 100px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(16px);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.review-header-left {
  min-width: 0;
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b7280;
}

.review-header h3 {
  margin: 4px 0 0;
  font-size: 1.2rem;
  color: #111827;
}

.review-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.close-button {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(17, 24, 39, 0.02);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #111827;
  cursor: pointer;
  font: inherit;
}

.action-btn {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.7);
  color: #111827;
  border-radius: 10px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease;
  font: inherit;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #111827;
  color: white;
  border-color: #111827;
}

.action-btn.subtle {
  background: rgba(17, 24, 39, 0.02);
}

.review-stats {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 24px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  background: rgba(17, 24, 39, 0.015);
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.stat-dot.reviewed { background: #22c55e; }
.stat-dot.ai { background: #6366f1; }
.stat-dot.edited { background: #f59e0b; }

.review-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.col-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.04em;
}

.source-header {
  border-right: 1px solid rgba(17, 24, 39, 0.06);
}

.col-flag {
  font-size: 16px;
}

.col-tag {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 3px 6px;
  border-radius: 4px;
  background: rgba(17, 24, 39, 0.06);
  color: #6b7280;
}

.editable-tag {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}

.review-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.review-row {
  position: relative;
  border-bottom: 1px solid rgba(17, 24, 39, 0.04);
  transition: background 0.15s ease;
}

.review-row:hover {
  background: rgba(17, 24, 39, 0.015);
}

.review-row.editing {
  background: rgba(59, 130, 246, 0.03);
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px 0;
}

.type-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: rgba(17, 24, 39, 0.05);
  color: #6b7280;
  font-size: 10px;
  font-weight: 700;
}

.status-badge {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.badge-ai {
  background: rgba(99, 102, 241, 0.08);
  color: #4338ca;
}

.badge-edited {
  background: rgba(245, 158, 11, 0.08);
  color: #b45309;
}

.badge-reviewed {
  background: rgba(34, 197, 94, 0.08);
  color: #15803d;
}

.row-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 6px 0 12px;
}

.source-col,
.target-col {
  padding: 6px 24px;
}

.source-col {
  border-right: 1px solid rgba(17, 24, 39, 0.06);
}

.text-display {
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
}

.text-display.clickable {
  cursor: text;
}

.heading-display {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
}

.quote-display {
  font-style: italic;
  color: #4b5563;
  padding-left: 14px;
  border-left: 3px solid #d1d5db;
  line-height: 1.7;
  font-size: 14px;
}

.code-display {
  position: relative;
  border-radius: 10px;
  background: #111827;
  padding: 12px 14px;
  overflow: auto;
}

.code-display pre {
  margin: 0;
  color: #e5e7eb;
  font-size: 12px;
  line-height: 1.6;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  white-space: pre-wrap;
}

.code-display.preserved {
  opacity: 0.7;
}

.preserved-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.edit-textarea {
  width: 100%;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #111827;
  background: rgba(255, 255, 255, 0.8);
  resize: vertical;
  font-family: inherit;
  outline: none;
}

.edit-textarea:focus {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.row-actions {
  position: absolute;
  top: 8px;
  right: 16px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.review-row:hover .row-actions {
  opacity: 1;
}

.row-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
  font: inherit;
}

.row-btn:hover {
  background: #fff;
  color: #111827;
  transform: translateY(-1px);
}

.row-btn.accept {
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.2);
}

.row-btn.accept:hover {
  background: rgba(34, 197, 94, 0.08);
}

@media (max-width: 700px) {
  .review-panel {
    width: calc(100vw - 20px);
    max-height: calc(100vh - 30px);
    border-radius: 14px;
  }

  .row-content {
    grid-template-columns: 1fr;
  }

  .source-col {
    border-right: none;
    border-bottom: 1px solid rgba(17, 24, 39, 0.06);
    padding-bottom: 12px;
  }

  .review-columns {
    grid-template-columns: 1fr;
  }

  .source-header {
    border-right: none;
    border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  }

  .row-actions {
    opacity: 1;
  }
}
</style>
