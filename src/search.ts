import { LanguageModel, generateText, tool } from "ai"
import { z } from "zod"
import logUpdate from "log-update"

const searchTool = tool({
  description:
    "Useful for search the web to retrive real-time and accurate information",
  parameters: z.object({
    keywords: z
      .string()
      .describe("the keywords used for search engine to search the web"),
  }),
  execute: async (input) => {
    logUpdate(`Searching the web for "${input.keywords}"...`)
    const response = await fetch(`https://s.jina.ai/${input.keywords}`)
    return response.text()
  },
})

export const getSearchResult = async (
  model: LanguageModel,
  { context, prompt }: { context: string; prompt: string }
) => {
  logUpdate("Starting search...")
  const result = await generateText({
    model,
    messages: [
      {
        role: "system",
        content: context,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    tools: { search: searchTool },
  })

  logUpdate.clear()
  return result.toolResults.find((r) => r.toolName === "search")?.result
}
