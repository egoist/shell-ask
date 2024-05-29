import process from "node:process"
import tty from "node:tty"
import fs from "node:fs"

let stdin: tty.ReadStream | undefined = undefined
export const ttyStdin = () => {
  if (!stdin) {
    stdin = process.stdin.isTTY
      ? process.stdin
      : new tty.ReadStream(fs.openSync("/dev/tty", "r"))
  }
  return stdin as tty.ReadStream
}

// ifconfig | ask "what is my ip"
export const readPipeInput = async () => {
  // not piped input
  if (process.stdin.isTTY) return ""

  return new Promise<string>((resolve, reject) => {
    let data = ""

    process.stdin.on("data", (chunk) => {
      data += chunk
    })

    process.stdin.on("end", () => {
      resolve(data)
    })

    process.stdin.on("error", (err) => {
      reject(err)
    })
  })
}
