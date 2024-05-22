import fs from "fs"
import { ConfigSchema } from "../src/config"
import { zodToJsonSchema } from "zod-to-json-schema"

const jsonSchema = zodToJsonSchema(ConfigSchema, "Config")

fs.writeFileSync("schema.json", JSON.stringify(jsonSchema, null, 2))
