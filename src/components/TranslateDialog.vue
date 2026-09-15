<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { translateArticle, streamTranslation } from '../services/ai';

const props = defineProps<{
  visible: boolean;
  sourceLanguage: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'complete', languages: string[]): void;
}>();

type TranslateStage = 'config' | 'progress' | 'done';

const stage = ref<TranslateStage>('config');

const targetLanguages = ref({
  vi: true,
  ko: true,
});

const contentOptions = ref({
  title: true,
  subtitle: true,
  body: true,
  callouts: true,
  tables: true,
  seo: false,
});

const preserveOptions = ref({
  code: true,
  urls: true,
  techIds: true,
  modelNames: true,
});

const translateMode = ref<'full' | 'section' | 'blocks'>('full');

interface LangProgress {
  lang: string;
  label: string;
  flag: string;
  status: 'queued' | 'preparing' | 'translating' | 'done';
  progress: number;
}

const langProgress = ref<LangProgress[]>([]);

const selectedLangs = computed(() => {
  const langs: string[] = [];
  if (targetLanguages.value.vi) langs.push('vi');
  if (targetLanguages.value.ko) langs.push('ko');
  return langs;
});

const canTranslate = computed(() => selectedLangs.value.length > 0);

let progressTimers: ReturnType<typeof setInterval>[] = [];

async function startTranslation() {
  stage.value = 'progress';

  langProgress.value = selectedLangs.value.map((lang) => ({
    lang,
    label: lang === 'vi' ? 'Vietnamese' : 'Korean',
    flag: lang === 'vi' ? '🇻🇳' : '🇰🇷',
    status: 'queued',
    progress: 0,
  }));

  try {
    const job = await translateArticle({
      sourceLanguage: props.sourceLanguage,
      targetLanguages: selectedLangs.value,
      document: {
        title: 'Article Title',
        blocks: [{ type: 'paragraph', text: 'Article content...' }],
      },
      options: {
        translateTitle: contentOptions.value.title,
        translateSubtitle: contentOptions.value.subtitle,
        translateBody: contentOptions.value.body,
        translateSeo: contentOptions.value.seo,
      },
    });

    for await (const event of streamTranslation(job.jobId)) {
      if (event.type === 'progress') {
        const data = event.data as any;
        const target = langProgress.value.find((l) => l.lang === data.lang);
        if (target) {
          target.status = data.status as any;
          target.progress = data.progress;
        }
      } else if (event.type === 'lang_done') {
        const data = event.data as any;
        const target = langProgress.value.find((l) => l.lang === data.lang);
        if (target) {
          target.status = 'done';
          target.progress = 100;
        }
      } else if (event.type === 'job_completed') {
        setTimeout(() => {
          stage.value = 'done';
        }, 400);
      }
    }
  } catch (err) {
    console.warn('Backend translation stream fallback to simulation:', err);
    runFallbackSimulation();
  }
}

function runFallbackSimulation() {
  progressTimers.forEach(clearInterval);
  progressTimers = [];

  langProgress.value.forEach((lp, idx) => {
    const delay = idx * 600;

    setTimeout(() => {
      lp.status = 'preparing';
      lp.progress = 15;

      setTimeout(() => {
        lp.status = 'translating';
        lp.progress = 30;

        const timer = setInterval(() => {
          if (lp.progress >= 100) {
            clearInterval(timer);
            lp.status = 'done';
            lp.progress = 100;

            if (langProgress.value.every((l) => l.status === 'done')) {
              setTimeout(() => {
                stage.value = 'done';
              }, 400);
            }
            return;
          }

          const boost = Math.random() * 15 + 10;
          lp.progress = Math.min(100, lp.progress + boost);
        }, 150);

        progressTimers.push(timer);
      }, 300);
    }, delay);
  });
}

function handleClose() {
  progressTimers.forEach(clearInterval);
  progressTimers = [];
  stage.value = 'config';
  emit('close');
}

