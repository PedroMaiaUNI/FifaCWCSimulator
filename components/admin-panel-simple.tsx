"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { GROUPS } from "@/lib/tournament-data"
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

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const updateGroupResult = (group: string, qualified: string[]) => {
    const newResults = {
      ...results,
      groupResults: {
        ...results.groupResults,
        [group]: { qualified },
      },
    }
    saveResults(newResults)
  }

  const updateKnockoutResult = (matchId: string, result: KnockoutResult) => {
    const newResults = {
      ...results,
      knockoutResults: {
        ...results.knockoutResults,
        [matchId]: result,
      },
    }
    saveResults(newResults)
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
        <CardHeader>
          <CardTitle>Painel Administrativo</CardTitle>
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
                    {teams.map((team) => (
                      <div key={team} className="flex items-center justify-between">
                        <span className="text-sm">{team}</span>
                        <Button
                          size="sm"
                          variant={results.groupResults[group]?.qualified?.includes(team) ? "default" : "outline"}
                          onClick={() => {
                            const current = results.groupResults[group]?.qualified || []
                            if (current.includes(team)) {
                              updateGroupResult(
                                group,
                                current.filter((t) => t !== team),
                              )
                            } else if (current.length < 2) {
                              updateGroupResult(group, [...current, team])
                            }
                          }}
                        >
                          {results.groupResults[group]?.qualified?.includes(team) ? "✓" : "+"}
                        </Button>
                      </div>
                    ))}
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
          <Card>
            <CardHeader>
              <CardTitle>Resultados do Mata-Mata</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Complete primeiro a fase de grupos para liberar o mata-mata.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
