import fs from "fs"
import glob from "fast-glob"

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
