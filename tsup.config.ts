import { defineConfig } from "tsup"
import fs from "fs"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))

export default defineConfig({
  entry: ["./src/cli.ts"],
  format: "esm",
  define: {
    PKG_VERSION: JSON.stringify(pkg.version),
    PKG_NAME: JSON.stringify(pkg.name),
  },
})
