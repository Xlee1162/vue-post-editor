<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import TranslateDialog from './components/TranslateDialog.vue';
import TranslationReview from './components/TranslationReview.vue';
import TagInput from './components/TagInput.vue';
import { runAI } from './services/ai';

/* ───── Article Content ───── */
const articleTitle = ref('How to Build a Production RAG System');
const articleSubtitle = ref('A practical guide to designing, evaluating, and maintaining reliable RAG systems.');

/* ───── Outline ───── */
const outlineItems = [
  { id: 'sec-intro', label: 'Introduction', level: 2 },
  { id: 'sec-what-is-rag', label: 'What is RAG?', level: 2 },
  { id: 'sec-architecture', label: 'Architecture', level: 2 },
  { id: 'sec-retrieval', label: 'Retrieval', level: 3 },
  { id: 'sec-best-practices', label: 'Best Practices', level: 2 },
  { id: 'sec-conclusion', label: 'Conclusion', level: 2 },
];

const activeOutline = ref('sec-intro');

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeOutline.value = id;
  }
}

/* Intersection observer for outline tracking */
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeOutline.value = entry.target.id;
        }
      }
    },
    { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
  );

  nextTick(() => {
    outlineItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer!.observe(el);
    });
  });
});

onUnmounted(() => {
  observer?.disconnect();
});

/* ───── Languages ───── */
type LangCode = 'en' | 'vi' | 'ko';

interface Language {
  label: string;
  code: LangCode;
  flag: string;
  role: 'source' | 'translation';
  status: 'published' | 'needs-review' | 'reviewed' | 'not-translated' | 'translating' | 'outdated';
}

const activeLanguage = ref<LangCode>('en');

const languages = ref<Language[]>([
  { label: 'English', code: 'en', flag: '🇬🇧', role: 'source', status: 'published' },
  { label: 'Vietnamese', code: 'vi', flag: '🇻🇳', role: 'translation', status: 'not-translated' },
  { label: 'Korean', code: 'ko', flag: '🇰🇷', role: 'translation', status: 'not-translated' },
]);

const currentLang = computed(() => languages.value.find((l) => l.code === activeLanguage.value)!);

function switchLanguage(code: LangCode) {
  activeLanguage.value = code;
}

function langStatusLabel(status: string) {
  switch (status) {
    case 'published': return 'Published';
    case 'needs-review': return 'Needs Review';
    case 'reviewed': return 'Reviewed';
    case 'not-translated': return 'Not Translated';
    case 'translating': return 'Translating…';
    case 'outdated': return 'Outdated';
    default: return '';
  }
}

function langStatusClass(status: string) {
  switch (status) {
    case 'published': return 'ls-published';
    case 'needs-review': return 'ls-needs-review';
    case 'reviewed': return 'ls-reviewed';
    case 'not-translated': return 'ls-not-translated';
    case 'translating': return 'ls-translating';
    case 'outdated': return 'ls-outdated';
    default: return '';
  }
}

/* ───── Article Metadata ───── */
const categories = ['Learning', 'Library', 'Best Practices', 'Community', 'Research', 'AI Tools'];
const contentTypes = ['Article', 'Tutorial', 'Guide', 'Case Study', 'Research', 'Tool', 'Prompt', 'News'];
const selectedCategory = ref('Best Practices');
const selectedContentType = ref('Tutorial');
const showCategoryDrop = ref(false);
const showTypeDrop = ref(false);

function selectCategory(cat: string) {
  selectedCategory.value = cat;
  showCategoryDrop.value = false;
}

function selectContentType(ct: string) {
  selectedContentType.value = ct;
  showTypeDrop.value = false;
}

/* ───── Tags ───── */
const tagList = ref(['RAG', 'LLM', 'AI Engineering']);

/* ───── Author ───── */
const authors = ['Alex Chen', 'Sarah Kim', 'David Nguyen', 'Maria Park'];
const selectedAuthor = ref('Alex Chen');
const showAuthorDrop = ref(false);

function selectAuthor(author: string) {
  selectedAuthor.value = author;
  showAuthorDrop.value = false;
}

/* ───── Autosave ───── */
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'failed';
const saveStatus = ref<SaveStatus>('saved');
const saveStatusLabels: Record<SaveStatus, string> = {
  saved: 'Saved ✓',
  saving: 'Saving…',
  unsaved: 'Unsaved changes',
  failed: 'Failed to save',
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function simulateAutosave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveStatus.value = 'unsaved';

  saveTimer = setTimeout(() => {
    saveStatus.value = 'saving';
    setTimeout(() => {
      saveStatus.value = 'saved';
    }, 800);
  }, 1500);
}

/* ───── SEO ───── */
const seoSlug = ref('production-rag-system');
const seoTitle = ref('How to Build a Production RAG System');
const seoDescription = ref('Learn how to design reliable production-ready RAG systems.');

/* ───── AI Menu ───── */
const aiActions = [
  'Improve writing',
  'Make clearer',
  'Make shorter',
  'Make longer',
  'Fix grammar',
  'Change tone',
  'Explain',
  'Generate example',
  'Generate code',
  'Summarize',
  'Translate',
  'Custom instruction…',
];
const showAiMenu = ref(false);

/* ───── Slash Commands ───── */
const slashCommands = [
  { title: 'Paragraph', shortcut: '/', group: 'Basic Blocks', icon: '¶' },
  { title: 'Heading 1', shortcut: '⌘+1', group: 'Basic Blocks', icon: 'H1' },
  { title: 'Heading 2', shortcut: '⌘+2', group: 'Basic Blocks', icon: 'H2' },
  { title: 'Heading 3', shortcut: '⌘+3', group: 'Basic Blocks', icon: 'H3' },
  { title: 'Bullet List', shortcut: '-', group: 'Basic Blocks', icon: '•' },
  { title: 'Numbered List', shortcut: '1.', group: 'Basic Blocks', icon: '1.' },
  { title: 'Checklist', shortcut: '[]', group: 'Basic Blocks', icon: '☑' },
  { title: 'Quote', shortcut: '>', group: 'Basic Blocks', icon: '"' },
  { title: 'Divider', shortcut: '---', group: 'Basic Blocks', icon: '—' },
  { title: 'Image', shortcut: '/image', group: 'Media', icon: '◌' },
  { title: 'Video', shortcut: '/video', group: 'Media', icon: '▶' },
  { title: 'File', shortcut: '/file', group: 'Media', icon: '📎' },
  { title: 'Embed', shortcut: '/embed', group: 'Media', icon: '⧉' },
  { title: 'Code Block', shortcut: '```', group: 'AI / Technical', icon: '</>' },
  { title: 'Prompt', shortcut: '/prompt', group: 'AI / Technical', icon: '✦' },
  { title: 'Model Comparison', shortcut: '/compare', group: 'AI / Technical', icon: '⊞' },
  { title: 'Callout', shortcut: '/callout', group: 'AI / Technical', icon: '💡' },
  { title: 'Math', shortcut: '/math', group: 'AI / Technical', icon: '∑' },
];
const showSlashMenu = ref(false);

