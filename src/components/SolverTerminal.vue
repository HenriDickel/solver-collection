<template>
  <aside class="terminal" aria-labelledby="terminal-title">
    <div class="terminal-header">
      <h2 id="terminal-title">Terminal</h2>
      <span class="terminal-indicator" :class="`terminal-indicator--${mode}`"></span>
    </div>

    <ol v-if="logs.length > 0" ref="terminalLog" class="terminal-log" aria-live="polite">
      <li
        v-for="log in logs"
        :key="log.id"
        class="terminal-log-entry"
        :class="`terminal-log-entry--${log.level}`"
      >
        <span aria-hidden="true">&rsaquo;</span>
        <span>{{ log.message }}</span>
      </li>
    </ol>
    <p v-else class="terminal-empty">Ready. Start the solver to follow the analysis.</p>
  </aside>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { SolverLog, SolverMode } from '../types/solver'

const { logs, mode } = defineProps<{
  logs: SolverLog[]
  mode: SolverMode
}>()

const terminalLog = ref<HTMLOListElement | null>(null)

watch(
  () => logs,
  async () => {
    await nextTick()

    if (terminalLog.value) {
      terminalLog.value.scrollTop = terminalLog.value.scrollHeight
    }
  },
  { deep: true, flush: 'post' },
)
</script>
