#!/usr/bin/env node
import { cac } from "cac"
import { configure } from "./configure"
import { configFilePath, loadConfig } from "./config"
import { getAllModels } from "./models"
import updateNotifier from "update-notifier"
import { ask } from "./ask"

if (process.env.PKG_NAME && process.env.PKG_VERSION) {
  updateNotifier({
    pkg: { name: process.env.PKG_NAME, version: process.env.PKG_VERSION },
  }).notify()
}

async function main() {
  const cli = cac("ask")

  cli
    .command("[prompt]", "Run the prompt")
    .option("-m, --model <model>", "Choose the LLM to use")
    .option("-c, --command", "Ask LLM to return the command only")
    .action(async (prompt, flags) => {
      await ask(prompt, flags)
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

  cli.help()
  cli.parse()
}

main()