/* ───── AI State & Toasts ───── */
const aiLoading = ref(false);
const aiToastMessage = ref('');

function showAiToast(msg: string, duration = 3500) {
  aiToastMessage.value = msg;
  setTimeout(() => {
    if (aiToastMessage.value === msg) aiToastMessage.value = '';
  }, duration);
}

/* ───── Toolbar Formatting Commands ───── */
function formatDoc(cmd: string, arg: string = '') {
  document.execCommand(cmd, false, arg);
}

function insertLink() {
  const url = prompt('Enter URL:', 'https://');
  if (url) {
    document.execCommand('createLink', false, url);
  }
}

function insertComment() {
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.className = 'editor-comment';
    mark.style.background = 'rgba(253, 224, 71, 0.45)';
    mark.style.borderRadius = '4px';
    mark.style.padding = '2px 4px';
    mark.title = 'User comment highlight';
    try {
      range.surroundContents(mark);
    } catch {
      document.execCommand('backColor', false, '#fef08a');
    }
  } else {
    document.execCommand('backColor', false, '#fef08a');
  }
}

function executeSlashCommand(item: { title: string }) {
  showSlashMenu.value = false;
  switch (item.title) {
    case 'Paragraph':
      formatDoc('formatBlock', 'p');
      break;
    case 'Heading 1':
      formatDoc('formatBlock', 'h1');
      break;
    case 'Heading 2':
      formatDoc('formatBlock', 'h2');
      break;
    case 'Heading 3':
      formatDoc('formatBlock', 'h3');
      break;
    case 'Bullet List':
      formatDoc('insertUnorderedList');
      break;
    case 'Numbered List':
      formatDoc('insertOrderedList');
      break;
    case 'Checklist':
      formatDoc('insertHTML', '<ul class="checklist" style="list-style:none;padding-left:0;"><li><input type="checkbox" checked /> Sample completed item</li><li><input type="checkbox" /> New task item</li></ul>');
      break;
    case 'Quote':
      formatDoc('formatBlock', 'blockquote');
      break;
    case 'Divider':
      formatDoc('insertHorizontalRule');
      break;
    case 'Image': {
      const url = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=800&q=80');
      if (url) formatDoc('insertImage', url);
      break;
    }
    case 'Video': {
      const url = prompt('Enter Video Embed URL:', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
      if (url) formatDoc('insertHTML', `<div class="video-embed" style="margin:16px 0;aspect-ratio:16/9;"><iframe src="${url}" style="width:100%;height:100%;border-radius:12px;border:none;"></iframe></div>`);
      break;
    }
    case 'File': {
      formatDoc('insertHTML', '<a class="file-attachment" href="#" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#f3f4f6;border-radius:8px;text-decoration:none;color:#374151;">📎 Document.pdf (2.4 MB)</a>');
      break;
    }
    case 'Embed': {
      formatDoc('insertHTML', '<div class="embed-box" style="padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;margin:12px 0;"><strong>Embedded Widget</strong><p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Interactive widget content loaded.</p></div>');
      break;
    }
    case 'Code Block':
      formatDoc('insertHTML', '<pre style="background:#1e293b;color:#f8fafc;padding:16px;border-radius:12px;font-family:monospace;overflow-x:auto;"><code>// Code block sample\nfunction helloWorld() {\n  console.log("Hello from Post Editor!");\n}</code></pre>');
      break;
    case 'Prompt':
      formatDoc('insertHTML', '<div class="prompt-card"><div class="card-header">Prompt</div><div class="prompt-body"><div class="prompt-row"><span>System</span><p>You are an expert technical editor.</p></div></div></div>');
      break;
    case 'Model Comparison':
      formatDoc('insertHTML', '<table style="width:100%;border-collapse:collapse;margin:16px 0;"><thead><tr style="background:#f3f4f6;"><th style="border:1px solid #d1d5db;padding:8px;">Model</th><th style="border:1px solid #d1d5db;padding:8px;">Latency</th><th style="border:1px solid #d1d5db;padding:8px;">Score</th></tr></thead><tbody><tr><td style="border:1px solid #d1d5db;padding:8px;">Qwen 2.5 7B</td><td style="border:1px solid #d1d5db;padding:8px;">120ms</td><td style="border:1px solid #d1d5db;padding:8px;">94%</td></tr></tbody></table>');
      break;
    case 'Callout':
      formatDoc('insertHTML', '<div class="callout-block callout-info"><div class="callout-icon">💡</div><div class="callout-content"><strong>Tip</strong><p>Write clear and concise content for optimal reader engagement.</p></div></div>');
      break;
    case 'Math':
      formatDoc('insertHTML', '<span class="math-formula" style="font-family:serif;font-style:italic;background:#f3f4f6;padding:2px 6px;border-radius:4px;">E = mc²</span>');
      break;
  }
}

async function executeAiAction(action: string) {
  showAiMenu.value = false;
  if (action === 'Translate') {
    showTranslateModal.value = true;
    return;
  }

  const sel = window.getSelection();
  const selectedText = sel ? sel.toString().trim() : '';
  const textToProcess = selectedText || articleTitle.value || 'Production RAG System';

  const taskMap: Record<string, string> = {
    'Improve writing': 'rewrite',
    'Make clearer': 'rewrite',
    'Make shorter': 'shorten',
    'Make longer': 'expand',
    'Fix grammar': 'rewrite',
    'Change tone': 'rewrite',
    'Explain': 'explain',
    'Generate example': 'generate_example',
    'Generate code': 'generate_code',
    'Summarize': 'summarize',
    'Custom instruction…': 'rewrite',
  };

  const task = taskMap[action] || 'rewrite';
  aiLoading.value = true;
  showAiToast(`AI Processing: "${action}"…`, 10000);

  try {
    const res = await runAI({
      task,
      scope: 'selection',
      context: {
        category: selectedCategory.value,
        contentType: selectedContentType.value,
        targetAudience: 'Developers',
        sourceLanguage: 'en',
      },
      selection: { text: textToProcess },
    });

    aiLoading.value = false;

    if (res.status === 'completed' && res.result) {
      if (res.result.type === 'suggestion') {
        if (sel && sel.rangeCount > 0 && selectedText) {
          document.execCommand('insertText', false, res.result.suggested);
        } else {
          formatDoc('insertHTML', `<p style="background:rgba(59,130,246,0.08);border-left:4px solid #3b82f6;padding:10px 14px;border-radius:0 8px 8px 0;margin:12px 0;"><strong>✨ AI (${action}):</strong> ${res.result.suggested}</p>`);
        }
        showAiToast(`AI Completed: ${action} ✓`, 4000);
      } else if (res.result.type === 'text') {
        formatDoc('insertHTML', `<p style="background:rgba(59,130,246,0.08);border-left:4px solid #3b82f6;padding:10px 14px;border-radius:0 8px 8px 0;margin:12px 0;"><strong>✨ AI (${action}):</strong> ${res.result.content}</p>`);
        showAiToast(`AI Completed: ${action} ✓`, 4000);
      }
    } else {
      showAiToast(`AI Error: ${res.error || 'Failed to process request'}`, 4000);
    }
  } catch (err: any) {
    aiLoading.value = false;
    showAiToast(`AI Error: ${err.message || 'Server error'}`, 4000);
  }
}

/* ───── Modals ───── */
const showTranslateModal = ref(false);
const showReviewModal = ref(false);
const showCropModal = ref(false);

/* ───── Cover ───── */
const coverImage = ref(
  'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80'
);
const hasCover = ref(true);
const coverZoom = ref(1);
const coverOffsetX = ref(0);
const coverOffsetY = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);
const isDraggingCrop = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragOriginOffset = ref({ x: 0, y: 0 });
const coverRenderScale = 1600;

const coverPreviewStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.28)), url(${coverImage.value})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
}));

const cropPreviewStyle = computed(() => ({
  backgroundImage: `url(${coverImage.value})`,
  backgroundPosition: 'center center',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  transform: `translate(${coverOffsetX.value}px, ${coverOffsetY.value}px) scale(${coverZoom.value})`,
  transformOrigin: 'center center',
}));

function triggerCoverUpload() {
  fileInput.value?.click();
}

function onCoverFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;

  const url = URL.createObjectURL(file);
  coverImage.value = url;
  hasCover.value = true;
  coverZoom.value = 1;
  coverOffsetX.value = 0;
  coverOffsetY.value = 0;
  showCropModal.value = true;
  input.value = '';
}

function replaceCover() {
  triggerCoverUpload();
}

function removeCover() {
  hasCover.value = false;
  coverImage.value = '';
}

function resetCrop() {
  coverZoom.value = 1;
  coverOffsetX.value = 0;
  coverOffsetY.value = 0;
}

function adjustCrop(deltaZoom: number, dx = 0, dy = 0) {
  coverZoom.value = Math.min(5, Math.max(1, coverZoom.value + deltaZoom));
  coverOffsetX.value += dx;
  coverOffsetY.value += dy;
}

function startCropDrag(event: PointerEvent) {
  isDraggingCrop.value = true;
  dragStart.value = { x: event.clientX, y: event.clientY };
  dragOriginOffset.value = { x: coverOffsetX.value, y: coverOffsetY.value };
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
}

function onCropDrag(event: PointerEvent) {
  if (!isDraggingCrop.value) return;
  const dx = event.clientX - dragStart.value.x;
  const dy = event.clientY - dragStart.value.y;
  coverOffsetX.value = dragOriginOffset.value.x + dx;
  coverOffsetY.value = dragOriginOffset.value.y + dy;
}

function stopCropDrag() {
  isDraggingCrop.value = false;
}

function handleCropWheel(event: WheelEvent) {
  event.preventDefault();
  const step = event.deltaY < 0 ? 0.12 : -0.12;
  coverZoom.value = Math.min(5, Math.max(1, coverZoom.value + step));
}

function renderCoverImageToWebp(): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const outputSize = coverRenderScale;
      canvas.width = outputSize;
      canvas.height = outputSize * 0.5625;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D is not available'));
        return;
      }

      const frameWidth = 520;
      const frameHeight = 293;
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale * coverZoom.value;
      const drawHeight = img.naturalHeight * scale * coverZoom.value;
      const offsetScaleX = canvas.width / frameWidth;
      const offsetScaleY = canvas.height / frameHeight;
      const drawX = canvas.width / 2 - drawWidth / 2 + coverOffsetX.value * offsetScaleX;
      const drawY = canvas.height / 2 - drawHeight / 2 + coverOffsetY.value * offsetScaleY;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Unable to create WebP image'));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        'image/webp',
        0.9
      );
    };

    img.onerror = () => reject(new Error('Unable to load image for cropping'));
    img.crossOrigin = 'anonymous';
    img.src = coverImage.value;
  });
}

async function applyCoverCrop() {
  try {
    const webpUrl = await renderCoverImageToWebp();
    coverImage.value = webpUrl;
  } catch (error) {
    console.error('Unable to crop cover image:', error);
  }
  showCropModal.value = false;
}

/* ───── Translation handlers ───── */
function onTranslateComplete(langs: string[]) {
  langs.forEach((langCode) => {
    const lang = languages.value.find((l) => l.code === langCode);
    if (lang) {
      lang.status = 'needs-review';
    }
  });
  showTranslateModal.value = false;
  showReviewModal.value = true;
}

function onReviewAccept() {
  const viLang = languages.value.find((l) => l.code === 'vi');
  if (viLang) viLang.status = 'reviewed';
  showReviewModal.value = false;
}

/* ───── Close all ───── */
function closeModal() {
  showTranslateModal.value = false;
  showCropModal.value = false;
  showAiMenu.value = false;
  showSlashMenu.value = false;
}

