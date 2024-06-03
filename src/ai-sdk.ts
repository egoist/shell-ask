import process from "node:process"
import { createOpenAI } from "@ai-sdk/openai"
import { createOllama } from "ollama-ai-provider"
import { Config } from "./config"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { CliError } from "./error"

const missingConfigError = (
  type: "openai" | "anthropic" | "gemini" | "groq"
) => {
  return new CliError(
    `missing ${type} api key, check out the config docs for more: https://github.com/egoist/shell-ask/blob/main/docs/config.md`
  )
}

export const getSDKModel = (modelId: string, config: Config) => {
  if (modelId.startsWith("ollama-")) {
    return createOllama()
  }

  if (modelId.startsWith("claude-")) {
    const apiKey = config.anthropic_api_key || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw missingConfigError("anthropic")
    }

    return createAnthropic({
      apiKey,
    })
  }

  if (modelId.startsWith("gemini-")) {
    const apiKey = config.gemini_api_key || process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw missingConfigError("gemini")
    }
    const apiUrl =
      config.gemini_api_url ||
      process.env.GEMINI_API_URL ||
      "https://generativelanguage.googleapis.com/v1beta/models"
    return createGoogleGenerativeAI({
      apiKey,
      baseURL: apiUrl,
    })
  }

  if (modelId.startsWith("groq-")) {
    const apiKey = config.groq_api_key || process.env.GROQ_API_KEY
    if (!apiKey) {
      throw missingConfigError("groq")
    }

    return createOpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
  }

  const apiKey = config.openai_api_key || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw missingConfigError("openai")
  }

  const apiUrl = config.openai_api_url || process.env.OPENAI_API_URL

  return createOpenAI({
    apiKey,
    baseURL: apiUrl,
  })
}
