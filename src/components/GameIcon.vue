<template>
  <component :is="icon" :size="props.size" :stroke-width="props.strokeWidth" aria-hidden="true" />
</template>

<script setup lang="ts">
import {
  ArrowLeftRight,
  Blocks,
  Bomb,
  Calculator,
  Castle,
  CircleQuestionMark,
  Drama,
  Grid3x3,
  HeartHandshake,
  Image,
  MessageCircle,
  Puzzle,
  Route,
  Scale,
  UserRoundX,
} from '@lucide/vue'
import { computed, type Component } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  slug: string
  strokeWidth?: number
}>(), {
  size: 24,
  strokeWidth: 2.25,
})

const iconsBySlug: Record<string, Component> = {
  chess: Castle,
  charades: Drama,
  futoshiki: Scale,
  imposter: UserRoundX,
  'kiss-marry-kill': HeartHandshake,
  kenken: Calculator,
  maze: Route,
  minesweeper: Bomb,
  'never-have-i-ever': MessageCircle,
  nonogram: Image,
  nurikabe: Blocks,
  sudoku: Grid3x3,
  'who-am-i': CircleQuestionMark,
  'would-you-rather': ArrowLeftRight,
}

const icon = computed<Component>(() => iconsBySlug[props.slug] ?? Puzzle)
</script>