function closeDropdowns(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.dropdown-wrap')) {
    showCategoryDrop.value = false;
    showTypeDrop.value = false;
    showAuthorDrop.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>

<template>
  <div class="editor-app" @input="simulateAutosave">
    <!-- ═══════════ TOP BAR ═══════════ -->
    <header class="topbar">
      <div class="topbar-left">
        <button class="nav-button subtle">← Posts</button>
        <div class="article-header">
          <span class="eyebrow">New Article</span>
          <h1>{{ articleTitle || 'Untitled Article' }}</h1>
        </div>
      </div>

      <div class="topbar-status">
        <span class="status-pill" :class="`save-${saveStatus}`">
          {{ saveStatusLabels[saveStatus] }}
        </span>
      </div>

      <div class="topbar-actions">
        <button class="nav-button">Preview</button>
        <button class="nav-button" @click="showTranslateModal = true">Translate</button>
        <button class="nav-button">Save Draft</button>
        <button class="primary-button">Publish</button>
      </div>
    </header>

    <!-- ═══════════ MAIN LAYOUT ═══════════ -->
    <main class="workspace-layout">
      <!-- ─── Outline ─── -->
      <aside class="outline-panel">
        <div class="panel-label">Outline</div>
        <nav class="outline-list">
          <button
            v-for="item in outlineItems"
            :key="item.id"
            class="outline-item"
            :class="{ active: activeOutline === item.id, indented: item.level >= 3 }"
            @click="scrollToSection(item.id)"
          >
            <span class="outline-dot"></span>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- ─── Editor ─── -->
      <section class="editor-panel">
        <div class="editor-meta">
          <div class="meta-row">
            <!-- Category dropdown -->
            <div class="dropdown-wrap">
              <button class="meta-badge" @click.stop="showCategoryDrop = !showCategoryDrop">
                {{ selectedCategory }} ▾
              </button>
              <div v-if="showCategoryDrop" class="dropdown-menu">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="dropdown-item"
                  :class="{ active: cat === selectedCategory }"
                  @click="selectCategory(cat)"
                >{{ cat }}</button>
              </div>
            </div>
            <span class="separator">·</span>
            <!-- Content Type dropdown -->
            <div class="dropdown-wrap">
              <button class="meta-badge accent" @click.stop="showTypeDrop = !showTypeDrop">
                {{ selectedContentType }} ▾
              </button>
              <div v-if="showTypeDrop" class="dropdown-menu">
                <button
                  v-for="ct in contentTypes"
                  :key="ct"
                  class="dropdown-item"
                  :class="{ active: ct === selectedContentType }"
                  @click="selectContentType(ct)"
                >{{ ct }}</button>
              </div>
            </div>
          </div>

          <!-- Language switcher -->
          <div class="language-switcher">
            <button
              v-for="lang in languages"
              :key="lang.code"
              class="lang-pill"
              :class="{ active: activeLanguage === lang.code }"
              @click="switchLanguage(lang.code)"
            >
              {{ lang.flag }} {{ lang.label }}
              <span v-if="lang.role === 'source'" class="lang-role">SOURCE</span>
              <span v-else-if="lang.status !== 'not-translated'" class="lang-role translation">
                {{ langStatusLabel(lang.status) }}
              </span>
            </button>
          </div>
        </div>

        <input
          class="title-input"
          v-model="articleTitle"
          placeholder="Article title…"
          aria-label="Article title"
        />

        <textarea
          class="subtitle-input"
          v-model="articleSubtitle"
          placeholder="Write a short subtitle or excerpt…"
          aria-label="Subtitle"
        ></textarea>

        <div class="editor-toolbar">
          <button type="button" @mousedown.prevent="formatDoc('bold')" title="Bold (Ctrl+B)">B</button>
          <button type="button" @mousedown.prevent="formatDoc('italic')" title="Italic (Ctrl+I)">I</button>
          <button type="button" @mousedown.prevent="formatDoc('strikeThrough')" title="Strikethrough">U</button>
          <button type="button" @mousedown.prevent="insertLink()" title="Insert Link">Link</button>
          <button type="button" @mousedown.prevent="formatDoc('formatBlock', 'pre')" title="Code Block">Code</button>
          <button type="button" @mousedown.prevent="insertComment()" title="Highlight Comment">Comment</button>
          <button type="button" class="toolbar-slash" @click.stop="showSlashMenu = !showSlashMenu" title="Slash Commands (/)">
            /
          </button>
          <button type="button" class="ai-toolbar" @click.stop="showAiMenu = !showAiMenu" title="AI Assistant (Copilot)">
            ✨ AI
          </button>
        </div>

        <div class="editor-surface-wrap">
          <article class="editor-surface" contenteditable="true" spellcheck="false">
            <p class="lead">
              Retrieval-augmented generation is not just a pattern; it is a delivery system for trustworthy AI products.
            </p>

            <h2 id="sec-intro">Introduction</h2>
            <p>
              Most teams start with a simple prompt and a vector database. That gets them an impressive demo, but production systems need much more: retrieval quality, latency control, observability, and a repeatable evaluation loop.
            </p>

            <blockquote>
              "The hardest part of RAG is not retrieval itself — it is making the full system reliable under real-world traffic."
            </blockquote>

            <!-- Callout block -->
            <div class="callout-block callout-info">
              <div class="callout-icon">💡</div>
              <div class="callout-content">
                <strong>Tip</strong>
                <p>Start with a solid evaluation framework before optimizing your retrieval pipeline. You can't improve what you can't measure.</p>
              </div>
            </div>

            <h2 id="sec-what-is-rag">What is RAG?</h2>
            <p>
              In practice, a production RAG system combines a retriever, a generator, and a disciplined evaluation framework. The model is not the system; the system is the product.
            </p>

            <div class="prompt-card">
              <div class="card-header">Prompt</div>
              <div class="prompt-body">
                <div class="prompt-row">
                  <span>System</span>
                  <p>You are an expert AI assistant helping a team evaluate RAG quality.</p>
                </div>
                <div class="prompt-row">
                  <span>User</span>
                  <p>Analyze the current document and suggest improvements for reliability and clarity.</p>
                </div>
                <div class="prompt-meta">
                  <span>Model: GPT-5</span>
                  <span>Temperature: 0.7</span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <hr class="editor-divider" />

            <h2 id="sec-architecture">Architecture</h2>

            <!-- Callout warning -->
            <div class="callout-block callout-warning">
              <div class="callout-icon">⚠️</div>
              <div class="callout-content">
                <strong>Warning</strong>
                <p>Avoid sending entire documents to the LLM context window. Chunk strategically and use reranking to reduce noise.</p>
              </div>
            </div>

            <!-- Numbered list -->
            <ol class="editor-ol">
              <li>Define retrieval sources and ingestion quality gates.</li>
              <li>Monitor latency and chunk relevance in production.</li>
              <li>Score responses with grounded truth and rubric-based evaluation.</li>
            </ol>

            <h3 id="sec-retrieval">Retrieval</h3>
            <p>
              The retriever fetches the most relevant documents from your knowledge base. Quality depends on embedding models, chunking strategy, and metadata filtering.
            </p>

            <div class="code-block">
              <div class="code-header">
                <span>JavaScript</span>
                <button>Copy</button>
              </div>
              <pre><code>const results = await retriever.search(query, {
  topK: 8,
  filters: { domain: 'docs', language: 'en' }
})</code></pre>
            </div>

            <div class="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Cost</th>
                    <th>Speed</th>
                    <th>Context</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>GPT-4o</td>
                    <td>Medium</td>
                    <td>Fast</td>
                    <td>High</td>
                    <td>9.1</td>
                  </tr>
                  <tr>
                    <td>Claude 3.5</td>
                    <td>Medium</td>
                    <td>Medium</td>
                    <td>Very High</td>
                    <td>9.2</td>
                  </tr>
                  <tr>
                    <td>Llama 3.1</td>
                    <td>Low</td>
                    <td>Fast</td>
                    <td>Medium</td>
                    <td>8.6</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr class="editor-divider" />

            <h2 id="sec-best-practices">Best Practices</h2>

            <!-- Checklist -->
            <div class="checklist">
              <label class="checklist-item">
                <input type="checkbox" checked />
                <span>Use semantic chunking instead of fixed-size splits</span>
              </label>
              <label class="checklist-item">
                <input type="checkbox" checked />
                <span>Add metadata filters to narrow retrieval scope</span>
              </label>
              <label class="checklist-item">
                <input type="checkbox" />
                <span>Implement reranking to improve precision</span>
              </label>
              <label class="checklist-item">
                <input type="checkbox" />
                <span>Set up automated evaluation with ground truth</span>
              </label>
              <label class="checklist-item">
                <input type="checkbox" />
                <span>Monitor retrieval latency and cache hot queries</span>
              </label>
            </div>

            <!-- Callout success -->
            <div class="callout-block callout-success">
              <div class="callout-icon">✅</div>
              <div class="callout-content">
                <strong>Best Practice</strong>
                <p>Always separate retrieval quality from generation quality in your evaluation pipeline. This helps you isolate and fix issues faster.</p>
              </div>
            </div>

            <ul>
              <li>Use semantic chunking over naive fixed-length splits.</li>
              <li>Implement circuit breakers for external model calls.</li>
              <li>Keep your evaluation dataset versioned alongside your code.</li>
            </ul>

            <h2 id="sec-conclusion">Conclusion</h2>
            <p>
              Building a production RAG system requires more than connecting a vector database to an LLM. It demands thoughtful architecture, disciplined evaluation, and continuous iteration.
            </p>
          </article>

          <!-- Slash Menu -->
          <div v-if="showSlashMenu" class="slash-menu" @click="closeModal">
            <div class="slash-panel" @click.stop>
              <div class="slash-header">Slash commands</div>
              <div
                class="slash-group"
                v-for="group in ['Basic Blocks', 'Media', 'AI / Technical']"
                :key="group"
              >
                <div class="slash-label">{{ group }}</div>
                <button
                  v-for="item in slashCommands.filter((cmd) => cmd.group === group)"
                  :key="item.title"
                  class="slash-item"
                  @click.stop="executeSlashCommand(item)"
                >
                  <span class="slash-icon">{{ item.icon }}</span>
                  <span class="slash-copy">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.shortcut }}</small>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- AI Menu -->
          <div v-if="showAiMenu" class="ai-menu" @click="closeModal">
            <div class="ai-panel" @click.stop>
              <div class="slash-header">AI Assistant</div>
              <div class="ai-list">
                <button
                  v-for="action in aiActions"
                  :key="action"
                  class="ai-item"
                  @click.stop="executeAiAction(action)"
                >
                  {{ action }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Settings ─── -->
      <aside class="settings-panel">
        <!-- Publish -->
        <div class="settings-section">
          <div class="section-label">Publish</div>
          <div class="field-group">
            <label>Status</label>
            <div class="pill-select">Draft</div>
          </div>
          <div class="field-group">
            <label>Visibility</label>
            <div class="pill-select">Public</div>
          </div>
          <div class="action-row">
            <button class="nav-button subtle">Save Draft</button>
            <button class="primary-button">Publish</button>
          </div>
        </div>

        <!-- Content -->
        <div class="settings-section">
          <div class="section-label">Content</div>
          <div class="field-group">
            <label>Category</label>
            <div class="dropdown-wrap">
              <button class="pill-select clickable" @click.stop="showCategoryDrop = !showCategoryDrop">
                {{ selectedCategory }} ▾
              </button>
              <div v-if="showCategoryDrop" class="dropdown-menu settings-drop">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="dropdown-item"
                  :class="{ active: cat === selectedCategory }"
                  @click="selectCategory(cat)"
                >{{ cat }}</button>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label>Content Type</label>
            <div class="dropdown-wrap">
              <button class="pill-select clickable" @click.stop="showTypeDrop = !showTypeDrop">
                {{ selectedContentType }} ▾
              </button>
              <div v-if="showTypeDrop" class="dropdown-menu settings-drop">
                <button
                  v-for="ct in contentTypes"
                  :key="ct"
                  class="dropdown-item"
                  :class="{ active: ct === selectedContentType }"
                  @click="selectContentType(ct)"
                >{{ ct }}</button>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label>Tags</label>
            <TagInput v-model="tagList" />
          </div>
        </div>

        <!-- Author -->
        <div class="settings-section">
          <div class="section-label">Author</div>
          <div class="field-group">
            <div class="dropdown-wrap">
              <button class="author-select" @click.stop="showAuthorDrop = !showAuthorDrop">
                <span class="author-avatar">{{ selectedAuthor[0] }}</span>
                <span>{{ selectedAuthor }}</span>
                <span class="author-chevron">▾</span>
              </button>
              <div v-if="showAuthorDrop" class="dropdown-menu settings-drop">
                <button
                  v-for="a in authors"
                  :key="a"
                  class="dropdown-item"
                  :class="{ active: a === selectedAuthor }"
                  @click="selectAuthor(a)"
                >
                  <span class="author-avatar small">{{ a[0] }}</span>
                  {{ a }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cover -->
        <div class="settings-section">
          <div class="section-label">Cover</div>
          <div class="cover-preview">
            <div v-if="hasCover" class="cover-art" :style="coverPreviewStyle">
              <div class="cover-overlay"></div>
            </div>
            <div v-else class="cover-empty">
              <span>No cover image</span>
            </div>
            <div class="cover-actions">
              <button v-if="!hasCover" class="nav-button subtle" @click="triggerCoverUpload">Upload cover</button>
              <template v-else>
                <button class="nav-button subtle" @click="replaceCover">Replace</button>
                <button class="link-button" @click="showCropModal = true">Adjust crop</button>
                <button class="link-button danger" @click="removeCover">Remove</button>
              </template>
            </div>
            <input
              ref="fileInput"
              class="sr-only-input"
              type="file"
              accept="image/*"
              @change="onCoverFileSelected"
            />
          </div>
        </div>

        <!-- Translations -->
        <div class="settings-section">
          <div class="section-label">Translations</div>
          <ul class="translation-list">
            <li
              v-for="lang in languages"
              :key="lang.code"
              class="translation-item"
              @click="lang.status === 'needs-review' && (showReviewModal = true)"
              :class="{ clickable: lang.status === 'needs-review' }"
            >
              <div class="tl-info">
                <span class="tl-flag">{{ lang.flag }}</span>
                <span class="tl-name">{{ lang.label }}</span>
              </div>
              <span class="tl-status" :class="langStatusClass(lang.status)">
                {{ lang.role === 'source' ? 'Source' : langStatusLabel(lang.status) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- SEO -->
        <div class="settings-section no-border">
          <div class="section-label">SEO</div>
          <div class="field-group">
            <label>Slug</label>
            <input v-model="seoSlug" />
          </div>
          <div class="field-group">
            <label>
              Meta title
              <span class="char-count" :class="{ warn: seoTitle.length > 60 }">
                {{ seoTitle.length }} / 60
              </span>
            </label>
            <input v-model="seoTitle" />
          </div>
          <div class="field-group">
            <label>
              Meta description
              <span class="char-count" :class="{ warn: seoDescription.length > 160 }">
                {{ seoDescription.length }} / 160
              </span>
            </label>
            <textarea rows="3" v-model="seoDescription"></textarea>
          </div>
        </div>
      </aside>
    </main>

    <!-- ═══════════ MODALS ═══════════ -->

    <!-- Translate Dialog -->
    <TranslateDialog
      :visible="showTranslateModal"
      sourceLanguage="English"
      @close="showTranslateModal = false"
      @complete="onTranslateComplete"
    />

    <!-- Translation Review -->
    <TranslationReview
      :visible="showReviewModal"
      sourceLanguage="English"
      targetLanguage="Vietnamese"
      @close="showReviewModal = false"
      @accept="onReviewAccept"
    />

    <!-- Crop Modal -->
    <div v-if="showCropModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-card crop-card" @click.stop>
        <div class="modal-header">
          <div>
            <div class="eyebrow">Cover Crop</div>
            <h3>Adjust crop</h3>
          </div>
          <button class="close-button" @click="closeModal">✕</button>
        </div>

        <div class="crop-stage">
          <div class="crop-image" aria-label="Crop preview image">
            <div
              class="crop-frame"
              @pointerdown="startCropDrag"
              @pointermove="onCropDrag"
              @pointerup="stopCropDrag"
              @pointerleave="stopCropDrag"
              @wheel.prevent="handleCropWheel"
              :class="{ dragging: isDraggingCrop }"
            >
              <div class="crop-sample" :style="cropPreviewStyle"></div>
            </div>
          </div>
        </div>

        <div class="crop-zoom-row">
          <span>Zoom</span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            :value="coverZoom"
            @input="coverZoom = Number(($event.target as HTMLInputElement).value)"
          />
          <strong>{{ coverZoom.toFixed(1) }}×</strong>
        </div>

        <div class="crop-controls">
          <button class="nav-button subtle" @click="adjustCrop(0, -18, 0)">←</button>
          <button class="nav-button subtle" @click="adjustCrop(0, 18, 0)">→</button>
          <button class="nav-button subtle" @click="adjustCrop(0, 0, -18)">↑</button>
          <button class="nav-button subtle" @click="adjustCrop(0, 0, 18)">↓</button>
          <button class="nav-button subtle" @click="adjustCrop(-0.1)">-</button>
          <button class="nav-button subtle" @click="adjustCrop(0.1)">+</button>
          <button class="nav-button subtle" @click="resetCrop">Reset</button>
          <button class="primary-button" @click="applyCoverCrop">Apply</button>
        </div>
    <!-- AI Toast Notification -->
    <div v-if="aiToastMessage" class="ai-toast" :class="{ loading: aiLoading }">
      <span class="toast-spinner" v-if="aiLoading">⏳</span>
      <span class="toast-icon" v-else>✨</span>
      <span>{{ aiToastMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════ GLOBAL RESETS ═══════════════ */
:global(html) {
  background: #f5f3ef;
}

:global(body) {
  margin: 0;
  min-height: 100vh;
  background: #f5f3ef;
  color: #111827;
  font-family: Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

/* ═══════════════ APP SHELL ═══════════════ */
.editor-app {
  width: 100%;
  min-height: 100vh;
  background: radial-gradient(
      circle at top,
      rgba(255, 255, 255, 0.9),
      rgba(245, 243, 239, 0.95)
    ),
    #f5f3ef;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* ═══════════════ TOP BAR ═══════════════ */
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: min(100%, 1440px);
  max-width: calc(100vw - 32px);
  min-height: 78px;
  margin: 0 auto;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  backdrop-filter: blur(12px);
}

.topbar-left,
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.topbar-left {
  flex: 1 1 auto;
  min-width: 0;
}

.topbar-actions {
  flex: 0 0 auto;
  flex-wrap: nowrap;
}

.topbar-actions .nav-button,
.topbar-actions .primary-button {
  white-space: nowrap;
  flex-shrink: 0;
}

.article-header {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1 1 auto;
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b7280;
}

.article-header h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  white-space: normal;
  overflow-wrap: anywhere;
}

/* ═══════════════ BUTTONS ═══════════════ */
.nav-button,
.primary-button,
.editor-toolbar button,
.lang-pill {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.7);
  color: #111827;
  border-radius: 10px;
  padding: 8px 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button {
  background: #111827;
  color: white;
  border-color: #111827;
  box-shadow: 0 10px 20px rgba(17, 24, 39, 0.12);
}

.nav-button:hover,
.primary-button:hover,
.editor-toolbar button:hover,
.lang-pill:hover,
.close-button:hover,
.ai-item:hover,
.slash-item:hover {
  transform: translateY(-1px);
}

.subtle {
  background: rgba(17, 24, 39, 0.02);
}

/* ═══════════════ STATUS PILL ═══════════════ */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(17, 24, 39, 0.08);
  transition: all 0.3s ease;
}

.save-saved {
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.06);
}

.save-saving {
  color: #2563eb;
  border-color: rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.06);
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.save-unsaved {
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.06);
}

.save-failed {
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.06);
}

/* ═══════════════ LAYOUT ═══════════════ */
.workspace-layout {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr) 260px;
  gap: 18px;
  width: min(100%, 1380px);
  max-width: calc(100vw - 32px);
  margin: 0 auto;
  padding: 22px 18px 32px;
  align-items: start;
}

.outline-panel,
.editor-panel,
.settings-panel {
  min-width: 0;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.03);
}

