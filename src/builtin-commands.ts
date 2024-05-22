import { AICommand } from "./config"

export const builtinCommands: AICommand[] = [
  {
    command: "cm",
    description: "Generate git commit message based on git diff output",
    require_stdin: true,
    prompt:
      "Generate git commit message following Conventional Commits specification based on the git diff output in stdin\nYou must return a commit message only, without any other text or quotes.",
  },
]
