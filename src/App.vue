<script setup lang="ts">
import { computed, ref } from 'vue';

const outlineItems = [
    'Introduction',
    'What is RAG?',
    'Architecture',
    'Retrieval',
    'Reranking',
    'Evaluation',
    'Best Practices',
    'Conclusion',
];

const languages = [
    { label: 'English', code: '🇬🇧', active: true },
    { label: 'Vietnamese', code: '🇻🇳', active: false },
    { label: 'Korean', code: '🇰🇷', active: false },
];

const tagList = ['RAG', 'LLM', 'AI Engineering'];
const topActions = ['Preview', 'Translate', 'Save Draft', 'Publish'];
const translationList = [
    { locale: 'English', status: 'Source' },
    { locale: 'Vietnamese', status: 'Needs Review' },
    { locale: 'Korean', status: 'Reviewed' },
];

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

const slashCommands = [
    { title: 'Paragraph', shortcut: '/', group: 'Basic Blocks', icon: '¶' },
    { title: 'Heading 1', shortcut: '⌘+1', group: 'Basic Blocks', icon: 'H1' },
    { title: 'Heading 2', shortcut: '⌘+2', group: 'Basic Blocks', icon: 'H2' },
    { title: 'Bullet List', shortcut: '-', group: 'Basic Blocks', icon: '•' },
    {
        title: 'Code Block',
        shortcut: '```',
        group: 'AI / Technical',
        icon: '</>',
    },
    {
        title: 'Prompt',
        shortcut: '/prompt',
        group: 'AI / Technical',
        icon: '✦',
    },
    { title: 'Image', shortcut: '/image', group: 'Media', icon: '◌' },
    { title: 'Video', shortcut: '/video', group: 'Media', icon: '▶' },
    { title: 'Math', shortcut: '/math', group: 'AI / Technical', icon: '∑' },
];

const showAiMenu = ref(false);
const showSlashMenu = ref(false);
const showTranslateModal = ref(false);
const showCropModal = ref(false);
const coverImage = ref(
    'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80'
);
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

function toggleAiMenu() {
    showAiMenu.value = !showAiMenu.value;
}

function toggleSlashMenu() {
    showSlashMenu.value = !showSlashMenu.value;
}

function openTranslate() {
    showTranslateModal.value = true;
}

function openCropModal() {
    showCropModal.value = true;
}

function triggerCoverUpload() {
    fileInput.value?.click();
}

function onCoverFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
        return;
    }

    const url = URL.createObjectURL(file);
    coverImage.value = url;
    coverZoom.value = 1;
    coverOffsetX.value = 0;
    coverOffsetY.value = 0;
    showCropModal.value = true;
    input.value = '';
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
    if (!isDraggingCrop.value) {
        return;
    }

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

function closeModal() {
    showTranslateModal.value = false;
    showCropModal.value = false;
    showAiMenu.value = false;
    showSlashMenu.value = false;
}
</script>

<template>
    <div class="editor-app">
        <header class="topbar">
            <div class="topbar-left">
                <button class="nav-button subtle">← Posts</button>
                <div class="article-header">
                    <span class="eyebrow">New Article</span>
                    <h1>How to Build a Production RAG System</h1>
                </div>
            </div>

            <div class="topbar-status">
                <span class="status-pill">Saved ✓</span>
            </div>

            <div class="topbar-actions">
                <button
                    v-for="action in topActions"
                    :key="action"
                    class="nav-button"
                    @click="action === 'Translate' && openTranslate()"
                >
                    {{ action }}
                </button>
                <button class="primary-button">Publish</button>
            </div>
        </header>

        <main class="workspace-layout">
            <aside class="outline-panel">
                <div class="panel-label">Outline</div>
                <nav class="outline-list">
                    <button
                        v-for="(item, index) in outlineItems"
                        :key="item"
                        class="outline-item"
                        :class="{ active: index === 0 }"
                    >
                        <span class="outline-dot"></span>
                        <span>{{ item }}</span>
                    </button>
                </nav>
            </aside>

            <section class="editor-panel">
                <div class="editor-meta">
                    <div class="meta-row">
                        <span class="meta-badge">Best Practices</span>
                        <span class="separator">·</span>
                        <span class="meta-badge accent">Tutorial</span>
                    </div>

                    <div class="language-switcher">
                        <button
                            v-for="language in languages"
                            :key="language.label"
                            class="lang-pill"
                            :class="{ active: language.active }"
                        >
                            {{ language.code }} {{ language.label }}
                        </button>
                    </div>
                </div>

                <input
                    class="title-input"
                    value="How to Build a Production RAG System"
                    aria-label="Article title"
                />

                <textarea class="subtitle-input" aria-label="Subtitle">