/* ═══════════════ OUTLINE ═══════════════ */
.outline-panel {
  position: sticky;
  top: 98px;
  height: fit-content;
  padding: 18px 14px;
}

.panel-label,
.section-label {
  padding: 0 8px 12px;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 700;
  color: #6b7280;
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.outline-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #4b5563;
  text-align: left;
  transition: all 0.15s ease;
  font-size: 13px;
}

.outline-item.indented {
  padding-left: 24px;
  font-size: 12px;
}

.outline-item.active {
  background: rgba(17, 24, 39, 0.04);
  color: #111827;
  font-weight: 600;
}

.outline-item:hover:not(.active) {
  background: rgba(17, 24, 39, 0.02);
}

.outline-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.24);
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.outline-item.active .outline-dot {
  background: #4338ca;
}

/* ═══════════════ EDITOR ═══════════════ */
.editor-panel {
  min-height: 860px;
  padding: 26px 26px 30px;
  overflow: hidden;
}

.editor-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.meta-badge:hover {
  background: rgba(17, 24, 39, 0.07);
}

.meta-badge.accent {
  background: rgba(59, 130, 246, 0.08);
  color: #1d4ed8;
}

.meta-badge.accent:hover {
  background: rgba(59, 130, 246, 0.12);
}

.separator {
  color: #9ca3af;
}

