type ExampleConsumer<T> = (example: T) => void

interface IdleCallbackWindow {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
}

const backgroundJobs: Array<() => void> = []
let isBackgroundJobScheduled = false

function scheduleBackgroundWork(): void {
  if (isBackgroundJobScheduled || backgroundJobs.length === 0) return

  isBackgroundJobScheduled = true
  const runNextJob = (): void => {
    isBackgroundJobScheduled = false
    const nextJob = backgroundJobs.shift()

    nextJob?.()

    if (backgroundJobs.length > 0) scheduleBackgroundWork()
  }
  const idleWindow = window as unknown as IdleCallbackWindow

  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(() => runNextJob(), { timeout: 1_500 })
    return
  }

  window.setTimeout(runNextJob, 32)
}

function enqueueBackgroundJob(job: () => void): void {
  backgroundJobs.push(job)
  scheduleBackgroundWork()
}

/**
 * Keeps generated examples ready without running their generation work while
 * the user is interacting with the page. A single shared queue lets every
 * game take turns, so a slower generator cannot starve the other games.
 */
export class ExamplePool<T> {
  private readonly examples: T[] = []
  private isGenerating = false
  private waitingConsumer: ExampleConsumer<T> | null = null

  constructor(
    private readonly generate: () => T,
    private readonly capacity = 3,
  ) {}

  preload(): void {
    if (this.isGenerating || this.examples.length >= this.capacity) return

    this.isGenerating = true
    enqueueBackgroundJob(() => {
      const example = this.generate()
      this.isGenerating = false

      const consumer = this.waitingConsumer
      this.waitingConsumer = null

      if (consumer) {
        consumer(example)
      } else {
        this.examples.push(example)
      }

      this.preload()
    })
  }

  take(consumer: ExampleConsumer<T>): boolean {
    const example = this.examples.shift()

    if (example !== undefined) {
      consumer(example)
      this.preload()
      return true
    }

    this.waitingConsumer = consumer
    this.preload()
    return false
  }
}