A practical guide to designing, evaluating, and maintaining reliable RAG systems.</textarea
                >

                <div class="editor-toolbar">
                    <button>B</button>
                    <button>I</button>
                    <button>U</button>
                    <button>Link</button>
                    <button>Code</button>
                    <button>Comment</button>
                    <button class="ai-toolbar" @click="toggleAiMenu">
                        ✨ AI
                    </button>
                </div>

                <div class="editor-surface-wrap">
                    <article class="editor-surface">
                        <p class="lead">
                            Retrieval-augmented generation is not just a
                            pattern; it is a delivery system for trustworthy AI
                            products.
                        </p>

                        <h2>Introduction</h2>
                        <p>
                            Most teams start with a simple prompt and a vector
                            database. That gets them an impressive demo, but
                            production systems need much more: retrieval
                            quality, latency control, observability, and a
                            repeatable evaluation loop.
                        </p>

                        <blockquote>
                            “The hardest part of RAG is not retrieval itself —
                            it is making the full system reliable under
                            real-world traffic.”
                        </blockquote>

                        <h2>What is RAG?</h2>
                        <p>
                            In practice, a production RAG system combines a
                            retriever, a generator, and a disciplined evaluation
                            framework. The model is not the system; the system
                            is the product.
                        </p>

                        <div class="prompt-card">
                            <div class="card-header">Prompt</div>
                            <div class="prompt-body">
                                <div class="prompt-row">
                                    <span>System</span>
                                    <p>
                                        You are an expert AI assistant helping a
                                        team evaluate RAG quality.
                                    </p>
                                </div>
                                <div class="prompt-row">
                                    <span>User</span>
                                    <p>
                                        Analyze the current document and suggest
                                        improvements for reliability and
                                        clarity.
                                    </p>
                                </div>
                                <div class="prompt-meta">
                                    <span>Model: GPT-5</span>
                                    <span>Temperature: 0.7</span>
                                </div>
                            </div>
                        </div>

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

                        <h2>Architecture</h2>
                        <ul>
                            <li>
                                Define retrieval sources and ingestion quality
                                gates.
                            </li>
                            <li>
                                Monitor latency and chunk relevance in
                                production.
                            </li>
                            <li>
                                Score responses with grounded truth and
                                rubric-based evaluation.
                            </li>
                        </ul>
                    </article>

                    <div
                        v-if="showSlashMenu"
                        class="slash-menu"
                        @click="closeModal"
                    >
                        <div class="slash-panel" @click.stop>
                            <div class="slash-header">Slash commands</div>
                            <div
                                class="slash-group"
                                v-for="group in [
                                    'Basic Blocks',
                                    'Media',
                                    'AI / Technical',
                                ]"
                                :key="group"
                            >
                                <div class="slash-label">{{ group }}</div>
                                <button
                                    v-for="item in slashCommands.filter(
                                        (cmd) => cmd.group === group
                                    )"
                                    :key="item.title"
                                    class="slash-item"
                                >
                                    <span class="slash-icon">{{
                                        item.icon
                                    }}</span>
                                    <span class="slash-copy">
                                        <strong>{{ item.title }}</strong>
                                        <small>{{ item.shortcut }}</small>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="showAiMenu" class="ai-menu" @click="closeModal">
                        <div class="ai-panel" @click.stop>
                            <div class="slash-header">AI Assistant</div>
                            <div class="ai-list">
                                <button
                                    v-for="action in aiActions"
                                    :key="action"
                                    class="ai-item"
                                >
                                    {{ action }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <aside class="settings-panel">
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

                <div class="settings-section">
                    <div class="section-label">Content</div>
                    <div class="field-group">
                        <label>Category</label>
                        <div class="chip-row">
                            <span class="chip selected">Best Practices</span>
                            <span class="chip">Tutorial</span>
                        </div>
                    </div>
                    <div class="field-group">
                        <label>Tags</label>
                        <div class="chip-row">
                            <span
                                v-for="tag in tagList"
                                :key="tag"
                                class="chip"
                                >{{ tag }}</span
                            >
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <div class="section-label">Cover</div>
                    <div class="cover-preview">
                        <div class="cover-art" :style="coverPreviewStyle">
                            <div class="cover-overlay"></div>
                        </div>
                        <div class="cover-actions">
                            <button class="nav-button subtle" @click="triggerCoverUpload">
                                Upload cover
                            </button>
                            <button class="link-button" @click="openCropModal">
                                Adjust crop
                            </button>
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

                <div class="settings-section">
                    <div class="section-label">Translations</div>
                    <ul class="translation-list">
                        <li v-for="item in translationList" :key="item.locale">
                            <span>{{ item.locale }}</span>
                            <strong>{{ item.status }}</strong>
                        </li>
                    </ul>
                </div>

                <div class="settings-section no-border">
                    <div class="section-label">SEO</div>
                    <div class="field-group">
                        <label>Slug</label>
                        <input value="production-rag-system" />
                    </div>
                    <div class="field-group">
                        <label>Meta title</label>
                        <input value="How to Build a Production RAG System" />
                    </div>
                    <div class="field-group">
                        <label>Meta description</label>
                        <textarea rows="3">
Learn how to design reliable production-ready RAG systems.</textarea
                        >
                    </div>
                </div>
            </aside>
        </main>

        <div
            v-if="showTranslateModal"
            class="modal-backdrop"
            @click="closeModal"
        >
            <div class="modal-card translate-card" @click.stop>
                <div class="modal-header">
                    <div>
                        <div class="eyebrow">Translate Article</div>
                        <h3>From: English</h3>
                    </div>
                    <button class="close-button" @click="closeModal">✕</button>
                </div>

                <div class="translate-body">
                    <div class="target-row">
                        <span>To</span>
                        <label
                            ><input type="checkbox" checked /> Vietnamese</label
                        >
                        <label><input type="checkbox" checked /> Korean</label>
                    </div>

                    <div class="progress-list">
                        <div class="progress-item">
                            <span>Vietnamese</span>
                            <strong>Translating…</strong>
                        </div>
                        <div class="progress-item waiting">
                            <span>Korean</span>
                            <strong>Waiting…</strong>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="nav-button subtle" @click="closeModal">
                            Cancel
                        </button>
                        <button class="primary-button">Translate All</button>
                    </div>
                </div>
            </div>
        </div>

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
            </div>
        </div>
    </div>
</template>

<style scoped>
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
}

