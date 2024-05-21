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

## Configuration

```bash
ask configure
# each option is optional, pretty enter to skip
```

You can also edit `~/.config/shell-ask/config.json` directly, check out the [JSON schema](./schema.json) for all available options.

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

## License

MIT.
