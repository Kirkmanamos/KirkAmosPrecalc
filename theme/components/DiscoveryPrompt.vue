<script setup lang="ts">
/**
 * DiscoveryPrompt — BTC-style "What do you notice?" card.
 *
 * Presents a question with an expandable hint/answer section.
 * Designed for thinking-classroom pedagogy: the question comes first,
 * the answer is hidden until the student actively reveals it.
 */
import { ref } from 'vue'

defineProps<{
  question: string
  hint?: string
}>()

const showHint = ref(false)
</script>

<template>
  <div class="discovery-card">
    <div class="question-row">
      <span class="icon">💡</span>
      <p class="question">{{ question }}</p>
    </div>

    <div v-if="hint" class="hint-section">
      <button
        class="hint-toggle"
        @click="showHint = !showHint"
      >
        {{ showHint ? 'Hide hint' : 'Show hint' }}
        <span class="chevron" :class="{ open: showHint }">›</span>
      </button>

      <Transition name="reveal">
        <div v-if="showHint" class="hint-content">
          <p class="hint">{{ hint }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.discovery-card {
  background: var(--bg-surface, #161b22);
  border: 1px solid var(--border-subtle, rgba(139, 148, 158, 0.12));
  border-left: 3px solid var(--accent, #58a6ff);
  border-radius: var(--radius-md, 10px);
  padding: 16px 20px;
}

.question-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.question {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #e6edf3);
  line-height: 1.5;
}

.hint-section {
  margin-top: 10px;
  padding-left: 28px;
}

.hint-toggle {
  background: none;
  border: none;
  color: var(--text-secondary, #8b949e);
  font-family: var(--font-sans, sans-serif);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  transition: color 150ms ease;
}

.hint-toggle:hover {
  color: var(--accent, #58a6ff);
}

.chevron {
  display: inline-block;
  transition: transform 200ms ease;
  font-size: 14px;
}

.chevron.open {
  transform: rotate(90deg);
}

.hint-content {
  overflow: hidden;
}

.hint {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: var(--text-secondary, #8b949e);
  line-height: 1.6;
  border-top: 1px solid var(--border-subtle, rgba(139, 148, 158, 0.12));
  padding-top: 8px;
}

/* Reveal transition */
.reveal-enter-active,
.reveal-leave-active {
  transition: all 200ms ease;
}

.reveal-enter-from,
.reveal-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
