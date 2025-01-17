#!/usr/bin/env node
import process from "node:process"
import { cac, Command as CliCommand } from "cac"
import { bold, green, underline } from "colorette"
import { getAllModels } from "./models"
import updateNotifier from "update-notifier"
import { ask } from "./ask"
import { getAllCommands, getPrompt } from "./ai-command"
import { readPipeInput } from "./tty"
import { CliError } from "./error"
import { loadConfig } from "./config"
import { copilot } from "./copilot"
import { APICallError } from "ai"

if (typeof PKG_NAME === "string" && typeof PKG_VERSION === "string") {
  updateNotifier({
    pkg: { name: PKG_NAME, version: PKG_VERSION },
    shouldNotifyInNpmScript: false,
  }).notify({
    isGlobal: true,
  })
}

function applyCommonFlags(command: CliCommand) {
  command.option("-c, --command", "Ask LLM to return a command only")
  command.option(
    "-b, --breakdown",
    "Ask LLM to return a command and the breakdown of this command"
  )
  command.option(
    "-m, --model [model]",
    "Choose the LLM to use, omit value to select interactively"
  )
  command.option("--files <pattern>", "Adding files to model context")
  command.option(
    "-t, --type <type>",
    "Define the shape of the response in TypeScript"
  )
  command.option("-u,--url <url>", "Fetch URL content as context")
  command.option("-s, --search", "Enable web search")
  command.option("--no-stream", "Disable streaming output")
  command.option("-r, --reply", "Reply to previous conversation")
  return command
}

async function main() {
  const cli = cac("ask")
  const config = loadConfig()

  const root = cli.command("[...prompt]", "Run the prompt")

  applyCommonFlags(root)

  root.action(async (prompt, flags) => {
    const pipeInput = await readPipeInput()

    await ask(prompt.join(" "), { ...flags, pipeInput })
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

  cli.command("copilot-login").action(async () => {
    const deviceCodeResult = await copilot.requestDeviceCode()

    console.log("First copy your one-time code:\n")
    console.log(bold(green(deviceCodeResult.user_code)))
    console.log()
    console.log(
      "Then visit this GitHub URL to authorize:",
      underline(deviceCodeResult.verification_uri)
    )

    console.log()
    console.log("Waiting for authentication...")
    console.log(`Press ${bold("Enter")} to check the authentication status...`)

    const checkAuth = async () => {
      const authResult = await copilot
        .verifyAuth(deviceCodeResult)
        .catch(() => null)
      if (authResult) {
        console.log("Authentication successful!")
        copilot.saveAuthToken(authResult.access_token)
        process.exit(0)
      } else {
        console.log("Authentication failed. Please try again.")
      }
    }

    // press Enter key to check auth
    process.stdin.on("data", (data) => {
      const str = data.toString()
      if (str === "\n" || str === "\r\n") {
        checkAuth()
      }
    })
  })

  cli.command("copilot-logout").action(() => {
    copilot.removeAuthToken()
    console.log("Copilot auth token removed")
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
      const {
        model,
        files,
        type,
        url,
        search,
        stream,
        reply,
        breakdown,
        ...localFlags
      } = flags
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
      await ask(prompt, {
        model,
        pipeInput,
        files,
        type,
        url,
        search,
        stream,
        reply,
        breakdown,
      })
    })
  }

  cli.version(typeof PKG_VERSION === "string" ? PKG_VERSION : "0.0.0")
  cli.help()

  try {
    cli.parse(process.argv, { run: false })
    await cli.runMatchedCommand()
  } catch (error) {
    process.exitCode = 1
    if (error instanceof CliError) {
      console.error(error.message)
    } else if (error instanceof APICallError) {
      console.log(error.responseBody)
    } else {
      throw error
    }
  }
}

main()
