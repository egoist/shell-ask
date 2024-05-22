import { CoreMessage, generateText, streamText } from "ai"
import { loadFiles, notEmpty } from "./utils"
import { loadConfig } from "./config"
import { MODEL_PREFIXES, getAllModels } from "./models"
import cliPrompts from "prompts"
import { stdin } from "./tty"
import { CliError } from "./error"
import { getSDKModel } from "./ai-sdk"

export async function ask(
  prompt: string | undefined,
  options: {
    model?: string
    command?: boolean
    pipeInput?: string
    files?: string | string[]
  }
) {
  const messages: CoreMessage[] = []

  if (!prompt) {
    throw new CliError("please provide a prompt")
  }

  const files = await loadFiles(options.files || [])
  messages.push({
    role: "system",
    content: [
      `Context:`,
      `shell: ${process.env.SHELL || "unknown"}`,
      options.pipeInput && `stdin: ${options.pipeInput}`,
      files.length > 0 && "files:",
      ...files.map((file) => `${file.name}:\n"""\n${file.content}\n"""`),
    ]
      .filter(notEmpty)
      .join("\n"),
  })

  messages.push({
    role: "user",
    content: [
      prompt,
      options.command ? `Return the command only without any other text.` : ``,
    ]
      .filter(notEmpty)
      .join("\n"),
  })

  const config = loadConfig()
  let modelId = options.model || config.default_model || "gpt-3.5-turbo"

  const models = await getAllModels(
    modelId === "ollama" || modelId.startsWith("ollama-") ? "required" : false
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
      throw new CliError("no model selected")
    }

    modelId = result.modelId
  }

  const realModelId = models.find((m) => m.id === modelId)?.realId || modelId

  const model = getSDKModel(modelId, config)

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
