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

      <slot></slot>

      <div class="solver-controls" :aria-busy="isAutoSolving">
        <button
          class="clear-button"
          type="button"
          title="Load a random example"
          @click="emit('random')"
        >
          Random example
        </button>
        <template v-if="canAdvance">
          <button class="solver-button" type="button" :disabled="isAutoSolving" @click="emit('advance')">
            {{ advanceLabel }}
          </button>
          <button class="auto-button" type="button" :disabled="isAutoSolving" @click="emit('autoSolve')">
            {{ isAutoSolving ? 'Auto solving…' : 'Auto solve' }}
          </button>
        </template>
        <span v-else class="solver-status" :class="`solver-status--${mode}`">
          {{ mode === 'solved' ? 'Solved' : stuckLabel }}
        </span>
      </div>
    </article>

    <SolverTerminal :logs="logs" :mode="mode" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SolverLog, SolverMode } from '../types/solver'
import SolverTerminal from './SolverTerminal.vue'

const props = defineProps<{
  isAutoSolving: boolean
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

const canAdvance = computed(() => props.mode === 'ready' || props.mode === 'solving')
const advanceLabel = computed(() => (props.mode === 'ready' ? 'Start solving' : 'Solve next step'))
const boardTitleId = computed(() => `${props.title.toLowerCase().replaceAll(' ', '-')}-board-title`)
</script>
