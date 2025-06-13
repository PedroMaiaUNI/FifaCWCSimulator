"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Eye } from "lucide-react"
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
import { PredictionAnalysis } from "@/components/prediction-analysis"
import type { Prediction } from "@/lib/types"

export function PredictionsManager() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = () => {
    const savedPredictions = localStorage.getItem("predictions")
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions))
    }
  }

  const deletePrediction = (id: string) => {
    const updatedPredictions = predictions.filter((prediction) => prediction.id !== id)
    localStorage.setItem("predictions", JSON.stringify(updatedPredictions))
    setPredictions(updatedPredictions)

    setMessage({
      text: "Palpite excluído com sucesso.",
      type: "success",
    })

    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const deleteAllPredictions = () => {
    localStorage.setItem("predictions", JSON.stringify([]))
    setPredictions([])

    setMessage({
      text: "Todos os palpites foram excluídos com sucesso.",
      type: "success",
    })

    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  if (selectedPrediction) {
    return <PredictionAnalysis prediction={selectedPrediction} onBack={() => setSelectedPrediction(null)} />
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
          <CardTitle>Gerenciar Palpites</CardTitle>
          {predictions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir Todos</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir todos os palpites?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá excluir permanentemente todos os palpites depositados. Esta ação não pode ser
                    desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllPredictions} className="bg-red-600 hover:bg-red-700">
                    Excluir Todos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum palpite depositado ainda.</p>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <h3 className="font-semibold">{prediction.playerName}</h3>
                    <p className="text-sm text-gray-600">
                      Enviado em {new Date(prediction.timestamp).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrediction(prediction)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir palpite?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá excluir permanentemente o palpite de {prediction.playerName}. Esta ação não
                            pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePrediction(prediction.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
