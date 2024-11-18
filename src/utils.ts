import fs from "node:fs"
import glob from "fast-glob"
import { exec } from "node:child_process"

export function notEmpty<TValue>(
  value: TValue | null | undefined | "" | false
): value is TValue {
  return (
    value !== null && value !== undefined && value !== "" && value !== false
  )
}

export async function loadFiles(
  files: string | string[]
): Promise<{ name: string; content: string }[]> {
  if (!files || files.length === 0) return []

  const filenames = await glob(files, { onlyFiles: true })

  return await Promise.all(
    filenames.map(async (name) => {
      const content = await fs.promises.readFile(name, "utf8")
      return { name, content }
    })
  )
}

export async function runCommand(command: string) {
  return new Promise<string>((resolve, reject) => {
    const cmd = exec(command)
    let output = ""
    cmd.stdout?.on("data", (data) => {
      output += data
    })
    cmd.stderr?.on("data", (data) => {
      output += data
    })
    cmd.on("close", () => {
      resolve(output)
    })
    cmd.on("error", (error) => {
      reject(error)
    })
  })
}
