"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Trash2, AlertTriangle } from "lucide-react"
import { GROUPS } from "@/lib/tournament-data"
import { TeamCard } from "@/components/team-card"
import { MatchPrediction } from "@/components/match-prediction"
import { storageService } from "@/lib/storage-service"
import type { Prediction, KnockoutMatch } from "@/lib/types"

interface PredictionFormProps {
  predictionsOpen?: boolean
}

export function PredictionForm({ predictionsOpen = true }: PredictionFormProps) {
  const [playerName, setPlayerName] = useState("")
  const [groupPredictions, setGroupPredictions] = useState<Record<string, string[]>>({})
  const [knockoutPredictions, setKnockoutPredictions] = useState<Record<string, KnockoutMatch>>({})
  const [currentPhase, setCurrentPhase] = useState<"groups" | "knockout">("groups")
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize group predictions
  useEffect(() => {
    const initialGroups: Record<string, string[]> = {}
    Object.keys(GROUPS).forEach((group) => {
      initialGroups[group] = []
    })
    setGroupPredictions(initialGroups)
  }, [])

  // Se os palpites estão fechados, mostrar aviso
  const renderClosedPredictionsMessage = () => {
    if (!predictionsOpen) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <CardTitle className="text-2xl text-red-800">Palpites Encerrados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-700 mb-4">
              O período para envio de palpites foi encerrado. Não é mais possível submeter novos palpites.
            </p>
            <p className="text-gray-600">Acesse o leaderboard para acompanhar os resultados e sua pontuação.</p>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  const handleGroupPrediction = (group: string, team: string) => {
    const current = groupPredictions[group] || []

    if (current.includes(team)) {
      // Remove team if already selected
      setGroupPredictions((prev) => ({
        ...prev,
        [group]: current.filter((t) => t !== team),
      }))
    } else if (current.length < 2) {
      // Add team if less than 2 selected
      setGroupPredictions((prev) => ({
        ...prev,
        [group]: [...current, team],
      }))
    } else {
      // Replace second place if 2 already selected
      setGroupPredictions((prev) => ({
        ...prev,
        [group]: [current[0], team],
      }))
    }
  }

  const handleKnockoutPrediction = (matchId: string, match: KnockoutMatch) => {
    setKnockoutPredictions((prev) => ({
      ...prev,
      [matchId]: match,
    }))
  }

  const isGroupPhaseComplete = () => {
    return Object.values(groupPredictions).every((qualified) => qualified.length === 2)
  }

  const generateAllKnockoutMatches = () => {
    if (!isGroupPhaseComplete()) return {}

    const matches: Record<string, { team1: string; team2: string; phase: string }> = {}

    // Round of 16
    matches["r16_1"] = { team1: groupPredictions["A"][0], team2: groupPredictions["B"][1], phase: "Oitavas" }
    matches["r16_2"] = { team1: groupPredictions["C"][0], team2: groupPredictions["D"][1], phase: "Oitavas" }
    matches["r16_3"] = { team1: groupPredictions["E"][0], team2: groupPredictions["F"][1], phase: "Oitavas" }
    matches["r16_4"] = { team1: groupPredictions["G"][0], team2: groupPredictions["H"][1], phase: "Oitavas" }
    matches["r16_5"] = { team1: groupPredictions["A"][1], team2: groupPredictions["B"][0], phase: "Oitavas" }
    matches["r16_6"] = { team1: groupPredictions["C"][1], team2: groupPredictions["D"][0], phase: "Oitavas" }
    matches["r16_7"] = { team1: groupPredictions["E"][1], team2: groupPredictions["F"][0], phase: "Oitavas" }
    matches["r16_8"] = { team1: groupPredictions["G"][1], team2: groupPredictions["H"][0], phase: "Oitavas" }

    // Quarter Finals
    if (knockoutPredictions["r16_1"]?.winner && knockoutPredictions["r16_2"]?.winner) {
      matches["qf_1"] = {
        team1: knockoutPredictions["r16_1"].winner,
        team2: knockoutPredictions["r16_2"].winner,
        phase: "Quartas",
      }
    }
    if (knockoutPredictions["r16_3"]?.winner && knockoutPredictions["r16_4"]?.winner) {
      matches["qf_2"] = {
        team1: knockoutPredictions["r16_3"].winner,
        team2: knockoutPredictions["r16_4"].winner,
        phase: "Quartas",
      }
    }
    if (knockoutPredictions["r16_5"]?.winner && knockoutPredictions["r16_6"]?.winner) {
      matches["qf_3"] = {
        team1: knockoutPredictions["r16_5"].winner,
        team2: knockoutPredictions["r16_6"].winner,
        phase: "Quartas",
      }
    }
    if (knockoutPredictions["r16_7"]?.winner && knockoutPredictions["r16_8"]?.winner) {
      matches["qf_4"] = {
        team1: knockoutPredictions["r16_7"].winner,
        team2: knockoutPredictions["r16_8"].winner,
        phase: "Quartas",
      }
    }

    // Semi Finals
    if (knockoutPredictions["qf_1"]?.winner && knockoutPredictions["qf_2"]?.winner) {
      matches["sf_1"] = {
        team1: knockoutPredictions["qf_1"].winner,
        team2: knockoutPredictions["qf_2"].winner,
        phase: "Semifinais",
      }
    }
    if (knockoutPredictions["qf_3"]?.winner && knockoutPredictions["qf_4"]?.winner) {
      matches["sf_2"] = {
        team1: knockoutPredictions["qf_3"].winner,
        team2: knockoutPredictions["qf_4"].winner,
        phase: "Semifinais",
      }
    }

    // Third Place
    if (knockoutPredictions["sf_1"] && knockoutPredictions["sf_2"]) {
      const sf1Loser =
        knockoutPredictions["sf_1"].winner === knockoutPredictions["sf_1"].team1
          ? knockoutPredictions["sf_1"].team2
          : knockoutPredictions["sf_1"].team1
      const sf2Loser =
        knockoutPredictions["sf_2"].winner === knockoutPredictions["sf_2"].team1
          ? knockoutPredictions["sf_2"].team2
          : knockoutPredictions["sf_2"].team1

      if (sf1Loser && sf2Loser) {
        matches["third"] = {
          team1: sf1Loser,
          team2: sf2Loser,
          phase: "3º Lugar",
        }
      }
    }

    // Final
    if (knockoutPredictions["sf_1"]?.winner && knockoutPredictions["sf_2"]?.winner) {
      matches["final"] = {
        team1: knockoutPredictions["sf_1"].winner,
        team2: knockoutPredictions["sf_2"].winner,
        phase: "Final",
      }
    }

    return matches
  }

  const isKnockoutComplete = () => {
    const allMatches = generateAllKnockoutMatches()
    const requiredMatches = [
      "r16_1",
      "r16_2",
      "r16_3",
      "r16_4",
      "r16_5",
      "r16_6",
      "r16_7",
      "r16_8",
      "qf_1",
      "qf_2",
      "qf_3",
      "qf_4",
      "sf_1",
      "sf_2",
      "third",
      "final",
    ]

    return requiredMatches.every(
      (matchId) => knockoutPredictions[matchId]?.winner && knockoutPredictions[matchId]?.winner !== "",
    )
  }

  const submitPrediction = async () => {
    if (!playerName.trim()) {
      setMessage({
        text: "Por favor, insira seu nome antes de submeter o palpite.",
        type: "error",
      })
      return
    }

    if (!isGroupPhaseComplete()) {
      setMessage({
        text: "Por favor, complete todos os palpites da fase de grupos.",
        type: "error",
      })
      return
    }

    if (!isKnockoutComplete()) {
      setMessage({
        text: "Por favor, complete todos os palpites do mata-mata até a final.",
        type: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const prediction: Prediction = {
        id: Date.now().toString(),
        playerName: playerName.trim(),
        groupPredictions,
        knockoutPredictions,
        timestamp: new Date().toISOString(),
        score: 0,
      }

      console.log("Enviando palpite:", prediction)

      // Salvar usando o serviço de armazenamento
      await storageService.savePrediction(prediction)

      setMessage({
        text: `Palpite de ${playerName} foi salvo com sucesso!`,
        type: "success",
      })

      // Reset form
      resetForm()

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setMessage({
        text: `Erro ao salvar palpite: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setPlayerName("")

    // Reset group predictions
    const initialGroups: Record<string, string[]> = {}
    Object.keys(GROUPS).forEach((group) => {
      initialGroups[group] = []
    })
    setGroupPredictions(initialGroups)

    // Reset knockout predictions
    setKnockoutPredictions({})

    // Reset to groups phase
    setCurrentPhase("groups")
  }

  const getTeamSelectionType = (group: string, team: string): "first" | "second" | null => {
    const qualified = groupPredictions[group] || []
    const index = qualified.indexOf(team)
    if (index === 0) return "first"
    if (index === 1) return "second"
    return null
  }

  const hasMadePredictions = () => {
    // Check if any groups have selections
    const hasGroupSelections = Object.values(groupPredictions).some((group) => group.length > 0)

    // Check if any knockout matches have predictions
    const hasKnockoutPredictions = Object.keys(knockoutPredictions).length > 0

    return hasGroupSelections || hasKnockoutPredictions || playerName.trim() !== ""
  }

  return (
    <div className="space-y-6">
      {renderClosedPredictionsMessage()}

      {predictionsOpen && (
        <div>
      {message && (
        <div
          className={`p-4 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informações do Palpiteiro</CardTitle>
          {hasMadePredictions() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  <span>Resetar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetar palpite?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá limpar todos os seus palpites atuais. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={resetForm}>Resetar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="playerName">Nome do Palpiteiro</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>
        </CardContent>
      </Card>

      {currentPhase === "groups" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Fase de Grupos</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                1º Lugar
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                2º Lugar
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(GROUPS).map(([group, teams]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="text-center">Grupo {group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {teams.map((team) => (
                      <TeamCard
                        key={team}
                        team={team}
                        isSelected={groupPredictions[group]?.includes(team)}
                        selectionType={getTeamSelectionType(group, team)}
                        onClick={() => handleGroupPrediction(group, team)}
                      />
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    Selecionados: {groupPredictions[group]?.length || 0}/2
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isGroupPhaseComplete() && (
            <div className="text-center">
              <Button onClick={() => setCurrentPhase("knockout")} size="lg">
                Continuar para o Mata-Mata
              </Button>
            </div>
          )}
        </div>
      )}

      {currentPhase === "knockout" && isGroupPhaseComplete() && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Mata-Mata</h2>
            <Button variant="outline" onClick={() => setCurrentPhase("groups")}>
              Voltar para Grupos
            </Button>
          </div>

          <div className="space-y-8">
            {/* Render all knockout phases */}
            {Object.entries(
              Object.entries(generateAllKnockoutMatches()).reduce(
                (acc, [matchId, match]) => {
                  const phase = match.phase
                  if (!acc[phase]) acc[phase] = []
                  acc[phase].push([matchId, match])
                  return acc
                },
                {} as Record<string, Array<[string, { team1: string; team2: string; phase: string }]>>,
              ),
            ).map(([phase, matches]) => (
              <div key={phase}>
                <h3 className="text-xl font-semibold mb-4">{phase}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map(([matchId, match]) => (
                    <MatchPrediction
                      key={matchId}
                      matchId={matchId}
                      team1={match.team1}
                      team2={match.team2}
                      prediction={knockoutPredictions[matchId]}
                      onPredictionChange={(prediction) => handleKnockoutPrediction(matchId, prediction)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={submitPrediction}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              disabled={!isKnockoutComplete() || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : isKnockoutComplete() ? "Submeter Palpite" : "Complete todos os jogos"}
            </Button>
          </div>
          </div>
          )}
        </div>
      )}
    </div>
  )
}

