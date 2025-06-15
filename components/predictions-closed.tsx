"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, Trophy } from "lucide-react"

export function PredictionsClosed() {
  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <CardTitle className="text-2xl text-amber-800">Período de Palpites Encerrado</CardTitle>
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-amber-700">
            <Clock className="h-5 w-5" />
            <p className="text-lg font-medium">O prazo para envio de palpites foi encerrado</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-amber-200">
            <p className="text-gray-700 mb-4">
              O período para submissão de novos palpites para o Mundial de Clubes FIFA 2025 foi oficialmente encerrado.
            </p>
            <p className="text-gray-700 mb-4">
              Agora você pode acompanhar os resultados em tempo real e ver como seus palpites se saem no leaderboard!
            </p>
            <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
              <Trophy className="h-5 w-5" />
              <span>Boa sorte a todos os participantes!</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>• Você ainda pode visualizar o leaderboard e acompanhar sua pontuação</p>
            <p>• Os resultados serão atualizados conforme os jogos acontecem</p>
            <p>• A análise detalhada dos palpites continua disponível</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">O que fazer agora?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800 mb-2">Acompanhe o Leaderboard</h3>
              <p className="text-sm text-blue-700">Veja sua posição no ranking e acompanhe a pontuação em tempo real</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 mb-2">Aguarde os Resultados</h3>
              <p className="text-sm text-green-700">Os resultados dos jogos serão atualizados conforme acontecem</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
