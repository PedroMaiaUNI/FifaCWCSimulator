/**
 * Serviço de armazenamento que abstrai o acesso aos dados
 * Implementação com Supabase para persistência em produção
 */

import type { Prediction, TournamentResults } from "@/lib/types"
import { supabase } from "@/lib/supabase-client"

// Interface para o serviço de armazenamento
export interface StorageService {
  // Palpites
  getPredictions(): Promise<Prediction[]>
  savePrediction(prediction: Prediction): Promise<void>
  deletePrediction(id: string): Promise<void>
  deleteAllPredictions(): Promise<void>

  // Resultados do torneio
  getResults(): Promise<TournamentResults | null>
  saveResults(results: TournamentResults): Promise<void>
}

// Implementação usando localStorage (para desenvolvimento local)
class LocalStorageService implements StorageService {
  async getPredictions(): Promise<Prediction[]> {
    if (typeof window === "undefined") return []

    const predictions = localStorage.getItem("predictions")
    return predictions ? JSON.parse(predictions) : []
  }

  async savePrediction(prediction: Prediction): Promise<void> {
    if (typeof window === "undefined") return

    const predictions = await this.getPredictions()
    predictions.push(prediction)
    localStorage.setItem("predictions", JSON.stringify(predictions))
  }

  async deletePrediction(id: string): Promise<void> {
    if (typeof window === "undefined") return

    const predictions = await this.getPredictions()
    const updatedPredictions = predictions.filter((p) => p.id !== id)
    localStorage.setItem("predictions", JSON.stringify(updatedPredictions))
  }

  async deleteAllPredictions(): Promise<void> {
    if (typeof window === "undefined") return

    localStorage.setItem("predictions", JSON.stringify([]))
  }

  async getResults(): Promise<TournamentResults | null> {
    if (typeof window === "undefined") return null

    const results = localStorage.getItem("tournamentResults")
    return results ? JSON.parse(results) : null
  }

  async saveResults(results: TournamentResults): Promise<void> {
    if (typeof window === "undefined") return

    localStorage.setItem("tournamentResults", JSON.stringify(results))
  }
}

// Implementação usando Supabase (para produção)
class SupabaseStorageService implements StorageService {
  async getPredictions(): Promise<Prediction[]> {
    const { data, error } = await supabase.from("predictions").select("*").order("timestamp", { ascending: false })

    if (error) {
      console.error("Erro ao buscar palpites:", error)
      throw new Error(error.message)
    }

    return data || []
  }

  async savePrediction(prediction: Prediction): Promise<void> {
    const { error } = await supabase.from("predictions").insert({
      id: prediction.id,
      player_name: prediction.playerName,
      group_predictions: prediction.groupPredictions,
      knockout_predictions: prediction.knockoutPredictions,
      timestamp: prediction.timestamp,
      score: prediction.score,
    })

    if (error) {
      console.error("Erro ao salvar palpite:", error)
      throw new Error(error.message)
    }
  }

  async deletePrediction(id: string): Promise<void> {
    const { error } = await supabase.from("predictions").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir palpite:", error)
      throw new Error(error.message)
    }
  }

  async deleteAllPredictions(): Promise<void> {
    const { error } = await supabase.from("predictions").delete().neq("id", "placeholder") // Deleta todos os registros

    if (error) {
      console.error("Erro ao excluir todos os palpites:", error)
      throw new Error(error.message)
    }
  }

  async getResults(): Promise<TournamentResults | null> {
    const { data, error } = await supabase.from("tournament_results").select("*").eq("id", "current").single()

    if (error) {
      if (error.code === "PGRST116") {
        // Erro quando não encontra resultados
        return null
      }
      console.error("Erro ao buscar resultados:", error)
      throw new Error(error.message)
    }

    if (!data) return null

    return {
      groupResults: data.group_results,
      knockoutResults: data.knockout_results,
      currentPhase: data.current_phase,
    }
  }

  async saveResults(results: TournamentResults): Promise<void> {
    const { error } = await supabase
      .from("tournament_results")
      .update({
        group_results: results.groupResults,
        knockout_results: results.knockoutResults,
        current_phase: results.currentPhase,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "current")

    if (error) {
      console.error("Erro ao salvar resultados:", error)
      throw new Error(error.message)
    }
  }
}

// Função para determinar qual implementação usar
function getStorageService(): StorageService {
  // Verificar se estamos em ambiente de produção e se as variáveis do Supabase estão configuradas
  const isProduction = process.env.NODE_ENV === "production"
  const hasSupabaseConfig = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Usar Supabase em produção se configurado, caso contrário usar localStorage
  if (isProduction && hasSupabaseConfig) {
    console.log("Usando Supabase para armazenamento")
    return new SupabaseStorageService()
  } else {
    console.log("Usando localStorage para armazenamento")
    return new LocalStorageService()
  }
}

// Exporta o serviço de armazenamento apropriado
export const storageService: StorageService = getStorageService()
