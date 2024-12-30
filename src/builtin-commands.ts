import { AICommand } from "./config"

export const builtinCommands: AICommand[] = [
  {
    command: "cm",
    description: "Generate git commit message based on git diff output",
    require_stdin: true,
    prompt:
      "Generate git commit message following Conventional Commits specification based on the git diff output in stdin\nYou must return a commit message only. Try to capture the key changes in the title in under 72 characters. For changes that are not captured in the title and are important for the developer to know, add the details in the body as a list. Do not add details if the title is already clear. Do not output any other text or quotes.",
  },
]
