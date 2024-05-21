# shell-ask

![preview](https://cdn.jsdelivr.net/gh/egoist-bot/images@main/uPic/js3Bja.png)

## Install

This requires Node.js to be installed.

```bash
npm i -g shell-ask
```

## Supported LLMs

- OpenAI
- Anthropic
- Ollama
- Google Gemini

## Configuration

```bash
ask configure
# each option is optional, pretty enter to skip
```

You can also edit `~/.config/shell-ask/config.json` directly, check out the [JSON schema](./schema.json) or [Type definition](./src/config.ts) for all available options.

## Usage

Ask a question:

```bash
# Ask a question
ask "get git logs first line only"

# Make sure it outputs a command only with -c or --command flag
ask "get git logs first line only" -c
```

Using command output as context:

```bash
cat package.json | ask "please fix exports"
```

Interactively select a model:

```bash
ask "question" -m gpt
ask "question" -m claude
ask "question" -m ollama
```

Select a model by id:

```bash
ask "question" -m gpt-4o
ask "question" -m claude-3-opus
```

## Piping

You can pipe the output of other programs to `ask`, for example you can use `cat` to add file contents to the LLM context:

```bash
cat main.ts | ask "explain the code"
```

If you want to add multiple files, use [bat](https://github.com/sharkdp/bat) instead:

```bash
bat src/*.ts | ask "write a concise outline for this project"
```

## AI Command Presets

Shell Ask allows you to define reusable AI commands in the config file `~/.config/shell-ask/config.json`, for example the builtin `ask cm` command:

```json
{
  "commands": [
    {
      "command": "cm",
      "description": "Generate git commit message based on git diff output",
      "prompt": "Generate git commit message following Conventional Commits specification based on the git diff output in stdin\nYou must return a commit message only, without any other text or quotes."
    }
  ]
}
```

Check out the[ type definition](./src/config.ts) for AI command definition.

### Built-in AI Command Presets

- `ask cm`: Generate git commit message from stdin
  - example: `git diff | ask cm`
- `ask type-to-json-schema`: Generate JSON schema for a TypeScript type from stdin
  - example: `cat mod.ts | ask type-to-json-schema --typeName SomeType`

## License

MIT.
