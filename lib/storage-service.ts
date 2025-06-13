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

    // Verificar se já existe um palpite com o mesmo ID
    const existingIndex = predictions.findIndex((p) => p.id === prediction.id)

    if (existingIndex >= 0) {
      // Atualizar palpite existente
      predictions[existingIndex] = prediction
    } else {
      // Adicionar novo palpite
      predictions.push(prediction)
    }

    localStorage.setItem("predictions", JSON.stringify(predictions))
    console.log("Palpite salvo no localStorage:", prediction)
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
    if (!supabase) {
      console.warn("Supabase client not initialized, falling back to localStorage")
      return new LocalStorageService().getPredictions()
    }

    try {
      const { data, error } = await supabase.from("predictions").select("*").order("timestamp", { ascending: false })

      if (error) {
        console.error("Erro ao buscar palpites:", error)
        throw new Error(error.message)
      }

      // Converter os dados do formato do Supabase para o formato da aplicação
      const predictions: Prediction[] =
        data?.map((item) => ({
          id: item.id,
          playerName: item.player_name,
          groupPredictions: item.group_predictions,
          knockoutPredictions: item.knockout_predictions,
          timestamp: item.timestamp,
          score: item.score || 0,
        })) || []

      console.log("Palpites recuperados do Supabase:", predictions)
      return predictions
    } catch (error) {
      console.error("Erro ao buscar palpites do Supabase, usando localStorage:", error)
      return new LocalStorageService().getPredictions()
    }
  }

  async savePrediction(prediction: Prediction): Promise<void> {
    if (!supabase) {
      console.warn("Supabase client not initialized, falling back to localStorage")
      return new LocalStorageService().savePrediction(prediction)
    }

    try {
      console.log("Salvando palpite no Supabase:", prediction)

      // Verificar se o palpite já existe
      const { data: existingData, error: checkError } = await supabase
        .from("predictions")
        .select("id")
        .eq("id", prediction.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Erro ao verificar palpite existente:", checkError)
      }

      // Preparar os dados no formato esperado pelo Supabase
      const predictionData = {
        id: prediction.id,
        player_name: prediction.playerName,
        group_predictions: prediction.groupPredictions,
        knockout_predictions: prediction.knockoutPredictions,
        timestamp: prediction.timestamp,
        score: prediction.score || 0,
      }

      let error

      if (existingData) {
        // Atualizar palpite existente
        const { error: updateError } = await supabase.from("predictions").update(predictionData).eq("id", prediction.id)

        error = updateError
      } else {
        // Inserir novo palpite
        const { error: insertError } = await supabase.from("predictions").insert(predictionData)

        error = insertError
      }

      if (error) {
        console.error("Erro ao salvar palpite:", error)
        throw new Error(error.message)
      }

      console.log("Palpite salvo com sucesso no Supabase")
    } catch (error) {
      console.error("Erro ao salvar palpite no Supabase, usando localStorage:", error)
      return new LocalStorageService().savePrediction(prediction)
    }
  }

  async deletePrediction(id: string): Promise<void> {
    if (!supabase) {
      console.warn("Supabase client not initialized, falling back to localStorage")
      return new LocalStorageService().deletePrediction(id)
    }

    try {
      const { error } = await supabase.from("predictions").delete().eq("id", id)

      if (error) {
        console.error("Erro ao excluir palpite:", error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Erro ao excluir palpite do Supabase, usando localStorage:", error)
      return new LocalStorageService().deletePrediction(id)
    }
  }

  async deleteAllPredictions(): Promise<void> {
    if (!supabase) {
      console.warn("Supabase client not initialized, falling back to localStorage")
      return new LocalStorageService().deleteAllPredictions()
    }

    try {
      const { error } = await supabase.from("predictions").delete().neq("id", "placeholder") // Deleta todos os registros

      if (error) {
        console.error("Erro ao excluir todos os palpites:", error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Erro ao excluir todos os palpites do Supabase, usando localStorage:", error)
      return new LocalStorageService().deleteAllPredictions()
    }
  }

  async getResults(): Promise<TournamentResults | null> {
    if (!supabase) {
      console.warn("Supabase client not initialized, falling back to localStorage")
      return new LocalStorageService().getResults()
    }

    try {
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

      // Converter os dados do formato do Supabase para o formato da aplicação
      return {
        groupResults: data.group_results || {},
        knockoutResults: data.knockout_results || {},
        currentPhase: data.current_phase || "groups",
      }
    } catch (error) {
      console.error("Erro ao buscar resultados do Supabase, usando localStorage:", error)
      return new LocalStorageService().getResults()
    }
  }

  async saveResults(results: TournamentResults): Promise<void> {
    if (!supabase) {
      console.warn("Supabase client not initialized, falling back to localStorage")
      return new LocalStorageService().saveResults(results)
    }

    try {
      // Primeiro, verificar se o registro existe
      const { data, error: checkError } = await supabase
        .from("tournament_results")
        .select("id")
        .eq("id", "current")
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Erro ao verificar resultados:", checkError)
        throw new Error(checkError.message)
      }

      // Preparar os dados no formato esperado pelo Supabase
      const resultsData = {
        id: "current",
        group_results: results.groupResults || {},
        knockout_results: results.knockoutResults || {},
        current_phase: results.currentPhase || "groups",
        updated_at: new Date().toISOString(),
      }

      // Se o registro não existe, criar; caso contrário, atualizar
      if (!data) {
        const { error: insertError } = await supabase.from("tournament_results").insert(resultsData)

        if (insertError) {
          console.error("Erro ao inserir resultados:", insertError)
          throw new Error(insertError.message)
        }
      } else {
        const { error: updateError } = await supabase.from("tournament_results").update(resultsData).eq("id", "current")

        if (updateError) {
          console.error("Erro ao atualizar resultados:", updateError)
          throw new Error(updateError.message)
        }
      }
    } catch (error) {
      console.error("Erro ao salvar resultados no Supabase, usando localStorage:", error)
      return new LocalStorageService().saveResults(results)
    }
  }
}

// Função para determinar qual implementação usar
function getStorageService(): StorageService {
  // Verificar se estamos em ambiente de produção e se as variáveis do Supabase estão configuradas
  const isProduction = process.env.NODE_ENV === "production"
  const hasSupabaseConfig = !!supabase

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
