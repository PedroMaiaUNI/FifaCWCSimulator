export interface Prediction {
  id: string
  playerName: string
  groupPredictions: Record<string, string[]>
  knockoutPredictions: Record<string, KnockoutMatch>
  timestamp: string
  score: number
}

export interface KnockoutMatch {
  team1: string
  team2: string
  regularTime1: number
  regularTime2: number
  wentToExtraTime: boolean
  penaltyWinner: string
  winner: string
}

export interface GroupResult {
  qualified: string[]
}

export interface KnockoutResult {
  team1: string
  team2: string
  regularTime1: number
  regularTime2: number
  wentToExtraTime?: boolean
  penaltyWinner?: string
  winner: string
}

export interface TournamentResults {
  groupResults: Record<string, GroupResult>
  knockoutResults: Record<string, KnockoutResult>
  currentPhase: "groups" | "knockout" | "finished"
}
