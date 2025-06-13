"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Trophy } from "lucide-react"
import { GROUPS, KNOCKOUT_STRUCTURE } from "@/lib/tournament-data"
import type { Prediction, TournamentResults } from "@/lib/types"

interface PredictionAnalysisProps {
  prediction: Prediction
  onBack: () => void
}

export function PredictionAnalysis({ prediction, onBack }: PredictionAnalysisProps) {
  const [results, setResults] = useState<TournamentResults | null>(null)
  const [analysis, setAnalysis] = useState<{
    groupPoints: Record<string, number>
    knockoutPoints: Record<string, number>
    totalPoints: number
    detailedAnalysis: {
      groups: Record<
        string,
        {
          qualified: { team: string; correct: boolean; position: boolean }[]
          points: number
        }
      >
      knockout: Record<
        string,
        {
          winner: { team: string; correct: boolean }
          score: { predicted: [number, number]; actual: [number, number]; correct: boolean }
          extraTime: { predicted: boolean; actual: boolean; correct: boolean }
          penalties: { predicted: string; actual: string; correct: boolean }
          points: number
        }
      >
    }
  } | null>(null)

  useEffect(() => {
    const savedResults = localStorage.getItem("tournamentResults")
    if (savedResults) {
      setResults(JSON.parse(savedResults))
    }
  }, [])

  useEffect(() => {
    if (!results) return

    // Initialize analysis structure
    const groupPoints: Record<string, number> = {}
    const knockoutPoints: Record<string, number> = {}
    let totalPoints = 0

    const detailedAnalysis = {
      groups: {} as Record<
        string,
        {
          qualified: { team: string; correct: boolean; position: boolean }[]
          points: number
        }
      >,
      knockout: {} as Record<
        string,
        {
          winner: { team: string; correct: boolean }
          score: { predicted: [number, number]; actual: [number, number]; correct: boolean }
          extraTime: { predicted: boolean; actual: boolean; correct: boolean }
          penalties: { predicted: string; actual: string; correct: boolean }
          points: number
        }
      >,
    }

    // Analyze group predictions
    Object.keys(GROUPS).forEach((group) => {
      const userPrediction = prediction.groupPredictions[group] || []
      const actualQualified = results.groupResults[group]?.qualified || []

      let groupScore = 0
      const qualifiedAnalysis: { team: string; correct: boolean; position: boolean }[] = []

      userPrediction.forEach((team, index) => {
        const isQualified = actualQualified.includes(team)
        const correctPosition = actualQualified[index] === team

        if (isQualified) {
          groupScore += 2 // Base points for correct qualification
          if (correctPosition) {
            groupScore += 1 // Extra point for correct position
          }
        }

        qualifiedAnalysis.push({
          team,
          correct: isQualified,
          position: correctPosition && isQualified,
        })
      })

      groupPoints[group] = groupScore
      totalPoints += groupScore

      detailedAnalysis.groups[group] = {
        qualified: qualifiedAnalysis,
        points: groupScore,
      }
    })

    // Analyze knockout predictions
    Object.keys(prediction.knockoutPredictions).forEach((matchId) => {
      const userPrediction = prediction.knockoutPredictions[matchId]
      const actualResult = results.knockoutResults[matchId]

      if (!actualResult) return // Skip if no actual result yet

      let matchScore = 0
      const matchAnalysis = {
        winner: {
          team: userPrediction.winner,
          correct: userPrediction.winner === actualResult.winner,
        },
        score: {
          predicted: [userPrediction.regularTime1, userPrediction.regularTime2] as [number, number],
          actual: [actualResult.regularTime1, actualResult.regularTime2] as [number, number],
          correct:
            userPrediction.regularTime1 === actualResult.regularTime1 &&
            userPrediction.regularTime2 === actualResult.regularTime2,
        },
        extraTime: {
          predicted: userPrediction.wentToExtraTime,
          actual: actualResult.wentToExtraTime || false,
          correct: userPrediction.wentToExtraTime === (actualResult.wentToExtraTime || false),
        },
        penalties: {
          predicted: userPrediction.penaltyWinner,
          actual: actualResult.penaltyWinner || "",
          correct: userPrediction.penaltyWinner === (actualResult.penaltyWinner || ""),
        },
        points: 0,
      }

      // Calculate points based on match phase
      const phase = getMatchPhase(matchId)
      const basePoints = getBasePointsByPhase(phase)

      // Points for correct winner
      if (matchAnalysis.winner.correct) {
        matchScore += basePoints
      }

      // Extra points for correct score
      if (matchAnalysis.score.correct) {
        matchScore += Math.floor(basePoints / 2)
      }

      // Extra points for correct extra time prediction
      if (matchAnalysis.extraTime.correct && actualResult.wentToExtraTime) {
        matchScore += 1
      }

      // Extra points for correct penalty winner
      if (matchAnalysis.penalties.correct && actualResult.penaltyWinner) {
        matchScore += 2
      }

      // Bonus for final match
      if (matchId === "final" && matchAnalysis.winner.correct) {
        matchScore += 5 // Bonus for correct champion
      }

      matchAnalysis.points = matchScore
      knockoutPoints[matchId] = matchScore
      totalPoints += matchScore

      detailedAnalysis.knockout[matchId] = matchAnalysis
    })

    setAnalysis({
      groupPoints,
      knockoutPoints,
      totalPoints,
      detailedAnalysis,
    })
  }, [results, prediction])

  const getMatchPhase = (matchId: string): string => {
    if (matchId.startsWith("r16")) return "roundOf16"
    if (matchId.startsWith("qf")) return "quarterFinals"
    if (matchId.startsWith("sf")) return "semiFinals"
    if (matchId === "third") return "thirdPlace"
    if (matchId === "final") return "final"
    return ""
  }

  const getBasePointsByPhase = (phase: string): number => {
    switch (phase) {
      case "roundOf16":
        return 4
      case "quarterFinals":
        return 6
      case "semiFinals":
        return 8
      case "thirdPlace":
        return 5
      case "final":
        return 10
      default:
        return 0
    }
  }

  const getPhaseName = (phase: string): string => {
    switch (phase) {
      case "roundOf16":
        return "Oitavas de Final"
      case "quarterFinals":
        return "Quartas de Final"
      case "semiFinals":
        return "Semifinais"
      case "thirdPlace":
        return "Disputa de 3º Lugar"
      case "final":
        return "Final"
      default:
        return phase
    }
  }

  const getMatchDescription = (matchId: string): string => {
    // Para jogos específicos como final e terceiro lugar
    if (matchId === "final") return "Final"
    if (matchId === "third") return "Disputa de 3º Lugar"

    // Para outros jogos, use uma descrição mais detalhada
    if (matchId.startsWith("r16")) {
      const num = matchId.split("_")[1]
      return `Oitavas de Final ${num}`
    }

    if (matchId.startsWith("qf")) {
      const num = matchId.split("_")[1]
      return `Quartas de Final ${num}`
    }

    if (matchId.startsWith("sf")) {
      const num = matchId.split("_")[1]
      return `Semifinal ${num}`
    }

    // Fallback para outros casos
    for (const [phase, matches] of Object.entries(KNOCKOUT_STRUCTURE)) {
      const match = matches.find((m) => m.id === matchId)
      if (match) return match.description
    }

    return matchId
  }

  if (!results || !analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analisando palpite...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando resultados e análise...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise do Palpite</h2>
          <p className="text-gray-600">
            {prediction.playerName} - {new Date(prediction.timestamp).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Pontuação Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-center">{analysis.totalPoints} pontos</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-700">Fase de Grupos</p>
              <p className="text-xl font-bold text-blue-800">
                {Object.values(analysis.groupPoints).reduce((a, b) => a + b, 0)} pts
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-700">Fase Mata-Mata</p>
              <p className="text-xl font-bold text-green-800">
                {Object.values(analysis.knockoutPoints).reduce((a, b) => a + b, 0)} pts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Fase de Grupos</TabsTrigger>
          <TabsTrigger value="knockout">Mata-Mata</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analysis.detailedAnalysis.groups).map(([group, data]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="text-center">Grupo {group}</CardTitle>
                  <CardDescription className="text-center">
                    <Badge variant={data.points > 0 ? "default" : "outline"}>{data.points} pontos</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.qualified.map((team, index) => (
                    <div key={`${group}-${team.team}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {team.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span>{team.team}</span>
                      </div>
                      <Badge
                        variant={team.position ? "default" : "outline"}
                        className={team.position ? "bg-green-500" : ""}
                      >
                        {index === 0 ? "1º" : "2º"}
                        {team.position && " ✓"}
                      </Badge>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>2 pts por time classificado</p>
                    <p>+1 pt por posição correta</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="knockout" className="space-y-6">
          {Object.entries(
            Object.entries(analysis.detailedAnalysis.knockout).reduce(
              (acc, [matchId, data]) => {
                const phase = getMatchPhase(matchId)
                if (!acc[phase]) acc[phase] = []
                acc[phase].push([matchId, data])
                return acc
              },
              {} as Record<string, Array<[string, (typeof analysis.detailedAnalysis.knockout)[string]]>>,
            ),
          ).map(([phase, matches]) => (
            <div key={phase}>
              <h3 className="text-xl font-semibold mb-4">{getPhaseName(phase)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map(([matchId, data]) => {
                  const userPrediction = prediction.knockoutPredictions[matchId]
                  const actualResult = results.knockoutResults[matchId]

                  return (
                    <Card key={matchId}>
                      <CardHeader>
                        <CardTitle className="text-center text-sm font-medium">
                          {getMatchDescription(matchId)}
                        </CardTitle>
                        <CardDescription className="text-center">
                          <Badge variant={data.points > 0 ? "default" : "outline"}>{data.points} pontos</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <p className="font-medium">
                            {userPrediction.team1} vs {userPrediction.team2}
                          </p>
                        </div>

                        {/* Winner */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            {data.winner.correct ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm">Vencedor</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{data.winner.team}</span>
                            {data.winner.correct && <Trophy className="h-4 w-4 text-yellow-500" />}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            {data.score.correct ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm">Placar</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {data.score.predicted[0]} - {data.score.predicted[1]}
                            </span>
                            {!data.score.correct && (
                              <span className="text-xs text-gray-500">
                                (Real: {data.score.actual[0]} - {data.score.actual[1]})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Extra Time */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            {data.extraTime.correct ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm">Prorrogação</span>
                          </div>
                          <div>
                            <Badge variant={data.extraTime.predicted ? "default" : "outline"}>
                              {data.extraTime.predicted ? "Sim" : "Não"}
                            </Badge>
                          </div>
                        </div>

                        {/* Penalties (if applicable) */}
                        {(data.penalties.predicted || data.penalties.actual) && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2">
                              {data.penalties.correct && data.penalties.actual ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="text-sm">Pênaltis</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">{data.penalties.predicted || "Não previsto"}</span>
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-2">
                          <p>Pontos base: {getBasePointsByPhase(phase)}</p>
                          <p>+{Math.floor(getBasePointsByPhase(phase) / 2)} pts por placar exato</p>
                          <p>+1 pt por prorrogação correta</p>
                          <p>+2 pts por pênaltis corretos</p>
                          {phase === "final" && <p>+5 pts por campeão correto</p>}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
