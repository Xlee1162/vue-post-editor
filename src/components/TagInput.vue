<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string[];
  suggestions?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const newTag = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const showSuggestions = ref(false);

const defaultSuggestions = [
  'RAG', 'LLM', 'AI Engineering', 'Prompt Engineering',
  'Agents', 'Fine-tuning', 'Embeddings', 'Vector DB',
  'NLP', 'Computer Vision', 'MLOps', 'Transformers',
];

const availableSuggestions = () => {
  const suggestions = props.suggestions || defaultSuggestions;
  const query = newTag.value.toLowerCase().trim();

  return suggestions
    .filter((s) => !props.modelValue.includes(s))
    .filter((s) => !query || s.toLowerCase().includes(query));
};

function addTag(tag: string) {
  const trimmed = tag.trim();
  if (!trimmed || props.modelValue.includes(trimmed)) return;

  emit('update:modelValue', [...props.modelValue, trimmed]);
  newTag.value = '';
  showSuggestions.value = false;
}

function removeTag(tag: string) {
  emit('update:modelValue', props.modelValue.filter((t) => t !== tag));
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && newTag.value.trim()) {
    event.preventDefault();
    addTag(newTag.value);
  } else if (event.key === 'Backspace' && !newTag.value && props.modelValue.length) {
    removeTag(props.modelValue[props.modelValue.length - 1]);
  } else if (event.key === 'Escape') {
    showSuggestions.value = false;
  }
}

function handleFocus() {
  showSuggestions.value = true;
}

function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}
</script>

<template>
  <div class="tag-input-wrap">
    <div class="tag-list">
      <span
        v-for="tag in modelValue"
        :key="tag"
        class="tag-chip"
      >
        {{ tag }}
        <button class="tag-remove" @click="removeTag(tag)" aria-label="Remove tag">×</button>
      </span>
      <input
        ref="inputRef"
        v-model="newTag"
        class="tag-field"
        placeholder="Add tag…"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <div
      v-if="showSuggestions && availableSuggestions().length > 0"
      class="suggestions-dropdown"
    >
      <button
        v-for="s in availableSuggestions().slice(0, 8)"
        :key="s"
        class="suggestion-item"
        @mousedown.prevent="addTag(s)"
      >
        {{ s }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tag-input-wrap {
  position: relative;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.65);
  min-height: 42px;
  align-items: center;
  cursor: text;
  transition: border-color 0.15s ease;
}

.tag-list:focus-within {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.06);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #4338ca;
  font-size: 12px;
  font-weight: 500;
  animation: chipIn 0.2s ease;
}

@keyframes chipIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: #6366f1;
  font-size: 14px;
  cursor: pointer;
  border-radius: 999px;
  padding: 0;
  transition: background 0.1s ease;
}

.tag-remove:hover {
  background: rgba(99, 102, 241, 0.12);
  color: #4338ca;
}

.tag-field {
  border: none;
  outline: none;
  background: transparent;
  min-width: 80px;
  flex: 1;
  padding: 2px 4px;
  font-size: 13px;
  color: #111827;
  font-family: inherit;
}

.tag-field::placeholder {
  color: #9ca3af;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(10px);
  padding: 6px;
  max-height: 200px;
  overflow-y: auto;
  animation: dropIn 0.15s ease;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.suggestion-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s ease;
  font-family: inherit;
}

.suggestion-item:hover {
  background: rgba(17, 24, 39, 0.04);
  color: #111827;
}
</style>