/* Dropdown */
.dropdown-wrap {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 40;
  min-width: 160px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(10px);
  padding: 6px;
  animation: dropIn 0.15s ease;
}

.settings-drop {
  min-width: 180px;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #374151;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s ease;
}

.dropdown-item:hover {
  background: rgba(17, 24, 39, 0.04);
}

.dropdown-item.active {
  background: rgba(99, 102, 241, 0.08);
  color: #4338ca;
  font-weight: 600;
}

/* Language Switcher */
.language-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(17, 24, 39, 0.03);
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 999px;
}

.lang-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: transparent;
  border: none;
  color: #4b5563;
  white-space: nowrap;
}

.lang-pill.active {
  background: rgba(255, 255, 255, 0.85);
  color: #111827;
  box-shadow: 0 6px 14px rgba(17, 24, 39, 0.06);
}

.lang-role {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(17, 24, 39, 0.06);
  color: #6b7280;
  font-weight: 700;
}

.lang-role.translation {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}

/* Title / Subtitle */
.title-input,
.subtitle-input,
.field-group input,
.field-group textarea {
  width: 100%;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  color: #111827;
  background: rgba(255, 255, 255, 0.65);
  outline: none;
}

.title-input {
  border: none;
  background: transparent;
  padding: 8px 0 10px;
  font-size: clamp(2.1rem, 3vw, 3.7rem);
  line-height: 1.08;
  letter-spacing: -0.05em;
  font-weight: 700;
}

