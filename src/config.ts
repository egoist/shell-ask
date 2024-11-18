import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { z } from "zod"

export const configDirPath = path.join(os.homedir(), ".config", "shell-ask")
export const configFilePath = path.join(configDirPath, "config.json")

const AICommandVariableSchema = z.union([
  z.string().describe("a shell command to run"),
  z
    .object({
      type: z.literal("input"),
      message: z.string(),
    })
    .describe("get text input from the user"),
  z
    .object({
      type: z.literal("select"),
      message: z.string(),
      choices: z.array(
        z.object({
          value: z.string(),
          title: z.string(),
        })
      ),
    })
    .describe("get a choice from the user"),
])

export type AICommandVariable = z.infer<typeof AICommandVariableSchema>

const AICommandSchema = z.object({
  command: z.string().describe("the cli command"),
  example: z.string().optional().describe("example to show in cli help"),
  description: z
    .string()
    .optional()
    .describe("description to show in cli help"),
  variables: z.record(AICommandVariableSchema).optional(),
  prompt: z.string().describe("the prompt to send to the model"),
  require_stdin: z
    .boolean()
    .optional()
    .describe("Require piping output from another program to Shell Ask"),
})

export type AICommand = z.infer<typeof AICommandSchema>

export const ConfigSchema = z.object({
  default_model: z.string().optional(),
  openai_api_key: z
    .string()
    .optional()
    .describe('Default to the "OPENAI_API_KEY" environment variable'),
  openai_api_url: z
    .string()
    .optional()
    .describe('Default to the "OPENAI_API_URL" environment variable'),
  gemini_api_key: z
    .string()
    .optional()
    .describe('Default to the "GEMINI_API_KEY" environment variable'),
  gemini_api_url: z
    .string()
    .optional()
    .describe('Default to the "GEMINI_API_URL" environment variable'),
  anthropic_api_key: z
    .string()
    .optional()
    .describe('Default to the "ANTHROPIC_API_KEY" environment variable'),
  groq_api_key: z
    .string()
    .optional()
    .describe('Default to the "GROQ_API_KEY" environment variable'),
  commands: z.array(AICommandSchema).optional(),
})

export type Config = z.infer<typeof ConfigSchema>

function loadGlobalConfig(): Config {
  try {
    return JSON.parse(fs.readFileSync(configFilePath, "utf-8"))
  } catch {
    return {}
  }
}

function loadLocalConfig(): Config {
  try {
    return JSON.parse(fs.readFileSync("shell-ask.json", "utf-8"))
  } catch {
    return {}
  }
}

export function loadConfig(): Config {
  const globalConfig = loadGlobalConfig()
  const localConfig = loadLocalConfig()

  return {
    ...globalConfig,
    ...localConfig,
    commands: [
      ...(globalConfig.commands || []),
      ...(localConfig.commands || []),
    ],
  }
}
