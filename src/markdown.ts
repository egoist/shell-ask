import { marked } from "marked"
import { markedTerminal } from "marked-terminal"

// @ts-expect-error
marked.use(markedTerminal())

export function renderMarkdown(input: string) {
  return marked.parse(input) as string
}
