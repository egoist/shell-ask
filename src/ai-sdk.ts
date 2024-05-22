import { createOpenAI } from "@ai-sdk/openai"
import { createOllama } from "ollama-ai-provider"
import { Config } from "./config"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { CliError } from "./error"

const missingConfigError = (type: "openai" | "anthropic" | "gemini") => {
  return new CliError(
    `missing ${type} api key, check out the config docs for more: https://github.com/egoist/shell-ask/blob/main/docs/config.md`
  )
}

export const getSDKModel = (modelId: string, config: Config) => {
  if (modelId.startsWith("ollama-")) {
    return createOllama()
  }

  if (modelId.startsWith("claude-")) {
    if (!config.anthropic_api_key) {
      throw missingConfigError("anthropic")
    }

    return createAnthropic({
      apiKey: config.anthropic_api_key,
    })
  }

  if (modelId.startsWith("gemini-")) {
    if (!config.gemini_api_key) {
      throw missingConfigError("gemini")
    }
    return createGoogleGenerativeAI({
      apiKey: config.gemini_api_key,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/models",
    })
  }

  if (!config.openai_api_key) {
    throw missingConfigError("openai")
  }

  return createOpenAI({
    apiKey: config.openai_api_key,
    baseURL: config.openai_api_url,
  })
}
