"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { TeamCard } from "@/components/team-card"
import type { KnockoutMatch } from "@/lib/types"

interface MatchPredictionProps {
  matchId: string
  team1: string
  team2: string
  prediction?: KnockoutMatch
  onPredictionChange: (prediction: KnockoutMatch) => void
}

export function MatchPrediction({ matchId, team1, team2, prediction, onPredictionChange }: MatchPredictionProps) {
  const [regularTime1, setRegularTime1] = useState(prediction?.regularTime1?.toString() || "")
  const [regularTime2, setRegularTime2] = useState(prediction?.regularTime2?.toString() || "")
  const [wentToExtraTime, setWentToExtraTime] = useState(prediction?.wentToExtraTime || false)
  const [penaltyWinner, setPenaltyWinner] = useState(prediction?.penaltyWinner || "")
  const [score1Confirmed, setScore1Confirmed] = useState(!!prediction?.regularTime1)
  const [score2Confirmed, setScore2Confirmed] = useState(!!prediction?.regularTime2)

  const handleScoreInput = (value: string) => {
    // Only allow non-negative numbers
    const cleanValue = value.replace(/[^0-9]/g, "")
    return cleanValue
  }

  const updatePrediction = () => {
    // Only calculate if both scores are confirmed
    if (!score1Confirmed || !score2Confirmed || !regularTime1 || !regularTime2) return

    const rt1 = Number.parseInt(regularTime1)
    const rt2 = Number.parseInt(regularTime2)

    // Validate numbers
    if (isNaN(rt1) || isNaN(rt2) || rt1 < 0 || rt2 < 0) return

    const newPrediction: KnockoutMatch = {
      team1,
      team2,
      regularTime1: rt1,
      regularTime2: rt2,
      wentToExtraTime,
      penaltyWinner: penaltyWinner,
      winner: "",
    }

    // Determine winner
    if (rt1 === rt2) {
      // It's a tie - must go to extra time and penalties
      newPrediction.wentToExtraTime = true
      setWentToExtraTime(true)

      // Winner is determined by penalties
      if (penaltyWinner) {
        newPrediction.winner = penaltyWinner
      } else {
        newPrediction.winner = ""
      }
    } else {
      // Not a tie - winner is determined by score, but could still have gone to extra time
      if (rt1 > rt2) {
        newPrediction.winner = team1
      } else {
        newPrediction.winner = team2
      }

      // If went to extra time but not penalties
      if (wentToExtraTime) {
        newPrediction.penaltyWinner = ""
      }
    }

    onPredictionChange(newPrediction)
  }

  // Update prediction whenever confirmed scores, extra time or penalty winner changes
  useEffect(() => {
    updatePrediction()
  }, [score1Confirmed, score2Confirmed, wentToExtraTime, penaltyWinner])

  const isTied = () => {
    if (!score1Confirmed || !score2Confirmed || !regularTime1 || !regularTime2) return false
    const rt1 = Number.parseInt(regularTime1)
    const rt2 = Number.parseInt(regularTime2)
    if (isNaN(rt1) || isNaN(rt2)) return false
    return rt1 === rt2
  }

  const isScoreComplete = () => {
    return score1Confirmed && score2Confirmed && regularTime1 !== "" && regularTime2 !== ""
  }

  const handleScore1Change = (value: string) => {
    const cleanValue = handleScoreInput(value)
    setRegularTime1(cleanValue)
    setScore1Confirmed(false) // Reset confirmation when value changes
  }

  const handleScore2Change = (value: string) => {
    const cleanValue = handleScoreInput(value)
    setRegularTime2(cleanValue)
    setScore2Confirmed(false) // Reset confirmation when value changes
  }

  const handleScore1KeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && regularTime1 !== "") {
      setScore1Confirmed(true)
      e.preventDefault()
    }
  }

  const handleScore2KeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && regularTime2 !== "") {
      setScore2Confirmed(true)
      e.preventDefault()
    }
  }

  const handleScore1Blur = () => {
    if (regularTime1 !== "") {
      setScore1Confirmed(true)
    }
  }

  const handleScore2Blur = () => {
    if (regularTime2 !== "") {
      setScore2Confirmed(true)
    }
  }

  const toggleExtraTime = () => {
    setWentToExtraTime(!wentToExtraTime)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">
          {team1} vs {team2}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <TeamCard team={team1} size="sm" />
          <div className="text-2xl font-bold">VS</div>
          <TeamCard team={team2} size="sm" />
        </div>

        <Separator />

        {/* Regular Time */}
        <div>
          <Label className="text-sm font-medium">
            Placar Final <span className="text-xs text-gray-500">(pressione Enter para confirmar)</span>
          </Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={regularTime1}
                onChange={(e) => handleScore1Change(e.target.value)}
                onKeyDown={handleScore1KeyDown}
                onBlur={handleScore1Blur}
                placeholder="Gols"
                className={`text-center ${
                  score1Confirmed && regularTime1 ? "border-green-500 bg-green-50" : "border-gray-300"
                }`}
              />
              {score1Confirmed && regularTime1 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
            <span className="text-lg font-bold">-</span>
            <div className="flex-1 relative">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={regularTime2}
                onChange={(e) => handleScore2Change(e.target.value)}
                onKeyDown={handleScore2KeyDown}
                onBlur={handleScore2Blur}
                placeholder="Gols"
                className={`text-center ${
                  score2Confirmed && regularTime2 ? "border-green-500 bg-green-50" : "border-gray-300"
                }`}
              />
              {score2Confirmed && regularTime2 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {!score1Confirmed && regularTime1 && "Pressione Enter no primeiro placar"}
            {!score2Confirmed && regularTime2 && score1Confirmed && "Pressione Enter no segundo placar"}
            {score1Confirmed && score2Confirmed && "✓ Placares confirmados"}
          </div>
        </div>

        {/* Extra Time - now always available but forced when tied */}
        {isScoreComplete() && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${isTied() ? "bg-yellow-50" : "bg-gray-50"}`}>
            <Checkbox
              id={`extraTime-${matchId}`}
              checked={isTied() ? true : wentToExtraTime}
              disabled={isTied()}
              onCheckedChange={toggleExtraTime}
            />
            <Label
              htmlFor={`extraTime-${matchId}`}
              className={`text-sm font-medium ${isTied() ? "text-yellow-800" : "text-gray-800"}`}
            >
              {isTied() ? "Empate - vai para prorrogação e pênaltis" : "Jogo foi para prorrogação"}
            </Label>
          </div>
        )}

        {/* Penalties - only show when tied */}
        {isScoreComplete() && isTied() && (
          <div>
            <Label className="text-sm font-medium">Vencedor nos Pênaltis</Label>
            <Select
              value={penaltyWinner}
              onValueChange={(value) => {
                setPenaltyWinner(value)
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o vencedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={team1}>{team1}</SelectItem>
                <SelectItem value={team2}>{team2}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Winner Display */}
        {prediction?.winner && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-green-700">🏆 Vencedor:</span>
              <span className="text-lg font-bold text-green-800">{prediction.winner}</span>
            </div>
            {prediction.wentToExtraTime && !isTied() && (
              <div className="text-xs text-green-600 mt-1">Decidido na prorrogação</div>
            )}
            {prediction.wentToExtraTime && isTied() && (
              <div className="text-xs text-green-600 mt-1">Decidido nos pênaltis</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