.workspace-layout {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr) 240px;
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
}

.outline-panel,
.editor-panel,
.settings-panel {
    background: rgba(255, 255, 255, 0.42);
    border: 1px solid rgba(17, 24, 39, 0.06);
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.03);
}

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
    gap: 6px;
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
}

.outline-item.active {
    background: rgba(17, 24, 39, 0.04);
    color: #111827;
    font-weight: 600;
}

.outline-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(17, 24, 39, 0.24);
}

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
}

.meta-badge.accent {
    background: rgba(59, 130, 246, 0.08);
    color: #1d4ed8;
}

.separator {
    color: #9ca3af;
}

.language-switcher {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px;
    background: rgba(17, 24, 39, 0.03);
    border: 1px solid rgba(17, 24, 39, 0.06);
    border-radius: 999px;
}

.lang-pill {
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    background: transparent;
    border: none;
    color: #4b5563;
}

.lang-pill.active {
    background: rgba(255, 255, 255, 0.85);
    color: #111827;
    box-shadow: 0 6px 14px rgba(17, 24, 39, 0.06);
}

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

.ai-toolbar {
    margin-left: auto;
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.12);
    color: #4338ca;
}

.editor-surface-wrap {
    position: relative;
}

.editor-surface {
    margin-top: 28px;
    padding: 8px 8px 0;
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
}

blockquote {
    margin: 24px 0;
    padding: 16px 18px 16px 22px;
    border-left: 3px solid #d1d5db;
    background: rgba(17, 24, 39, 0.02);
    border-radius: 12px;
    color: #374151;
}

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
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    color: #6b7280;
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

.action-row {
    display: flex;
    gap: 10px;
    margin-top: 14px;
}

.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.chip {
    display: inline-flex;
    align-items: center;
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(17, 24, 39, 0.04);
    border: 1px solid rgba(17, 24, 39, 0.05);
    font-size: 12px;
    color: #374151;
}

.chip.selected {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.14);
    color: #4338ca;
}

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
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.06),
        rgba(0, 0, 0, 0.3)
    );
}

.cover-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 10px;
}

.link-button {
    border: none;
    background: transparent;
    padding: 0;
    color: #2563eb;
    font-weight: 600;
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

.translation-list {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.translation-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 12px;
    border: 1px solid rgba(17, 24, 39, 0.06);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.35);
    color: #374151;
}

.translation-list strong {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6b7280;
}

.field-group input,
.field-group textarea {
    padding: 10px 12px;
}

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

.modal-backdrop {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.38);
}

.modal-card {
    padding: 18px 18px 16px;
}

.translate-card {
    width: min(520px, calc(100vw - 28px));
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

.translate-body {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.target-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 12px 14px;
    border: 1px solid rgba(17, 24, 39, 0.08);
    border-radius: 12px;
    background: rgba(17, 24, 39, 0.02);
}

.target-row span {
    font-weight: 650;
}

.target-row label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #374151;
}

.progress-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.progress-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid rgba(59, 130, 246, 0.18);
    background: rgba(59, 130, 246, 0.04);
}

.progress-item.waiting {
    border-color: rgba(17, 24, 39, 0.08);
    background: rgba(17, 24, 39, 0.02);
}

.progress-item strong {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #374151;
}

.modal-actions,
.crop-controls {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
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
    background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.76),
            rgba(59, 130, 246, 0.4)
        ),
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

@media (min-width: 1281px) {
    .topbar,
    .workspace-layout {
        width: min(100%, 1440px);
    }
}

@media (max-width: 1279px) and (min-width: 1025px) {
    .workspace-layout {
        grid-template-columns: 180px minmax(0, 1fr) 220px;
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
</style>
