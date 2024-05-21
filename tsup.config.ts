import { defineConfig } from "tsup"
import fs from "fs"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))

export default defineConfig({
  entry: ["./src/cli.ts"],
  format: "esm",
  env: {
    PKG_VERSION: pkg.version,
    PKG_NAME: pkg.name,
  },
})
