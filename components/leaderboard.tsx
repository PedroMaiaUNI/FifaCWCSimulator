"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import type { Prediction, TournamentResults } from "@/lib/types"

export function Leaderboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [results, setResults] = useState<TournamentResults | null>(null)
  const [leaderboard, setLeaderboard] = useState<(Prediction & { calculatedScore: number })[]>([])

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
          userPrediction.forEach((team) => {
            if (actualQualified.includes(team)) {
              score += 2
            }
          })
        })

        // Score knockout predictions (implement based on your scoring system)
        // This is a simplified version - you can expand based on your needs

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
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg font-bold">
                    {prediction.calculatedScore} pts
                  </Badge>
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
              <strong>Fase de Grupos:</strong> 2 pontos por time classificado correto
            </p>
            <p>
              <strong>Mata-mata:</strong> Pontuação baseada na fase e precisão do resultado
            </p>
            <p>
              <strong>Campeão:</strong> Pontuação extra para acertar o campeão
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
