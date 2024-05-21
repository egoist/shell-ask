#!/usr/bin/env node
import { cac, Command as CliCommand } from "cac"
import { configure } from "./configure"
import { configFilePath, loadConfig } from "./config"
import { getAllModels } from "./models"
import updateNotifier from "update-notifier"
import { ask } from "./ask"
import { getAllCommands, getPrompt } from "./ai-command"
import { readPipeInput } from "./tty"

if (process.env.PKG_NAME && process.env.PKG_VERSION) {
  updateNotifier({
    pkg: { name: process.env.PKG_NAME, version: process.env.PKG_VERSION },
  }).notify()
}

function applyCommonFlags(command: CliCommand) {
  command.option("-m, --model <model>", "Choose the LLM to use")
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

  const allCommands = getAllCommands(config)
  for (const command of allCommands) {
    const c = cli.command(command.command, command.description)

    applyCommonFlags(c)

    if (command.variables) {
      for (const variableName in command.variables) {
        const value = command.variables[variableName]
        if (typeof value === "string") continue

        c.option(`--${variableName} <${variableName}>`, value.message)
      }
    }

    c.action(async (flags) => {
      const { model, ...localFlags } = flags
      const pipeInput = await readPipeInput()

      if (command.require_stdin && !pipeInput) {
        console.error(
          `This command requires piping input from another program to Shell Ask, e.g. \`echo 'input' | ask ${command.command}\``
        )
        process.exit(1)
      }

      const prompt = await getPrompt(
        command.prompt,
        command.variables,
        localFlags
      )
      await ask(prompt, { model, pipeInput })
    })
  }

  cli.help()
  cli.parse()
}

main()
