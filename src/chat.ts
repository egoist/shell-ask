import fs from "fs"
import { CoreMessage } from "ai"
import os from "os"
import path from "path"

const chatFilePath = path.join(os.tmpdir(), "shell-ask-chat.json")

type Chat = {
  messages: CoreMessage[]
  options: { temperature?: number; realModelId: string }
}

export function saveChat(chat: Chat) {
  fs.writeFileSync(chatFilePath, JSON.stringify(chat))
}

export function loadChat() {
  if (!fs.existsSync(chatFilePath)) return null

  const chat = JSON.parse(fs.readFileSync(chatFilePath, "utf-8")) as Chat
  return chat
}
