import tty from "tty"
import fs from "fs"

export const stdin = process.stdin.isTTY
  ? process.stdin
  : new tty.ReadStream(fs.openSync("/dev/tty", "r"))
