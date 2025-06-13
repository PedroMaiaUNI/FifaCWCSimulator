"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, BarChart3 } from "lucide-react"
import { PredictionAnalysis } from "@/components/prediction-analysis"
import type { Prediction, TournamentResults } from "@/lib/types"

export function Leaderboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [results, setResults] = useState<TournamentResults | null>(null)
  const [leaderboard, setLeaderboard] = useState<(Prediction & { calculatedScore: number })[]>([])
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)

  useEffect(() => {
    const savedPredictions = localStorage.getItem("predictions")
    const savedResults = localStorage.getItem("tournamentResults")

    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions))
    }

    if (savedResults) {
      setResults(JSON.parse(savedResults))
    }
  }, [])

  useEffect(() => {
    if (predictions.length > 0 && results) {
      const scoredPredictions = predictions.map((prediction) => {
        let score = 0

        // Score group predictions
        Object.entries(results.groupResults).forEach(([group, result]) => {
          const userPrediction = prediction.groupPredictions[group] || []
          const actualQualified = result.qualified || []

          // 2 points for each correct qualifier
          userPrediction.forEach((team, index) => {
            if (actualQualified.includes(team)) {
              score += 2
              // Extra point for correct position
              if (actualQualified[index] === team) {
                score += 1
              }
            }
          })
        })

        // Score knockout predictions
        Object.entries(prediction.knockoutPredictions).forEach(([matchId, userPrediction]) => {
          const actualResult = results.knockoutResults[matchId]
          if (!actualResult) return // Skip if no actual result yet

          // Points based on match phase
          let basePoints = 0
          if (matchId.startsWith("r16")) basePoints = 4
          else if (matchId.startsWith("qf")) basePoints = 6
          else if (matchId.startsWith("sf")) basePoints = 8
          else if (matchId === "third") basePoints = 5
          else if (matchId === "final") basePoints = 10

          // Correct winner
          if (userPrediction.winner === actualResult.winner) {
            score += basePoints

            // Bonus for final match
            if (matchId === "final") {
              score += 5 // Bonus for correct champion
            }
          }

          // Correct score
          if (
            userPrediction.regularTime1 === actualResult.regularTime1 &&
            userPrediction.regularTime2 === actualResult.regularTime2
          ) {
            score += Math.floor(basePoints / 2)
          }

          // Correct extra time prediction
          if (
            userPrediction.wentToExtraTime === (actualResult.wentToExtraTime || false) &&
            actualResult.wentToExtraTime
          ) {
            score += 1
          }

          // Correct penalty winner
          if (userPrediction.penaltyWinner === (actualResult.penaltyWinner || "") && actualResult.penaltyWinner) {
            score += 2
          }
        })

        return {
          ...prediction,
          calculatedScore: score,
        }
      })

      // Sort by score (descending)
      const sortedLeaderboard = scoredPredictions.sort((a, b) => b.calculatedScore - a.calculatedScore)
      setLeaderboard(sortedLeaderboard)
    }
  }, [predictions, results])

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>
    }
  }

  if (selectedPrediction) {
    return <PredictionAnalysis prediction={selectedPrediction} onBack={() => setSelectedPrediction(null)} />
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">Nenhum palpite foi enviado ainda.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((prediction, index) => (
              <div key={prediction.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  {getRankIcon(index + 1)}
                  <div>
                    <h3 className="font-semibold">{prediction.playerName}</h3>
                    <p className="text-sm text-gray-600">
                      Enviado em {new Date(prediction.timestamp).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-lg font-bold">
                    {prediction.calculatedScore} pts
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPrediction(prediction)}
                    className="flex items-center gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Analisar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Pontuação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Fase de Grupos:</strong> 2 pontos por time classificado correto + 1 ponto por posição correta
            </p>
            <p>
              <strong>Oitavas de Final:</strong> 4 pontos por vencedor correto + 2 pontos por placar exato
            </p>
            <p>
              <strong>Quartas de Final:</strong> 6 pontos por vencedor correto + 3 pontos por placar exato
            </p>
            <p>
              <strong>Semifinais:</strong> 8 pontos por vencedor correto + 4 pontos por placar exato
            </p>
            <p>
              <strong>Final:</strong> 10 pontos por vencedor correto + 5 pontos por placar exato + 5 pontos por campeão
              correto
            </p>
            <p>
              <strong>Bônus:</strong> +1 ponto por prorrogação correta, +2 pontos por pênaltis corretos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
