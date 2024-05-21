#!/usr/bin/env node
import fs from "fs"
import { cac } from "cac"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { CoreMessage, generateText, streamText } from "ai"
import { createOllama } from "ollama-ai-provider"
import { notEmpty } from "./utils"
import { configure } from "./configure"
import { configFilePath, loadConfig } from "./config"
import { MODEL_PREFIXES, getAllModels } from "./models"
import cliPrompts from "prompts"
import { stdin } from "./tty"
import updateNotifier from "update-notifier"

if (process.env.PKG_NAME && process.env.PKG_VERSION) {
  updateNotifier({
    pkg: { name: process.env.PKG_NAME, version: process.env.PKG_VERSION },
  }).notify()
}

async function main() {
  const cli = cac("ask")

  // ifconfig | ask "what is my ip"
  const readPipeInput = async () => {
    // not piped input
    if (process.stdin.isTTY) return ""

    return new Promise<string>((resolve, reject) => {
      let data = ""

      process.stdin.on("data", (chunk) => {
        data += chunk
      })

      process.stdin.on("end", () => {
        resolve(data)
      })

      process.stdin.on("error", (err) => {
        reject(err)
      })
    })
  }

  cli
    .command("[prompt]", "Run the prompt")
    .option("-m, --model <model>", "Choose the LLM to use")
    .option("-c, --command", "Ask LLM to return the command only")
    .action(
      async (
        prompt: string | undefined,
        flags: { model?: string; command?: boolean }
      ) => {
        const pipeInput = await readPipeInput()

        const messages: CoreMessage[] = []

        if (!prompt) {
          console.error("please provide a prompt")
          process.exit(1)
        }

        messages.push({
          role: "system",
          content: [
            `shell: ${process.env.SHELL || "unknown"}`,
            pipeInput && `stdin: ${pipeInput}`,
          ]
            .filter(notEmpty)
            .join("\n"),
        })

        messages.push({
          role: "user",
          content: [
            prompt,
            flags.command
              ? `Return the command only without any other text.`
              : ``,
          ]
            .filter(notEmpty)
            .join("\n"),
        })

        const config = loadConfig()
        let modelId = flags.model || config.default_model || "gpt-3.5-turbo"

        const models = await getAllModels(
          modelId === "ollama" || modelId.startsWith("ollama-")
            ? "required"
            : false
        )

        if (MODEL_PREFIXES.includes(modelId) || modelId === "ollama") {
          const result = await cliPrompts([
            {
              stdin,

              type: "select",

              message: "Select a model",

              name: "modelId",

              choices: models
                .filter((item) => item.id.startsWith(`${modelId}-`))
                .map((item) => {
                  return {
                    value: item.id,
                    title: item.id,
                  }
                }),
            },
          ])

          if (typeof result.modelId !== "string" || !result.modelId) {
            throw new Error("no model selected")
          }

          modelId = result.modelId
        }

        const realModelId =
          models.find((m) => m.id === modelId)?.realId || modelId

        const model = modelId.startsWith("ollama-")
          ? createOllama()
          : modelId.startsWith("claude-")
          ? createAnthropic({
              apiKey: config.anthropic_api_key,
            })
          : createOpenAI({
              apiKey: config.openai_api_key,
            })

        // @ts-expect-error Bun doesn't support TextDecoderStream
        if (typeof Bun !== "undefined") {
          const result = await generateText({
            model: model(realModelId),
            messages,
            temperature: 0,
          })

          console.log(result.text)
          process.exit()
        }

        const { textStream } = await streamText({
          model: model(realModelId),
          messages,
          temperature: 0,
        })

        for await (const textPart of textStream) {
          process.stdout.write(textPart)
        }
        process.stdout.write("\n")

        process.exit()
      }
    )

  cli.command("configure", "Configure models").action(async () => {
    console.log("config file", configFilePath)
    await configure()
  })

  cli
    .command("list", "List available models")
    .alias("ls")
    .action(async () => {
      const models = await getAllModels(true)

      for (const model of models) {
        console.log(model.id)
      }
    })

  cli.help()
  cli.parse()
}

main()
