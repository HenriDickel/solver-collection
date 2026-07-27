<template>
  <main class="page-shell play-page">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Multiplayer &middot; one shared device</p>
      <h1 id="page-title">{{ game.title }}</h1>
      <p class="intro">{{ game.description }}</p>
    </section>

    <PartyGame :game="game" />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PartyGame from '../components/PartyGame.vue'
import { getMultiplayerGameBySlug } from '../data/games'
import type { MultiplayerGameSlug } from '../../shared/types/play-game'

const props = defineProps<{ slug: MultiplayerGameSlug }>()
const game = computed(() => getMultiplayerGameBySlug(props.slug))
</script>