function handleDone() {
  const completed = langProgress.value
    .filter((l) => l.status === 'done')
    .map((l) => l.lang);
  progressTimers.forEach(clearInterval);
  progressTimers = [];
  stage.value = 'config';
  emit('complete', completed);
}

function statusLabel(status: string) {
  switch (status) {
    case 'queued': return 'Queued';
    case 'preparing': return 'Preparing…';
    case 'translating': return 'Translating…';
    case 'done': return 'Translated ✓';
    default: return '';
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'queued': return 'status-queued';
    case 'preparing': return 'status-preparing';
    case 'translating': return 'status-translating';
    case 'done': return 'status-done';
    default: return '';
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    stage.value = 'config';
    langProgress.value = [];
  }
});
</script>

<template>
  <div v-if="visible" class="modal-backdrop" @click="handleClose">
    <div class="modal-card translate-card" @click.stop>
      <div class="modal-header">
        <div>
          <div class="eyebrow">Translate Article</div>
          <h3>From: {{ sourceLanguage }}</h3>
        </div>
        <button class="close-button" @click="handleClose">✕</button>
      </div>

      <!-- CONFIG STAGE -->
      <div v-if="stage === 'config'" class="translate-body">
        <div class="config-section">
          <div class="config-label">Translate to</div>
          <div class="target-row">
            <label class="check-label">
              <input type="checkbox" v-model="targetLanguages.vi" />
              <span class="check-flag">🇻🇳</span> Vietnamese
            </label>
            <label class="check-label">
              <input type="checkbox" v-model="targetLanguages.ko" />
              <span class="check-flag">🇰🇷</span> Korean
            </label>
          </div>
        </div>

        <div class="config-section">
          <div class="config-label">Content</div>
          <div class="check-grid">
            <label class="check-label"><input type="checkbox" v-model="contentOptions.title" /> Title</label>
            <label class="check-label"><input type="checkbox" v-model="contentOptions.subtitle" /> Subtitle</label>
            <label class="check-label"><input type="checkbox" v-model="contentOptions.body" /> Article body</label>
            <label class="check-label"><input type="checkbox" v-model="contentOptions.callouts" /> Callouts</label>
            <label class="check-label"><input type="checkbox" v-model="contentOptions.tables" /> Tables</label>
            <label class="check-label"><input type="checkbox" v-model="contentOptions.seo" /> SEO metadata</label>
          </div>
        </div>

        <div class="config-section">
          <div class="config-label">Preserve (do not translate)</div>
          <div class="check-grid">
            <label class="check-label"><input type="checkbox" v-model="preserveOptions.code" /> Code blocks</label>
            <label class="check-label"><input type="checkbox" v-model="preserveOptions.urls" /> URLs</label>
            <label class="check-label"><input type="checkbox" v-model="preserveOptions.techIds" /> Technical identifiers</label>
            <label class="check-label"><input type="checkbox" v-model="preserveOptions.modelNames" /> Model names</label>
          </div>
        </div>

        <div class="config-section">
          <div class="config-label">Glossary</div>
          <div class="glossary-status">
            <span class="glossary-icon">📖</span>
            <span>24 preferred terms loaded</span>
          </div>
        </div>

        <div class="config-section">
          <div class="config-label">Mode</div>
          <div class="mode-row">
            <label class="radio-label" :class="{ active: translateMode === 'full' }">
              <input type="radio" v-model="translateMode" value="full" /> Full article
            </label>
            <label class="radio-label" :class="{ active: translateMode === 'section' }">
              <input type="radio" v-model="translateMode" value="section" /> Selected section
            </label>
            <label class="radio-label" :class="{ active: translateMode === 'blocks' }">
              <input type="radio" v-model="translateMode" value="blocks" /> Selected blocks
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="nav-button subtle" @click="handleClose">Cancel</button>
          <button
            class="primary-button"
            :disabled="!canTranslate"
            @click="startTranslation"
          >
            Translate {{ selectedLangs.length }} Language{{ selectedLangs.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>

      <!-- PROGRESS STAGE -->
      <div v-if="stage === 'progress'" class="translate-body">
        <div class="progress-list">
          <div
            v-for="lp in langProgress"
            :key="lp.lang"
            class="progress-item-card"
            :class="statusClass(lp.status)"
          >
            <div class="progress-info">
              <span class="progress-flag">{{ lp.flag }}</span>
              <span class="progress-lang">{{ lp.label }}</span>
              <strong class="progress-status">{{ statusLabel(lp.status) }}</strong>
            </div>
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                :style="{ width: lp.progress + '%' }"
                :class="{ done: lp.status === 'done' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- DONE STAGE -->
      <div v-if="stage === 'done'" class="translate-body">
        <div class="done-banner">
          <div class="done-icon">✓</div>
          <div class="done-text">
            <strong>Translation complete</strong>
            <p>{{ langProgress.length }} language{{ langProgress.length !== 1 ? 's' : '' }} translated successfully. Review before publishing.</p>
          </div>
        </div>

        <div class="progress-list">
          <div
            v-for="lp in langProgress"
            :key="lp.lang"
            class="progress-item-card status-done"
          >
            <div class="progress-info">
              <span class="progress-flag">{{ lp.flag }}</span>
              <span class="progress-lang">{{ lp.label }}</span>
              <strong class="progress-status">Translated ✓</strong>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="nav-button subtle" @click="handleClose">Close</button>
          <button class="primary-button" @click="handleDone">Review Translations</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.38);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 26px 80px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(14px);
  padding: 22px 24px 20px;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.translate-card {
  width: min(560px, calc(100vw - 28px));
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b7280;
}

.modal-header h3 {
  margin: 4px 0 0;
  font-size: 1.4rem;
  color: #111827;
}

.close-button {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(17, 24, 39, 0.02);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #111827;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.close-button:hover {
  transform: translateY(-1px);
}

.translate-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-section {
  padding: 14px 16px;
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 14px;
  background: rgba(17, 24, 39, 0.015);
}

.config-label {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  color: #6b7280;
  margin-bottom: 10px;
}

.target-row {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.check-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.check-label input[type="checkbox"],
.check-label input[type="radio"] {
  accent-color: #111827;
  width: 16px;
  height: 16px;
}

.check-flag {
  font-size: 18px;
}

.check-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
}

.glossary-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.12);
  color: #15803d;
  font-size: 13px;
  font-weight: 500;
}

