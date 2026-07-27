<template>
  <section class="party-layout" aria-labelledby="party-game-title">
    <article class="party-card">
      <div class="play-card-header">
        <div>
          <p class="eyebrow">Local party game</p>
          <h2 id="party-game-title">{{ game.title }}</h2>
        </div>
        <span class="play-progress">{{ game.players }}</span>
      </div>

      <template v-if="phase === 'setup'">
        <p class="party-intro">{{ game.description }}</p>
        <div class="party-rules">
          <span>How it works</span>
          <p>{{ rules }}</p>
        </div>

        <div class="party-player-setup">
          <div class="party-player-setup__heading">
            <h3>Who is playing?</h3>
            <button type="button" :disabled="players.length >= 12" @click="addPlayer">Add player</button>
          </div>
          <label v-for="(_, playerIndex) in players" :key="playerIndex" class="party-player-input">
            <span>Player {{ playerIndex + 1 }}</span>
            <input v-model="players[playerIndex]" :aria-label="`Name of player ${playerIndex + 1}`" maxlength="18" />
            <button v-if="players.length > minimumPlayers" type="button" :aria-label="`Remove player ${playerIndex + 1}`" @click="removePlayer(playerIndex)">×</button>
          </label>
        </div>

        <p v-if="setupError" class="party-error">{{ setupError }}</p>
        <button class="party-primary-button" type="button" @click="startGame">Start game</button>
      </template>

      <template v-else-if="game.slug === 'imposter'">
        <div v-if="phase === 'discussion'" class="party-discussion">
          <span class="party-round-label">Reveal complete</span>
          <h3>Discuss the secret word</h3>
          <p>Ask each other careful questions, then decide who had no word.</p>
          <button class="party-primary-button" type="button" @click="startGame">New Imposter round</button>
        </div>
        <div v-else class="party-secret-card">
          <span class="party-round-label">Pass to {{ currentPlayer }}</span>
          <h3 v-if="!isSecretVisible">Make sure nobody else can see the screen.</h3>
          <template v-else-if="currentPlayerIndex === imposterIndex">
            <p class="party-secret-card__role">You are the</p>
            <strong>Imposter</strong>
            <p>You do not get the secret word. Listen closely and blend in.</p>
          </template>
          <template v-else>
            <p class="party-secret-card__role">Secret word · {{ imposterRound.category }}</p>
            <strong>{{ imposterRound.word }}</strong>
            <p>Give a subtle clue during the discussion. Do not say the word.</p>
          </template>
          <button class="party-primary-button" type="button" @click="advanceSecretReveal">
            {{ isSecretVisible ? nextSecretButtonLabel : 'Reveal my role' }}
          </button>
        </div>
      </template>

      <template v-else-if="game.slug === 'who-am-i'">
        <div v-if="phase === 'discussion'" class="party-discussion">
          <span class="party-round-label">All identities assigned</span>
          <h3>Start asking yes-or-no questions</h3>
          <p>Everyone knows the other identities. Keep asking until you discover yours.</p>
          <button class="party-primary-button" type="button" @click="startGame">Assign new identities</button>
        </div>
        <div v-else class="party-secret-card">
          <span class="party-round-label">Pass to {{ currentPlayer }}</span>
          <h3 v-if="!isSecretVisible">Keep your identity private.</h3>
          <template v-else>
            <p class="party-secret-card__role">Your hidden identity</p>
            <strong>{{ assignedIdentities[currentPlayerIndex] }}</strong>
            <p>Hide it again before handing the device to the next player.</p>
          </template>
          <button class="party-primary-button" type="button" @click="advanceSecretReveal">
            {{ isSecretVisible ? nextSecretButtonLabel : 'Reveal my identity' }}
          </button>
        </div>
      </template>

      <template v-else-if="game.slug === 'would-you-rather'">
        <div v-if="phase === 'results'" class="party-results">
          <span class="party-round-label">Group result</span>
          <h3>{{ ratherRound.question }}</h3>
          <div class="party-result-bars">
            <div><span>{{ ratherRound.left }}</span><strong>{{ leftVotes }} votes</strong></div>
            <div><span>{{ ratherRound.right }}</span><strong>{{ rightVotes }} votes</strong></div>
          </div>
          <button class="party-primary-button" type="button" @click="nextRatherRound">Next question</button>
        </div>
        <div v-else class="party-choice-card">
          <span class="party-round-label">Pass to {{ currentPlayer }}</span>
          <h3>Would you rather…</h3>
          <button type="button" @click="castRatherVote('left')">{{ ratherRound.left }}</button>
          <span>or</span>
          <button type="button" @click="castRatherVote('right')">{{ ratherRound.right }}</button>
        </div>
      </template>

      <template v-else-if="game.slug === 'charades'">
        <div class="party-charades">
          <span class="party-round-label">{{ timer > 0 ? `${timer}s remaining` : 'Time is up' }}</span>
          <h3>{{ isPromptVisible ? charadePrompt : 'Pass the device, then reveal the prompt.' }}</h3>
          <button v-if="!isPromptVisible" class="party-primary-button" type="button" @click="revealCharade">Reveal prompt</button>
          <template v-else>
            <div class="party-score-actions">
              <button type="button" @click="addTeamPoint('A')">Team A +1 · {{ teamAScore }}</button>
              <button type="button" @click="addTeamPoint('B')">Team B +1 · {{ teamBScore }}</button>
            </div>
            <div class="party-action-row">
              <button class="play-secondary-button" type="button" @click="nextCharade">Skip / next</button>
              <button class="party-primary-button" type="button" @click="startCharadeTimer">{{ timer === 60 ? 'Start 60 seconds' : 'Restart timer' }}</button>
            </div>
          </template>
        </div>
      </template>

      <template v-else-if="game.slug === 'never-have-i-ever'">
        <div class="party-prompt-card">
          <span class="party-round-label">Conversation starter</span>
          <h3>Never have I ever…</h3>
          <strong>{{ neverPrompt }}</strong>
          <p>Everyone who has done it shares a story or takes a point — your house rules decide.</p>
          <button class="party-primary-button" type="button" @click="nextNeverPrompt">Next statement</button>
        </div>
      </template>

      <template v-else>
        <div class="party-kmk">
          <span class="party-round-label">Fictional character edition</span>
          <h3>Choose one for each card</h3>
          <div class="party-kmk-grid">
            <article v-for="character in kmkRound" :key="character" class="party-kmk-card">
              <strong>{{ character }}</strong>
              <div>
                <button type="button" :class="{ 'party-kmk-card__choice--selected': kmkChoices[character] === 'Kiss' }" @click="assignKmkChoice(character, 'Kiss')">Kiss</button>
                <button type="button" :class="{ 'party-kmk-card__choice--selected': kmkChoices[character] === 'Marry' }" @click="assignKmkChoice(character, 'Marry')">Marry</button>
                <button type="button" :class="{ 'party-kmk-card__choice--selected': kmkChoices[character] === 'Kill' }" @click="assignKmkChoice(character, 'Kill')">Kill</button>
              </div>
            </article>
          </div>
          <button class="party-primary-button" type="button" @click="nextKmkRound">New trio</button>
        </div>
      </template>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import type { PlayGame } from '../../types/play-game'

