export function randomInteger(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive)
}

export function shuffle<T>(values: readonly T[]): T[] {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInteger(index + 1)
    const value = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = value
  }

  return shuffled
}
