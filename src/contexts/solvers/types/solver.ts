export type SolverMode = 'ready' | 'solving' | 'solved' | 'stuck'
export type SolverLogLevel = 'info' | 'success' | 'warning'

export interface SolverLog {
  id: number
  level: SolverLogLevel
  message: string
}
