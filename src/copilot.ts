import fs from "node:fs"
import path from "node:path"
import { z } from "zod"
import { configDirPath } from "./config"

const DeviceCodeResponseSchema = z.object({
  device_code: z.string(),
  user_code: z.string(),
  verification_uri: z.string(),
  interval: z.number(),
})

type DeviceCodeResponse = z.infer<typeof DeviceCodeResponseSchema>

const CopilotTokenResponseSchema = z.object({
  token: z.string(),
  expires_at: z.number(),
})

type CopilotTokenResponse = z.infer<typeof CopilotTokenResponseSchema>

const clientId = "Iv1.b507a08c87ecfe98"

class Copilot {
  copilotTokenResponseCache?: CopilotTokenResponse

  async requestDeviceCode() {
    const res = await fetch(
      `https://github.com/login/device/code?${new URLSearchParams({
        client_id: clientId,
      })}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to request device code: ${await res.text()}`)
    }

    const json = await res.json()
    return DeviceCodeResponseSchema.parse(json)
  }

  async verifyAuth({ device_code }: DeviceCodeResponse) {
    const res = await fetch(
      `https://github.com/login/oauth/access_token?${new URLSearchParams({
        client_id: clientId,
        device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      })}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    )

    if (!res.ok) return null

    const json = await res.json()
    return z.object({ access_token: z.string() }).parse(json)
  }

  async getCopilotToken(authToken: string) {
    if (
      this.copilotTokenResponseCache &&
      Date.now() < this.copilotTokenResponseCache.expires_at * 1000
    ) {
      return this.copilotTokenResponseCache
    }

    const res = await fetch(
      `https://api.github.com/copilot_internal/v2/token`,
      {
        headers: {
          authorization: `Bearer ${authToken}`,
          accept: "application/json",
        },
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to get token for chat: ${await res.text()}`)
    }

    const json = await res.json()
    const result = CopilotTokenResponseSchema.parse(json)

    this.copilotTokenResponseCache = result
    return result
  }

  saveAuthToken(token: string) {
    fs.mkdirSync(configDirPath, { recursive: true })
    fs.writeFileSync(path.join(configDirPath, ".copilot-auth-token"), token)
  }

  loadAuthToken() {
    try {
      return fs.readFileSync(
        path.join(configDirPath, ".copilot-auth-token"),
        "utf-8"
      )
    } catch {
      return null
    }
  }

  removeAuthToken() {
    try {
      fs.unlinkSync(path.join(configDirPath, ".copilot-auth-token"))
    } catch {}
  }
}

export const copilot = new Copilot()
