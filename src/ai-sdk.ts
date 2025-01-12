import process from "node:process"
import { createOpenAI } from "@ai-sdk/openai"
import { createOllama } from "ollama-ai-provider"
import { Config } from "./config"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { CliError } from "./error"
import { copilot } from "./copilot"
import { getOllamaBaseURL } from "./ollama"

const missingConfigError = (
  type: "openai" | "anthropic" | "gemini" | "groq"
) => {
  return new CliError(
    `missing ${type} api key, check out the config docs for more: https://github.com/egoist/shell-ask/blob/main/docs/config.md`
  )
}

export const getSDKModel = async (modelId: string, config: Config) => {
  if (modelId.startsWith("ollama-")) {
    return createOllama({
      baseURL: getOllamaBaseURL(config),
    })
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
      "https://generativelanguage.googleapis.com/v1beta/"
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

    const apiUrl =
      config.groq_api_url ||
      process.env.GROQ_API_URL ||
      "https://api.groq.com/openai/v1"

    return createOpenAI({
      apiKey,
      baseURL: apiUrl,
    })
  }

  if (modelId.startsWith("copilot-")) {
    const apiKey = await getCopilotApiKey()
    return createOpenAI({
      apiKey,
      baseURL: `https://api.githubcopilot.com`,
      headers: {
        "editor-version": "vscode/0.1.0",
        "copilot-integration-id": "vscode-chat",
      },
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

export const getCopilotApiKey = async () => {
  const authToken = process.env.COPILOT_AUTH_TOKEN || copilot.loadAuthToken()

  if (!authToken) {
    throw new CliError(
      `failed to get auth token, please login with 'ask copilot-login' first`
    )
  }

  const result = await copilot.getCopilotToken(authToken)
  return result.token
}
