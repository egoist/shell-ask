import { CliError } from "./error"
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
    {
      id: "claude-3.5-sonnet",
      realId: "claude-3-5-sonnet-20240620",
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
  groq: [
    {
      id: "groq-llama3",
      realId: "groq-llama3-70b-8192",
    },
    {
      id: "groq-llama3-8b",
      realId: "groq-llama3-8b-8192",
    },
    {
      id: "groq-llama3-70b",
      realId: "groq-llama3-70b-8192",
    },
    {
      id: "groq-mixtral-8x7b",
      realId: "groq-mixtral-8x7b-32768",
    },
    {
      id: "groq-gemma",
      realId: "groq-gemma-7b-it",
    },
    {
      id: "groq-gemma-7b",
      realId: "groq-gemma-7b-it",
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
      throw new CliError("no Ollama models available")
    }
    models = [...models, ...ollamaModels]
  }

  return models
}

export function getCheapModelId(modelId: string) {
  if (modelId.startsWith("gpt-")) return "gpt-3.5-turbo"

  if (modelId.startsWith("claude-")) return "claude-3-haiku-20240307"

  if (modelId.startsWith("gemini-")) return "gemini-pro"

  if (modelId.startsWith("groq-")) return "groq-llama3-8b-8192"

  return modelId
}

export function toProviderModelId(modelId: string) {
  if (modelId.startsWith("groq-")) {
    return modelId.replace("groq-", "")
  }
  return modelId
}
