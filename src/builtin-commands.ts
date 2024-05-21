import { AICommand } from "./config"

export const builtinCommands: AICommand[] = [
  {
    command: "cm",
    description: "Generate git commit message based on git diff output",
    require_stdin: true,
    prompt:
      "Generate git commit message following Conventional Commits specification based on the git diff output in stdin\nYou must return a commit message only, without any other text or quotes.",
  },
  {
    command: "type-to-json-schema",
    description: "Generate JSON schema from a TypeScript type",
    variables: {
      typeName: {
        type: "input",
        message: "Type name",
      },
    },
    require_stdin: true,
    prompt: `Generate JSON schema from the "{{typeName}}" type in stdin. You must return the JSON string only, without any other text or quotes.`,
  },
]
