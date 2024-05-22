#!/usr/bin/env node
import { cac, Command as CliCommand } from "cac"
import { getAllModels } from "./models"
import updateNotifier from "update-notifier"
import { ask } from "./ask"
import { getAllCommands, getPrompt } from "./ai-command"
import { readPipeInput } from "./tty"
import { CliError } from "./error"
import { loadConfig } from "./config"

if (process.env.PKG_NAME && process.env.PKG_VERSION) {
  updateNotifier({
    pkg: { name: process.env.PKG_NAME, version: process.env.PKG_VERSION },
  }).notify()
}

function applyCommonFlags(command: CliCommand) {
  command.option("-m, --model <model>", "Choose the LLM to use")
  command.option("--files <pattern>", "Adding files to model context")
  return command
}

async function main() {
  const cli = cac("ask")
  const config = loadConfig()

  const root = cli.command("[prompt]", "Run the prompt")

  applyCommonFlags(root)

  root
    .option("-c, --command", "Ask LLM to return the command only")
    .action(async (prompt, flags) => {
      const pipeInput = await readPipeInput()

      await ask(prompt, { ...flags, pipeInput })
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

  const allCommands = getAllCommands(config)
  for (const command of allCommands) {
    const c = cli.command(command.command, command.description)

    applyCommonFlags(c)

    if (command.example) {
      c.example(command.example)
    }

    if (command.variables) {
      for (const variableName in command.variables) {
        const value = command.variables[variableName]
        if (typeof value === "string") continue

        c.option(`--${variableName} <${variableName}>`, value.message)
      }
    }

    c.action(async (flags) => {
      const { model, files, ...localFlags } = flags
      const pipeInput = await readPipeInput()

      if (command.require_stdin && !pipeInput) {
        throw new CliError(
          `this command requires piping input from another program to Shell Ask, e.g. \`echo 'input' | ask ${command.command}\``
        )
      }

      const prompt = await getPrompt(
        command.prompt,
        command.variables,
        localFlags
      )
      await ask(prompt, { model, pipeInput, files })
    })
  }

  cli.version(process.env.PKG_VERSION || "0.0.0")
  cli.help()

  try {
    cli.parse(process.argv, { run: false })
    await cli.runMatchedCommand()
  } catch (error) {
    process.exitCode = 1
    if (error instanceof CliError) {
      console.error(error.message)
    } else {
      throw error
    }
  }
}

main()
