import { getOllamaModels } from "./ollama"

export type ModelInfo = { id: string; realId?: string }

export const MODEL_MAP: {
  [prefix: string]: ModelInfo[]
} = {
  gpt: [
    {
      id: "gpt-3.5-turbo",
    },
    {
      id: "gpt-4-turbo",
    },
    {
      id: "gpt-4o",
    },
  ],
  claude: [
    {
      id: "claude-3-haiku",
      realId: "claude-3-haiku-20240307",
    },
    {
      id: "claude-3-sonnet",
      realId: "claude-3-sonnet-20240229",
    },
    {
      id: "claude-3-opus",
      realId: "claude-3-opus-20240229",
    },
  ],
  gemini: [
    {
      id: "gemini-1.5-pro",
      realId: "gemini-1.5-pro-latest",
    },
    {
      id: "gemini-1.5-flash",
      realId: "gemini-1.5-flash-latest",
    },
    {
      id: "gemini-pro",
    },
  ],
}

export const MODELS = Object.values(MODEL_MAP).flat()

export const MODEL_PREFIXES = Object.keys(MODEL_MAP)

export async function getAllModels(includeOllama?: boolean | "required") {
  let models = [...MODELS]

  if (includeOllama) {
    const ollamaModels = await getOllamaModels()
    if (ollamaModels.length === 0 && includeOllama === "required") {
      throw new Error("no Ollama models available")
    }
    models = [...models, ...ollamaModels]
  }

  return models
}
