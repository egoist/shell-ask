import process from "node:process"

export const debug = (...args: any[]) => {
  if (process.env.DEBUG !== "shell-ask" && process.env.DEBUG !== "*") return
  console.log(...args)
}