type PartyPhase = 'setup' | 'reveal' | 'discussion' | 'round' | 'results'
type RatherChoice = 'left' | 'right'
type Team = 'A' | 'B'

interface ImposterRound {
  category: string
  word: string
}

interface RatherRound {
  left: string
  question: string
  right: string
}

const props = defineProps<{ game: PlayGame }>()

const imposterRounds: ImposterRound[] = [
  { category: 'Places', word: 'Lighthouse' },
  { category: 'Food', word: 'Pancakes' },
  { category: 'Objects', word: 'Camera' },
  { category: 'Animals', word: 'Penguin' },
]
const identities = ['Astronaut', 'Detective', 'Dragon trainer', 'Museum curator', 'Time traveler', 'Pirate captain', 'Wildlife photographer', 'Orchestra conductor', 'Deep-sea diver', 'Space gardener', 'Race car driver', 'Bookshop owner']
const charadePrompts = ['A penguin learning to fly', 'A robot baking a cake', 'Getting caught in a rainstorm', 'A magician losing their wand', 'A sleepy cat chasing a laser', 'Winning a dance contest', 'Trying to open a stubborn jar', 'A superhero late for work']
const neverPrompts = ['missed a train or flight', 'laughed so hard that I cried', 'sent a message to the wrong person', 'learned a dance from the internet', 'pretended to understand a movie I had not seen', 'fallen asleep during a film', 'eaten breakfast for dinner', 'forgotten why I entered a room']
const kmkRounds = [
  ['Diana Prince', 'Lara Croft', 'Leia Organa'],
  ['T’Challa', 'Steve Rogers', 'James Bond'],
  ['Flynn Rider', 'Prince Eric', 'Aladdin'],
  ['Mulan', 'Katniss Everdeen', 'Padmé Amidala'],
]
const ratherRounds: RatherRound[] = [
  { left: 'Speak every language', question: 'Would you rather…', right: 'Play every instrument' },
  { left: 'Live by the sea', question: 'Would you rather…', right: 'Live in the mountains' },
  { left: 'Always arrive early', question: 'Would you rather…', right: 'Never wait in a queue' },
  { left: 'Have a tiny dragon', question: 'Would you rather…', right: 'Have a clever robot' },
]

