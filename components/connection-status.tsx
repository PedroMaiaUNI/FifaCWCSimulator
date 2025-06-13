"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase-client"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    async function checkConnection() {
      try {
        // Tenta fazer uma consulta simples para verificar a conexão
        const { data, error } = await supabase.from("tournament_results").select("id").limit(1)

        if (error) {
          console.error("Erro de conexão com Supabase:", error)
          setStatus("error")
          setErrorMessage(error.message)
        } else {
          setStatus("connected")
        }
      } catch (err) {
        console.error("Erro ao verificar conexão:", err)
        setStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido")
      }
    }

    checkConnection()
  }, [])

  if (status === "checking") {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
        Verificando conexão...
      </Badge>
    )
  }

  if (status === "error") {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-800" title={errorMessage}>
        Erro de conexão
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-green-50 text-green-800">
      Conectado ao banco de dados
    </Badge>
  )
}