.subtitle-input {
  min-height: 82px;
  resize: vertical;
  padding: 16px 18px;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #374151;
}

/* Toolbar */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  margin-top: 18px;
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.4);
}

.editor-toolbar button {
  min-width: 40px;
  height: 36px;
  font-weight: 700;
}

.toolbar-slash {
  margin-left: auto;
  font-size: 16px;
  color: #6b7280;
}

.ai-toolbar {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.12);
  color: #4338ca;
}

/* Editor Surface */
.editor-surface-wrap {
  position: relative;
}

.editor-surface {
  margin-top: 28px;
  padding: 16px 16px 40px;
  min-height: 400px;
  border-radius: 14px;
  border: 1px solid transparent;
  outline: none;
  cursor: text;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.editor-surface:focus {
  border-color: rgba(99, 102, 241, 0.18);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.06);
}

.editor-surface:empty::before {
  content: 'Start writing, or type / for commands…';
  color: #9ca3af;
  font-style: italic;
  pointer-events: none;
}

.editor-surface p,
.editor-surface li {
  font-size: 1.04rem;
  line-height: 1.9;
  color: #374151;
}

.lead {
  font-size: 1.18rem !important;
  color: #111827 !important;
  font-weight: 500;
}

.editor-surface h2 {
  margin: 30px 0 14px;
  font-size: clamp(1.5rem, 1.6vw, 2rem);
  line-height: 1.25;
  font-weight: 700;
  color: #111827;
  scroll-margin-top: 110px;
}

.editor-surface h3 {
  margin: 24px 0 10px;
  font-size: clamp(1.2rem, 1.3vw, 1.5rem);
  line-height: 1.3;
  font-weight: 700;
  color: #1f2937;
  scroll-margin-top: 110px;
}

blockquote {
  margin: 24px 0;
  padding: 16px 18px 16px 22px;
  border-left: 3px solid #d1d5db;
  background: rgba(17, 24, 39, 0.02);
  border-radius: 12px;
  color: #374151;
}

/* ═══════════════ CALLOUT BLOCKS ═══════════════ */
.callout-block {
  display: flex;
  gap: 14px;
  margin: 20px 0;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid transparent;
}

.callout-icon {
  font-size: 20px;
  flex-shrink: 0;
  line-height: 1;
}

.callout-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 700;
}

.callout-content p {
  margin: 0;
  font-size: 14px !important;
  line-height: 1.7;
}

.callout-info {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.12);
}

.callout-info strong { color: #1d4ed8; }

.callout-warning {
  background: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.15);
}

.callout-warning strong { color: #b45309; }

.callout-success {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.12);
}

.callout-success strong { color: #15803d; }

/* ═══════════════ DIVIDER ═══════════════ */
.editor-divider {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(17, 24, 39, 0.12), transparent);
  margin: 32px 0;
}

/* ═══════════════ ORDERED LIST ═══════════════ */
.editor-ol {
  padding-left: 20px;
  margin: 16px 0;
}

.editor-ol li {
  padding: 4px 0;
  line-height: 1.8;
}

.editor-ol li::marker {
  color: #6366f1;
  font-weight: 700;
}

/* ═══════════════ CHECKLIST ═══════════════ */
.checklist {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 16px 0;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: background 0.1s ease;
}

.checklist-item:hover {
  background: rgba(255, 255, 255, 0.6);
}

.checklist-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4338ca;
  flex-shrink: 0;
}

.checklist-item span {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.checklist-item:has(input:checked) span {
  text-decoration: line-through;
  color: #9ca3af;
}

/* ═══════════════ CODE / PROMPT / TABLE ═══════════════ */
.prompt-card,
.code-block {
  margin-top: 26px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  overflow: hidden;
}

.card-header,
.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(17, 24, 39, 0.02);
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 700;
}

.prompt-body {
  padding: 18px 16px 14px;
}

.prompt-row {
  margin-bottom: 14px;
}

.prompt-row span {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7280;
}

.prompt-row p {
  margin: 0;
  color: #111827;
  line-height: 1.7;
}

.prompt-meta {
  display: flex;
  gap: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
  color: #374151;
  font-size: 13px;
}

.code-header button {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: #fff;
  padding: 6px 8px;
}

.code-block pre {
  margin: 0;
  padding: 20px 18px;
  background: #111827;
  color: #e5e7eb;
  overflow: auto;
  font-size: 0.94rem;
  line-height: 1.7;
}