const players = ref(['Alex', 'Jamie', 'Taylor'])
const phase = ref<PartyPhase>('setup')
const setupError = ref('')
const currentPlayerIndex = ref(0)
const isSecretVisible = ref(false)
const imposterIndex = ref(0)
const assignedIdentities = ref<string[]>([])
const promptIndex = ref(0)
const ratherIndex = ref(0)
const ratherVotes = ref<Array<RatherChoice | null>>([])
const teamAScore = ref(0)
const teamBScore = ref(0)
const timer = ref(60)
const isPromptVisible = ref(false)
const kmkIndex = ref(0)
const kmkChoices = ref<Record<string, string>>({})
let timerHandle: ReturnType<typeof window.setInterval> | null = null

const minimumPlayers = computed(() => props.game.slug === 'imposter' ? 3 : 2)
const currentPlayer = computed(() => preparedPlayers.value[currentPlayerIndex.value] ?? 'the next player')
const preparedPlayers = computed(() => players.value.map((player, index) => player.trim() || `Player ${index + 1}`))
const imposterRound = computed(() => imposterRounds[promptIndex.value % imposterRounds.length])
const charadePrompt = computed(() => charadePrompts[promptIndex.value % charadePrompts.length])
const neverPrompt = computed(() => neverPrompts[promptIndex.value % neverPrompts.length])
const kmkRound = computed(() => kmkRounds[kmkIndex.value % kmkRounds.length])
const ratherRound = computed(() => ratherRounds[ratherIndex.value % ratherRounds.length])
const leftVotes = computed(() => ratherVotes.value.filter((vote) => vote === 'left').length)
const rightVotes = computed(() => ratherVotes.value.filter((vote) => vote === 'right').length)
const nextSecretButtonLabel = computed(() => (
  currentPlayerIndex.value === preparedPlayers.value.length - 1 ? 'Start discussion' : `Hide and pass to ${preparedPlayers.value[currentPlayerIndex.value + 1]}`
))
const rules = computed(() => {
  const rulesByGame: Record<PlayGame['slug'], string> = {
    charades: 'Split into teams. One person acts out the prompt while their team guesses before the timer ends.',
    imposter: 'Everyone except one player sees the secret word. Discuss it, then try to identify the Imposter.',
    'kiss-marry-kill': 'Choose one fictional character for each outcome, compare choices, and move on to a fresh trio.',
    'never-have-i-ever': 'Read the statement aloud and use it as a low-pressure conversation starter.',
    nonogram: '',
    chess: '',
    sudoku: '',
    'who-am-i': 'Each player privately receives an identity. Ask the group yes-or-no questions to work out who you are.',
    'would-you-rather': 'Vote privately by passing the device. The group result appears once every player has chosen.',
  }
  return rulesByGame[props.game.slug]
})

