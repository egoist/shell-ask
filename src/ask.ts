import process from "node:process"
import { CoreMessage, generateText, streamText } from "ai"
import { loadFiles, notEmpty } from "./utils"
import { loadConfig } from "./config"
import {
  MODEL_PREFIXES,
  getAllModels,
  getCheapModelId,
  toProviderModelId,
} from "./models"
import cliPrompts from "prompts"
import { stdin } from "./tty"
import { CliError } from "./error"
import { getSDKModel } from "./ai-sdk"
import { debug } from "./debug"
import { fetchUrl } from "./fetch-url"
import { getSearchResult } from "./search"
import logUpdate from "log-update"
import { renderMarkdown } from "./markdown"
import { loadChat, saveChat } from "./chat"

export async function ask(
  prompt: string | undefined,
  options: {
    model?: string
    command?: boolean
    pipeInput?: string
    files?: string | string[]
    type?: string
    url?: string | string[]
    search?: boolean
    stream?: boolean
    reply?: boolean
    breakdown?: boolean
  }
) {
  if (!prompt) {
    throw new CliError("please provide a prompt")
  }

  const chat = options.reply ? loadChat() : null
  const config = loadConfig()
  let modelId =
    options.model ||
    chat?.options.realModelId ||
    config.default_model ||
    "gpt-3.5-turbo"

  const models = await getAllModels(
    modelId === "ollama" || modelId.startsWith("ollama-") ? "required" : false
  )

  if (MODEL_PREFIXES.includes(modelId) || modelId === "ollama") {
    if (process.platform === "win32" && !process.stdin.isTTY) {
      throw new CliError(
        "Interactively selecting a model is not supported on Windows when using piped input. Consider directly specifying the model id instead, for example: `-m gpt-3.5-turbo`"
      )
    }

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

  debug(`Selected modelID: ${modelId}`)

  const matchedModel = models.find(
    (m) => m.id === modelId || m.realId === modelId
  )
  if (!matchedModel) {
    throw new CliError(
      `model not found: ${modelId}\n\navailable models: ${models
        .map((m) => m.id)
        .join(", ")}`
    )
  }
  const realModelId = matchedModel?.realId || modelId
  const model = getSDKModel(modelId, config)

  debug("model", realModelId)

  const files = await loadFiles(options.files || [])
  const remoteContents = await fetchUrl(options.url || [])
  const context = [
    // inhert prev chat
    !chat && `Context:`,
    !chat && `shell: ${process.env.SHELL || "unknown"}`,

    options.pipeInput && [`stdin:`, "```", options.pipeInput, "```"].join("\n"),

    files.length > 0 && "files:",
    ...files.map((file) => `${file.name}:\n"""\n${file.content}\n"""`),

    remoteContents.length > 0 && "remote contents:",
    ...remoteContents.map(
      (content) => `${content.url}:\n"""\n${content.content}\n"""`
    ),
  ]
    .filter(notEmpty)
    .join("\n")

  let searchResult: string | undefined

  if (options.search) {
    const searchModel = model(getCheapModelId(realModelId))
    searchResult = await getSearchResult(searchModel, { context, prompt })
  }

  const messages: CoreMessage[] = []

  const prevSystemMessage = chat?.messages[0]

  messages.push({
    role: "system",
    content:
      (prevSystemMessage?.content ? `${prevSystemMessage.content}\n` : "") +
      [context, searchResult && "search result:", searchResult]
        .filter(notEmpty)
        .join("\n"),
  })

  if (chat) {
    messages.push(...chat.messages.slice(1))
  }

  messages.push({
    role: "user",
    content: [
      prompt,
      options.command
        ? `Return the command only without any other text or markdown code fences.`
        : ``,
      options.breakdown
        ? `You must return in the following format:\n...command\n\n...command breakdown`
        : ``,
      options.type
        ? [
            `The result must match the following type definition:`,
            "```typescript",
            options.type,
            "```",
            "Return the result only without any other text or markdown code fences.",
          ].join("\n")
        : ``,
    ]
      .filter(notEmpty)
      .join("\n"),
  })

  debug("messages", messages)

  logUpdate(`Waiting for ${realModelId} to respond...`)

  const temperature = 0
  const providerModelId = toProviderModelId(realModelId)

  // @ts-expect-error Bun doesn't support TextDecoderStream
  if (options.stream === false || typeof Bun !== "undefined") {
    const result = await generateText({
      model: model(providerModelId),
      messages,
      temperature,
    })

    logUpdate.clear()
    logUpdate(renderMarkdown(result.text).trim())
    process.exit()
  }

  const { textStream } = await streamText({
    model: model(providerModelId),
    messages,
    temperature,
  })

  logUpdate.clear()

  let output = ""
  for await (const textPart of textStream) {
    output += textPart
    process.stdout.write(textPart)
  }
  process.stdout.write("\n")

  saveChat({
    messages: [...messages, { role: "assistant", content: output }],
    options: { realModelId, temperature },
  })

  process.exit()
}