.comparison-table {
  margin-top: 26px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.76);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  text-align: left;
}

th {
  background: rgba(17, 24, 39, 0.02);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7280;
}

tbody tr:last-child td {
  border-bottom: none;
}

/* ═══════════════ SETTINGS PANEL ═══════════════ */
.settings-panel {
  position: sticky;
  top: 98px;
  height: fit-content;
  padding: 18px 14px 8px;
}

.settings-section {
  padding: 12px 6px 14px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.no-border {
  border-bottom: none;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.field-group label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
  color: #6b7280;
}

.char-count {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: #9ca3af;
  font-weight: 500;
}

.char-count.warn {
  color: #dc2626;
}

.pill-select {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 110px;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(17, 24, 39, 0.04);
  border: 1px solid rgba(17, 24, 39, 0.05);
  color: #111827;
  font-weight: 600;
}

.pill-select.clickable {
  cursor: pointer;
  transition: background 0.15s ease;
}

.pill-select.clickable:hover {
  background: rgba(17, 24, 39, 0.07);
}

.action-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

/* Author */
.author-select {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  color: #111827;
  font-weight: 500;
  transition: border-color 0.15s ease;
}

.author-select:hover {
  border-color: rgba(17, 24, 39, 0.16);
}

.author-avatar {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.author-avatar.small {
  width: 24px;
  height: 24px;
  font-size: 11px;
  border-radius: 7px;
}

.author-chevron {
  margin-left: auto;
  color: #9ca3af;
}

/* Cover */
.cover-preview {
  margin-top: 10px;
}

.cover-art {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.3));
}

.cover-empty {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  border: 2px dashed rgba(17, 24, 39, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
  background: rgba(17, 24, 39, 0.02);
}

.cover-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.link-button {
  border: none;
  background: transparent;
  padding: 0;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.link-button.danger {
  color: #dc2626;
}

.sr-only-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Translations */
.translation-list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.translation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.35);
  transition: all 0.15s ease;
}

.translation-item.clickable {
  cursor: pointer;
}

.translation-item.clickable:hover {
  background: rgba(59, 130, 246, 0.04);
  border-color: rgba(59, 130, 246, 0.12);
}

.tl-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tl-flag {
  font-size: 16px;
}

.tl-name {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.tl-status {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.ls-published { background: rgba(34, 197, 94, 0.08); color: #15803d; }
.ls-needs-review { background: rgba(245, 158, 11, 0.08); color: #b45309; }
.ls-reviewed { background: rgba(59, 130, 246, 0.08); color: #1d4ed8; }
.ls-not-translated { background: rgba(17, 24, 39, 0.04); color: #9ca3af; }
.ls-translating { background: rgba(99, 102, 241, 0.08); color: #4338ca; }
.ls-outdated { background: rgba(239, 68, 68, 0.08); color: #dc2626; }

/* SEO */
.field-group input,
.field-group textarea {
  padding: 10px 12px;
}

/* ═══════════════ SLASH / AI MENUS ═══════════════ */
.slash-menu,
.ai-menu,
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.slash-menu,
.ai-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 24, 39, 0.1);
}

.slash-panel,
.ai-panel,
.modal-card {
  width: min(520px, calc(100vw - 28px));
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 26px 80px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(14px);
}

.slash-panel {
  padding: 18px 14px 12px;
  max-height: 70vh;
  overflow-y: auto;
}

.slash-header {
  padding: 0 6px 12px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 700;
}

.slash-group {
  margin-top: 14px;
}

.slash-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 6px 8px;
}

.slash-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  color: #111827;
}

.slash-item:hover {
  background: rgba(17, 24, 39, 0.02);
  border-color: rgba(17, 24, 39, 0.04);
}

.slash-icon {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.08);
  color: #4338ca;
  font-weight: 700;
  font-size: 12px;
}

.slash-copy {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.slash-copy strong {
  font-size: 14px;
}

.slash-copy small {
  color: #6b7280;
  font-size: 11px;
}

.ai-panel {
  padding: 18px 14px 12px;
}

.ai-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ai-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 10px;
  background: rgba(17, 24, 39, 0.02);
  color: #111827;
  text-align: center;
}

/* ═══════════════ CROP MODAL ═══════════════ */
.modal-backdrop {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.38);
}

.modal-card {
  padding: 18px 18px 16px;
}

.crop-card {
  width: min(700px, calc(100vw - 28px));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
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
}

.crop-stage {
  margin: 8px 0 18px;
}

.crop-image {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 330px;
  border-radius: 18px;
  background: #f5f3ef;
  border: 1px solid rgba(17, 24, 39, 0.08);
  overflow: hidden;
}

.crop-frame {
  position: relative;
  width: min(100%, 520px);
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(17, 24, 39, 0.12);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.76), rgba(59, 130, 246, 0.4)),
    url('https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80')
      center/cover no-repeat;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.crop-frame.dragging {
  cursor: grabbing;
}

.crop-sample {
  position: absolute;
  inset: 0;
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
  transition: transform 0.15s ease-out;
}

.crop-zoom-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 14px;
  padding: 8px 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  background: rgba(17, 24, 39, 0.02);
}

.crop-zoom-row span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7280;
}

.crop-zoom-row input {
  flex: 1;
  accent-color: #111827;
}

.crop-zoom-row strong {
  width: 44px;
  text-align: right;
  font-size: 12px;
  color: #111827;
}

.crop-controls {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

/* ═══════════════ RESPONSIVE ═══════════════ */
@media (min-width: 1281px) {
  .topbar,
  .workspace-layout {
    width: min(100%, 1440px);
  }
}

@media (max-width: 1279px) and (min-width: 1025px) {
  .workspace-layout {
    grid-template-columns: 180px minmax(0, 1fr) 240px;
  }
}

@media (max-width: 1024px) {
  .workspace-layout {
    grid-template-columns: 170px minmax(0, 1fr);
  }

  .settings-panel {
    position: static;
    grid-column: 1 / -1;
  }
}

@media (max-width: 860px) {
  .topbar {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .workspace-layout {
    grid-template-columns: 1fr;
  }

  .outline-panel {
    position: static;
  }

  .topbar-status {
    order: 3;
    justify-content: flex-start;
    width: 100%;
  }

  .topbar-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .editor-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .language-switcher {
    flex-wrap: wrap;
  }

  .ai-list {
    grid-template-columns: 1fr;
  }
}

/* AI Toast Notification */
.ai-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(17, 24, 39, 0.92);
  color: #f9fafb;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(12px);
  font-size: 14px;
  font-weight: 500;
  animation: slideInRight 0.25s ease;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.toast-spinner {
  display: inline-block;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