function addPlayer(): void {
  players.value.push(`Player ${players.value.length + 1}`)
}

function removePlayer(playerIndex: number): void {
  players.value.splice(playerIndex, 1)
}

function startGame(): void {
  if (preparedPlayers.value.length < minimumPlayers.value) {
    setupError.value = `Add at least ${minimumPlayers.value} players to start.`
    return
  }

  setupError.value = ''
  clearTimer()
  currentPlayerIndex.value = 0
  isSecretVisible.value = false

  if (props.game.slug === 'imposter') {
    imposterIndex.value = Math.floor(Math.random() * preparedPlayers.value.length)
    promptIndex.value += 1
    phase.value = 'reveal'
    return
  }

  if (props.game.slug === 'who-am-i') {
    assignedIdentities.value = shuffle(identities).slice(0, preparedPlayers.value.length)
    phase.value = 'reveal'
    return
  }

  if (props.game.slug === 'would-you-rather') {
    ratherVotes.value = Array.from({ length: preparedPlayers.value.length }, () => null)
    phase.value = 'round'
    return
  }

  if (props.game.slug === 'charades') {
    timer.value = 60
    isPromptVisible.value = false
  }

  phase.value = 'round'
}

function advanceSecretReveal(): void {
  if (!isSecretVisible.value) {
    isSecretVisible.value = true
    return
  }

  if (currentPlayerIndex.value === preparedPlayers.value.length - 1) {
    phase.value = 'discussion'
    isSecretVisible.value = false
    return
  }

  currentPlayerIndex.value += 1
  isSecretVisible.value = false
}

function castRatherVote(choice: RatherChoice): void {
  ratherVotes.value[currentPlayerIndex.value] = choice

  if (currentPlayerIndex.value === preparedPlayers.value.length - 1) {
    phase.value = 'results'
    return
  }

  currentPlayerIndex.value += 1
}

function nextRatherRound(): void {
  ratherIndex.value += 1
  ratherVotes.value = Array.from({ length: preparedPlayers.value.length }, () => null)
  currentPlayerIndex.value = 0
  phase.value = 'round'
}

function revealCharade(): void {
  isPromptVisible.value = true
}

function startCharadeTimer(): void {
  clearTimer()
  timer.value = 60
  timerHandle = window.setInterval(() => {
    timer.value -= 1

    if (timer.value <= 0) clearTimer()
  }, 1_000)
}

function nextCharade(): void {
  clearTimer()
  promptIndex.value += 1
  timer.value = 60
  isPromptVisible.value = false
}

function addTeamPoint(team: Team): void {
  if (team === 'A') {
    teamAScore.value += 1
  } else {
    teamBScore.value += 1
  }
}

function nextNeverPrompt(): void {
  promptIndex.value += 1
}

function assignKmkChoice(character: string, choice: string): void {
  kmkChoices.value = { ...kmkChoices.value, [character]: choice }
}

function nextKmkRound(): void {
  kmkIndex.value += 1
  kmkChoices.value = {}
}

function clearTimer(): void {
  if (timerHandle === null) return

  window.clearInterval(timerHandle)
  timerHandle = null
}

function shuffle<T>(items: readonly T[]): T[] {
  const shuffledItems = [...items]

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const item = shuffledItems[index]
    shuffledItems[index] = shuffledItems[randomIndex]
    shuffledItems[randomIndex] = item
  }

  return shuffledItems
}

onUnmounted(clearTimer)
</script>
