import { ModelInfo } from "./models"

export async function getOllamaModels() {
  const models: ModelInfo[] = await fetch(`http://127.0.0.1:11434/api/tags`)
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
