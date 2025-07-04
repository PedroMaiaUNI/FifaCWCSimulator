"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, BarChart3, Shield } from "lucide-react"
import { PredictionForm } from "@/components/prediction-form-simple"
import { AdminPanel } from "@/components/admin-panel-secure"
import { Leaderboard } from "@/components/leaderboard-simple"
import { PredictionsClosed } from "@/components/predictions-closed"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("predictions")
  const [showAdminTab, setShowAdminTab] = useState(false)

  // Controle para fechar os palpites
  // Defina como true para fechar os palpites, false para manter abertos
  const [predictionsOpen, setPredictionsOpen] = useState(false) // Mudei para false para fechar os palpites

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Obter a combinação de teclas da variável de ambiente
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'fail'

      // Parse da combinação de teclas
      const keys = adminKey.toLowerCase().split("+")
      const needsCtrl = keys.includes("ctrl")
      const needsShift = keys.includes("shift")
      const needsAlt = keys.includes("alt")
      const mainKey = keys.find((key) => !["ctrl", "shift", "alt"].includes(key)) || "a"

      // Verificar se a combinação foi pressionada
      const ctrlPressed = needsCtrl ? e.ctrlKey : !e.ctrlKey
      const shiftPressed = needsShift ? e.shiftKey : !e.shiftKey
      const altPressed = needsAlt ? e.altKey : !e.altKey
      const keyPressed = e.key.toLowerCase() === mainKey

      if (ctrlPressed && shiftPressed && altPressed && keyPressed) {
        setShowAdminTab(true)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  // Se os palpites estão fechados e o usuário está na aba de palpites, redirecionar para leaderboard
  useEffect(() => {
    if (!predictionsOpen && activeTab === "predictions") {
      setActiveTab("leaderboard")
    }
  }, [predictionsOpen, activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">Mundial de Clubes FIFA</h1>
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-lg text-gray-600">Simulador de Palpites - 2025</p>
          {!predictionsOpen && (
            <p className="text-sm text-amber-600 font-medium mt-2">⚠️ Período de palpites encerrado</p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full mb-8 ${showAdminTab ? (predictionsOpen ? "grid-cols-3" : "grid-cols-2") : predictionsOpen ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {predictionsOpen && (
              <TabsTrigger value="predictions" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Fazer Palpites
              </TabsTrigger>
            )}
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            {showAdminTab && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Painel Admin
              </TabsTrigger>
            )}
          </TabsList>

          {predictionsOpen && (
            <TabsContent value="predictions">
              <PredictionForm />
            </TabsContent>
          )}

          <TabsContent value="leaderboard">
            {!predictionsOpen && activeTab === "leaderboard" && (
              <div className="mb-6">
                <PredictionsClosed />
              </div>
            )}
            <Leaderboard />
          </TabsContent>

          {showAdminTab && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
