import { AICommand, AICommandVariable, Config } from "./config"
import { stdin } from "./tty"
import prompts from "prompts"
import { builtinCommands } from "./builtin-commands"
import { runCommand } from "./utils"

export function getAllCommands(config: Config) {
  const commands: Record<string, AICommand> = {}

  for (const command of builtinCommands) {
    commands[command.command] = command
  }

  if (config.commands) {
    for (const command of config.commands) {
      commands[command.command] = command
    }
  }

  return [...Object.values(commands)]
}

export async function getPrompt(
  prompt: string,
  variables: Record<string, AICommandVariable> | undefined,
  flags: Record<string, string>
) {
  const data: Record<string, string> = {}

  if (variables) {
    for (const key in variables) {
      const command = variables[key]
      if (typeof command === "string") {
        const result = await runCommand(command)
        data[key] = result
      } else if (command.type === "input" || command.type === "select") {
        if (typeof flags[key] === "string") {
          data[key] = flags[key]
          continue
        }

        const result = await prompts([
          command.type === "select"
            ? {
                name: "answer",
                message: command.message,
                type: "select",
                choices: command.choices,
                stdin,
              }
            : {
                name: "answer",
                message: command.message,
                type: "text",
                stdin,
              },
        ])

        if (typeof result.answer !== "string") {
          throw new Error("must be a string")
        }

        data[key] = result.answer
      }
    }
  }

  return prompt.replace(/{{(.*?)}}/g, (_, key) => data[key])
}
