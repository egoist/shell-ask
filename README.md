# shell-ask

![preview](https://cdn.jsdelivr.net/gh/egoist-bot/images@main/uPic/js3Bja.png)

---

**Shell Ask is sponsored by [ChatKit](https://chatkit.app), a free chat app for ChatGPT and many other models.**

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


Minimal config to use OpenAI, create a `~/.config/shell-ask/config.json` with the following content:

```json
{
  "openai_api_key": "sk-your-key-xxx"
}
```

Check out [config documentation](./docs/config.md) for more.


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

If you want to add multiple files, especially when you also want to include filenames in the context, you can use `--files` flag to add files into model context:

```bash
ask --files "src/*.ts " "write a concise outline for this project"
```

## Reusable AI Commands

Shell Ask allows you to define reusable AI commands in the [config file](./docs/config.md), for example the builtin `ask cm` command:

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

### Built-in AI Commands

- `ask cm`: Generate git commit message from stdin
  - example: `git diff | ask cm`

## License

MIT.
