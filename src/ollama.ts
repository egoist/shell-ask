import { ModelInfo } from "./models"
import { loadConfig } from "./config"

export function getOllamaHost() {
  const config = loadConfig()
  const baseUrl = config.ollama_host || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
  return `${baseUrl}/api`
}

export async function getOllamaModels() {
  const ollamaHost = getOllamaHost()
  const models: ModelInfo[] = await fetch(`${ollamaHost}/tags`)
    .then((res) => {
      if (!res.ok) return []

      return res.json().then((json) => {
        return json.models.map((m: { model: string }) => {
          return {
            id: `ollama-${m.model}`,
            realId: m.model.replace(":latest", ""),
          }
        })
      })
    })
    .catch(() => {
      return []
    })

  return models
}
