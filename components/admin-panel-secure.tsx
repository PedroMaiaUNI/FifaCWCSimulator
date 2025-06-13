"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GROUPS } from "@/lib/tournament-data"
import { Trash2 } from "lucide-react"
import type { TournamentResults, KnockoutResult } from "@/lib/types"

export function AdminPanel() {
  const [results, setResults] = useState<TournamentResults>({
    groupResults: {},
    knockoutResults: {},
    currentPhase: "groups",
  })
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const savedResults = localStorage.getItem("tournamentResults")
    if (savedResults) {
      setResults(JSON.parse(savedResults))
    }
  }, [])

  const saveResults = (newResults: TournamentResults) => {
    setResults(newResults)
    localStorage.setItem("tournamentResults", JSON.stringify(newResults))
    setMessage({
      text: "Os resultados foram atualizados com sucesso.",
      type: "success",
    })

    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const resetAllResults = () => {
    const emptyResults: TournamentResults = {
      groupResults: {},
      knockoutResults: {},
      currentPhase: "groups",
    }

    setResults(emptyResults)
    localStorage.setItem("tournamentResults", JSON.stringify(emptyResults))

    setMessage({
      text: "Todos os resultados foram resetados com sucesso.",
      type: "success",
    })

    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const updateGroupResult = (group: string, team: string, position: "first" | "second") => {
    const current = results.groupResults[group]?.qualified || []
    let newQualified = [...current]

    if (position === "first") {
      // Set as first place
      newQualified = [team, current[1]].filter(Boolean)
    } else {
      // Set as second place
      newQualified = [current[0], team].filter(Boolean)
    }

    const newResults = {
      ...results,
      groupResults: {
        ...results.groupResults,
        [group]: { qualified: newQualified },
      },
    }
    saveResults(newResults)
  }

  const removeFromGroup = (group: string, team: string) => {
    const current = results.groupResults[group]?.qualified || []
    const newQualified = current.filter((t) => t !== team)

    const newResults = {
      ...results,
      groupResults: {
        ...results.groupResults,
        [group]: { qualified: newQualified },
      },
    }
    saveResults(newResults)
  }

  const generateKnockoutMatches = () => {
    const matches: Array<{
      id: string
      team1: string
      team2: string
      phase: string
      description: string
    }> = []

    // Check if all groups have 2 qualified teams
    const allGroupsComplete = Object.keys(GROUPS).every((group) => results.groupResults[group]?.qualified?.length === 2)

    if (!allGroupsComplete) return matches

    // Round of 16
    const r16Matches = [
      {
        id: "r16_1",
        team1: results.groupResults["A"]?.qualified[0],
        team2: results.groupResults["B"]?.qualified[1],
        description: "1A x 2B",
      },
      {
        id: "r16_2",
        team1: results.groupResults["C"]?.qualified[0],
        team2: results.groupResults["D"]?.qualified[1],
        description: "1C x 2D",
      },
      {
        id: "r16_3",
        team1: results.groupResults["E"]?.qualified[0],
        team2: results.groupResults["F"]?.qualified[1],
        description: "1E x 2F",
      },
      {
        id: "r16_4",
        team1: results.groupResults["G"]?.qualified[0],
        team2: results.groupResults["H"]?.qualified[1],
        description: "1G x 2H",
      },
      {
        id: "r16_5",
        team1: results.groupResults["A"]?.qualified[1],
        team2: results.groupResults["B"]?.qualified[0],
        description: "2A x 1B",
      },
      {
        id: "r16_6",
        team1: results.groupResults["C"]?.qualified[1],
        team2: results.groupResults["D"]?.qualified[0],
        description: "2C x 1D",
      },
      {
        id: "r16_7",
        team1: results.groupResults["E"]?.qualified[1],
        team2: results.groupResults["F"]?.qualified[0],
        description: "2E x 1F",
      },
      {
        id: "r16_8",
        team1: results.groupResults["G"]?.qualified[1],
        team2: results.groupResults["H"]?.qualified[0],
        description: "2G x 1H",
      },
    ]

    r16Matches.forEach((match) => {
      if (match.team1 && match.team2) {
        matches.push({
          ...match,
          phase: "Oitavas",
        })
      }
    })

    // Quarter Finals
    const qfMatches = [
      { id: "qf_1", r16_1: "r16_1", r16_2: "r16_2", description: "Vencedor Oitava 1 x Vencedor Oitava 2" },
      { id: "qf_2", r16_1: "r16_3", r16_2: "r16_4", description: "Vencedor Oitava 3 x Vencedor Oitava 4" },
      { id: "qf_3", r16_1: "r16_5", r16_2: "r16_6", description: "Vencedor Oitava 5 x Vencedor Oitava 6" },
      { id: "qf_4", r16_1: "r16_7", r16_2: "r16_8", description: "Vencedor Oitava 7 x Vencedor Oitava 8" },
    ]

    qfMatches.forEach((match) => {
      const team1 = results.knockoutResults[match.r16_1]?.winner
      const team2 = results.knockoutResults[match.r16_2]?.winner
      if (team1 && team2) {
        matches.push({
          id: match.id,
          team1,
          team2,
          phase: "Quartas",
          description: match.description,
        })
      }
    })

    // Semi Finals
    const sfMatches = [
      { id: "sf_1", qf_1: "qf_1", qf_2: "qf_2", description: "Vencedor Quarta 1 x Vencedor Quarta 2" },
      { id: "sf_2", qf_1: "qf_3", qf_2: "qf_4", description: "Vencedor Quarta 3 x Vencedor Quarta 4" },
    ]

    sfMatches.forEach((match) => {
      const team1 = results.knockoutResults[match.qf_1]?.winner
      const team2 = results.knockoutResults[match.qf_2]?.winner
      if (team1 && team2) {
        matches.push({
          id: match.id,
          team1,
          team2,
          phase: "Semifinais",
          description: match.description,
        })
      }
    })

    // Third Place
    const sf1Loser = results.knockoutResults["sf_1"]
      ? results.knockoutResults["sf_1"].winner === results.knockoutResults["sf_1"].team1
        ? results.knockoutResults["sf_1"].team2
        : results.knockoutResults["sf_1"].team1
      : null
    const sf2Loser = results.knockoutResults["sf_2"]
      ? results.knockoutResults["sf_2"].winner === results.knockoutResults["sf_2"].team1
        ? results.knockoutResults["sf_2"].team2
        : results.knockoutResults["sf_2"].team1
      : null

    if (sf1Loser && sf2Loser) {
      matches.push({
        id: "third",
        team1: sf1Loser,
        team2: sf2Loser,
        phase: "3º Lugar",
        description: "Disputa do 3º Lugar",
      })
    }

    // Final
    const sf1Winner = results.knockoutResults["sf_1"]?.winner
    const sf2Winner = results.knockoutResults["sf_2"]?.winner
    if (sf1Winner && sf2Winner) {
      matches.push({
        id: "final",
        team1: sf1Winner,
        team2: sf2Winner,
        phase: "Final",
        description: "Final",
      })
    }

    return matches
  }

  const updateKnockoutResult = (
    matchId: string,
    updates: Partial<{
      regularTime1: number
      regularTime2: number
      wentToExtraTime: boolean
      penaltyWinner: string
      winner: string
    }>,
  ) => {
    const match = generateKnockoutMatches().find((m) => m.id === matchId)
    if (!match) return

    const currentResult = results.knockoutResults[matchId] || {
      team1: match.team1,
      team2: match.team2,
      regularTime1: 0,
      regularTime2: 0,
      wentToExtraTime: false,
      penaltyWinner: "",
      winner: "",
    }

    const newResult: KnockoutResult = {
      ...currentResult,
      ...updates,
    }

    // Auto-determine winner if scores are provided
    if (updates.regularTime1 !== undefined && updates.regularTime2 !== undefined) {
      const rt1 = updates.regularTime1
      const rt2 = updates.regularTime2

      if (rt1 === rt2) {
        // Tie - must go to penalties
        newResult.wentToExtraTime = true
        // Winner determined by penalty winner selection
        if (newResult.penaltyWinner) {
          newResult.winner = newResult.penaltyWinner
        }
      } else {
        // Clear winner from regular time
        newResult.winner = rt1 > rt2 ? match.team1 : match.team2
        // Could still have gone to extra time
        if (!newResult.wentToExtraTime) {
          newResult.penaltyWinner = ""
        }
      }
    }

    const newResults = {
      ...results,
      knockoutResults: {
        ...results.knockoutResults,
        [matchId]: newResult,
      },
    }
    saveResults(newResults)
  }

  const hasResults = () => {
    // Check if there are any group results
    const hasGroupResults = Object.keys(results.groupResults).length > 0

    // Check if there are any knockout results
    const hasKnockoutResults = Object.keys(results.knockoutResults).length > 0

    return hasGroupResults || hasKnockoutResults
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Painel Administrativo</CardTitle>
          {hasResults() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Resetar Tudo</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetar todos os resultados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá limpar todos os resultados do torneio. Isso afetará a pontuação de todos os palpites.
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={resetAllResults} className="bg-red-600 hover:bg-red-700">
                    Resetar Tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Use este painel para atualizar os resultados reais do torneio em tempo real.</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Fase de Grupos</TabsTrigger>
          <TabsTrigger value="knockout">Mata-Mata</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(GROUPS).map(([group, teams]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="text-center">Grupo {group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {teams.map((team) => {
                      const qualified = results.groupResults[group]?.qualified || []
                      const position = qualified.indexOf(team)
                      const isFirst = position === 0
                      const isSecond = position === 1
                      const isQualified = position !== -1

                      return (
                        <div key={team} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{team}</span>
                            {isQualified && (
                              <Badge
                                variant={isFirst ? "default" : "secondary"}
                                className={isFirst ? "bg-green-500" : "bg-red-500"}
                              >
                                {isFirst ? "1º" : "2º"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={isFirst ? "default" : "outline"}
                              className={isFirst ? "bg-green-600 hover:bg-green-700" : ""}
                              onClick={() => updateGroupResult(group, team, "first")}
                            >
                              1º
                            </Button>
                            <Button
                              size="sm"
                              variant={isSecond ? "default" : "outline"}
                              className={isSecond ? "bg-red-600 hover:bg-red-700" : ""}
                              onClick={() => updateGroupResult(group, team, "second")}
                            >
                              2º
                            </Button>
                            {isQualified && (
                              <Button size="sm" variant="outline" onClick={() => removeFromGroup(group, team)}>
                                ✕
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">
                      Classificados: {results.groupResults[group]?.qualified?.length || 0}/2
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="knockout" className="space-y-4">
          {generateKnockoutMatches().length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Resultados do Mata-Mata</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Complete primeiro a fase de grupos para liberar o mata-mata.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                generateKnockoutMatches().reduce(
                  (acc, match) => {
                    if (!acc[match.phase]) acc[match.phase] = []
                    acc[match.phase].push(match)
                    return acc
                  },
                  {} as Record<string, typeof generateKnockoutMatches>,
                ),
              ).map(([phase, matches]) => (
                <div key={phase}>
                  <h3 className="text-xl font-semibold mb-4">{phase}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((match) => {
                      const result = results.knockoutResults[match.id]
                      const isTied = result && result.regularTime1 === result.regularTime2

                      return (
                        <Card key={match.id}>
                          <CardHeader>
                            <CardTitle className="text-center text-sm">{match.description}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="text-center">
                              <p className="font-medium">
                                {match.team1} vs {match.team2}
                              </p>
                            </div>

                            {/* Score Input */}
                            <div className="space-y-2">
                              <Label>Placar Final</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={result?.regularTime1?.toString() || ""}
                                  onChange={(e) =>
                                    updateKnockoutResult(match.id, {
                                      regularTime1: Number.parseInt(e.target.value) || 0,
                                      regularTime2: result?.regularTime2 || 0,
                                    })
                                  }
                                  className="text-center"
                                />
                                <span className="font-bold">-</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={result?.regularTime2?.toString() || ""}
                                  onChange={(e) =>
                                    updateKnockoutResult(match.id, {
                                      regularTime1: result?.regularTime1 || 0,
                                      regularTime2: Number.parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="text-center"
                                />
                              </div>
                            </div>

                            {/* Extra Time */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`extraTime-${match.id}`}
                                checked={isTied ? true : result?.wentToExtraTime || false}
                                disabled={isTied}
                                onCheckedChange={(checked) =>
                                  updateKnockoutResult(match.id, {
                                    wentToExtraTime: checked as boolean,
                                  })
                                }
                              />
                              <Label htmlFor={`extraTime-${match.id}`} className="text-sm">
                                {isTied ? "Empate - foi para prorrogação" : "Foi para prorrogação"}
                              </Label>
                            </div>

                            {/* Penalty Winner - only show when tied */}
                            {isTied && (
                              <div className="space-y-2">
                                <Label>Vencedor nos Pênaltis</Label>
                                <Select
                                  value={result?.penaltyWinner || ""}
                                  onValueChange={(penaltyWinner) =>
                                    updateKnockoutResult(match.id, {
                                      penaltyWinner,
                                      winner: penaltyWinner,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o vencedor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={match.team1}>{match.team1}</SelectItem>
                                    <SelectItem value={match.team2}>{match.team2}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Winner Display */}
                            {result?.winner && (
                              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-sm font-medium text-green-700">🏆 Vencedor:</span>
                                  <span className="text-lg font-bold text-green-800">{result.winner}</span>
                                </div>
                                {result.regularTime1 !== undefined && result.regularTime2 !== undefined && (
                                  <div className="text-sm text-green-600 mt-1">
                                    Placar: {result.regularTime1} - {result.regularTime2}
                                    {result.wentToExtraTime && !isTied && " (prorrogação)"}
                                    {isTied && " (pênaltis)"}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