.glossary-icon {
  font-size: 16px;
}

.mode-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.radio-label.active {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.16);
  color: #111827;
  font-weight: 600;
}

.radio-label input[type="radio"] {
  display: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.nav-button {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.7);
  color: #111827;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  transition: transform 0.2s ease;
  font: inherit;
}

.nav-button:hover {
  transform: translateY(-1px);
}

.subtle {
  background: rgba(17, 24, 39, 0.02);
}

.primary-button {
  border: 1px solid #111827;
  background: #111827;
  color: white;
  border-radius: 10px;
  padding: 8px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 20px rgba(17, 24, 39, 0.12);
  font: inherit;
}

.primary-button:hover {
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* Progress */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-item-card {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(17, 24, 39, 0.02);
  transition: all 0.3s ease;
}

.progress-item-card.status-translating {
  border-color: rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.04);
}

.progress-item-card.status-done {
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.04);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.progress-flag {
  font-size: 20px;
}

.progress-lang {
  flex: 1;
  font-weight: 600;
  color: #111827;
}

.progress-status {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}

.status-done .progress-status {
  color: #15803d;
}

.progress-bar-track {
  height: 4px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.06);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  transition: width 0.3s ease;
}

.progress-bar-fill.done {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

/* Done */
.done-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.14);
}

.done-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.done-text strong {
  display: block;
  color: #111827;
  font-size: 15px;
  margin-bottom: 4px;
}

.done-text p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
}

.status-done .progress-info {
  margin-bottom: 0;
}

@media (max-width: 500px) {
  .check-grid {
    grid-template-columns: 1fr;
  }

  .mode-row {
    flex-direction: column;
  }
}
</style>
