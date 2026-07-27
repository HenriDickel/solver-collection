export interface SolverRunController {
  cancel: () => void
  isCurrent: (runId: number) => boolean
  start: () => number
}

export function createSolverRunController(): SolverRunController {
  let activeRunId = 0

  return {
    cancel() {
      activeRunId += 1
    },
    isCurrent(runId: number) {
      return runId === activeRunId
    },
    start() {
      activeRunId += 1
      return activeRunId
    },
  }
}

export function waitForSolverStep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
