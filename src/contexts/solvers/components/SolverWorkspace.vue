<template>
  <section class="solver-layout" :aria-label="`${title} solver`">
    <article
      class="board-card"
      :class="{
        'board-card--ready': mode === 'ready',
        'board-card--solving': mode !== 'ready',
      }"
      :aria-labelledby="boardTitleId"
    >
      <div class="board-header">
        <h2 :id="boardTitleId">{{ title }}</h2>
        <span class="progress-pill">{{ progress }}</span>
      </div>

      <slot v-if="hasExample"></slot>
      <div v-else class="solver-empty-state" role="status">
        <span class="solver-empty-state__spinner" aria-hidden="true"></span>
        <p>{{ isExampleLoading ? 'Preparing a fresh example…' : 'A fresh example will be ready shortly.' }}</p>
      </div>

      <div class="solver-controls" :aria-busy="isAutoSolving || isExampleLoading">
        <button
          class="clear-button"
          type="button"
          :disabled="isExampleLoading"
          :title="isExampleLoading ? 'Preparing a new example' : 'Load a random example'"
          @click="emit('random')"
        >
          {{ isExampleLoading ? 'Preparing example…' : 'Random example' }}
        </button>
        <template v-if="canAdvance">
          <button class="solver-button" type="button" :disabled="isAutoSolving" @click="emit('advance')">
            {{ advanceLabel }}
          </button>
          <button class="auto-button" type="button" :disabled="isAutoSolving" @click="emit('autoSolve')">
            {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
          </button>
        </template>
        <span v-else-if="hasExample && !isExampleLoading" class="solver-status" :class="`solver-status--${mode}`">
          {{ mode === 'solved' ? 'Solved' : stuckLabel }}
        </span>
      </div>
    </article>

    <SolverTerminal :logs="logs" :mode="mode" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { SolverLog, SolverMode } from '../types/solver'
import SolverTerminal from './SolverTerminal.vue'

const props = defineProps<{
  hasExample: boolean
  isAutoSolving: boolean
  isExampleLoading: boolean
  logs: SolverLog[]
  mode: SolverMode
  progress: string
  stuckLabel: string
  title: string
}>()

const emit = defineEmits<{
  advance: []
  autoSolve: []
  random: []
}>()

const canAdvance = computed(() => (
  props.hasExample
  && !props.isExampleLoading
  && (props.mode === 'ready' || props.mode === 'solving')
))
const advanceLabel = computed(() => (props.mode === 'ready' ? 'Start solving' : 'Solve next step'))
const boardTitleId = computed(() => `${props.title.toLowerCase().replaceAll(' ', '-')}-board-title`)

onMounted(() => {
  if (!props.hasExample) emit('random')
})
</script>
