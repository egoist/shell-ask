import fs from "fs"
import os from "os"
import path from "path"

const configDirPath = path.join(os.homedir(), ".config", "shell-ask")
export const configFilePath = path.join(configDirPath, "config.json")

type Config = {
  default_model?: string
  openai_api_key?: string
  openai_api_url?: string
  anthropic_api_key?: string
}

export function loadConfig(): Config {
  try {
    return JSON.parse(fs.readFileSync(configFilePath, "utf-8"))
  } catch {
    return {}
  }
}

export function saveConfig(config: Config) {
  fs.mkdirSync(configDirPath, { recursive: true })
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
}
