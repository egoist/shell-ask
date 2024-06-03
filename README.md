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

- [OpenAI](https://openai.com)
- [Anthropic Claude](https://anthropic.com)
- [Ollama](https://ollama.com)
- [Google Gemini](https://aistudio.google.com/)
- [Groq](https://console.groq.com)

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

Prompt without quotes:

```bash
# Same prompt
ask "how to delete a docker image"
ask how to delete a docker image

# Escape using backslash if you need quotes inside the prompt
ask who\'s john titor
```

### Piping

You can pipe the output of other programs to `ask`, for example you can use `cat` to add file contents to the LLM context:

```bash
cat main.ts | ask "explain the code"
```

If you want to add multiple files, especially when you also want to include filenames in the context, you can use `--files` flag to add files into model context:

```bash
ask --files "src/*.ts " "write a concise outline for this project"
```

### Ask Follow-up Questions

Using `-r` or `--reply` flag to ask follow-up questions to the previous answer:

```bash
ask "how to delete a docker image"

ask -r "delete last 30 days"
```

### Result Type

#### Command

Using `-c` or `--command` flag to enforce the output to be a command only:

```bash
ask "turn foo.mp4 to 720p using ffmpeg" -c
```

Using `-b` or `--breakdown` flag to return a command and the breakdown of the command:

```bash
ask "turn foo.mp4 to 720p using ffmpeg" -b
```

#### Custom Type

Define the type of the result using `-t` or `--type` flag:

```bash
cat package.json | ask "extract dependency names" -t "string[]"

cat README.md | ask "extract headings" -t "{depth:number,title:string}[]"
```

### Web Search

Enable web search by using `-s` or `--search` flag:

```bash
ask -s "how to delete a docker image"
```

Web search is powered by https://s.jina.ai

### Fetching Web Pages

For a single page, you can just use `curl`:

```bash
curl -s https://example.com | ask "summarize it"
```

For multiple pages, you can use `-u` or `--url` flag:

```bash
ask -u https://example.com/about -u https://example.com/introduction "summarize it"
```

You may only need the markdown output of the web page, you can use https://r.jina.ai to retrive markdown content instead:

```bash
ask -u https://r.jina.ai/example.com "summarize it"
```

### Disable Streaming Output

Using `--no-stream` flag to disable streaming output:

```bash
ask "how to delete a docker image" --no-stream
```

When `--no-stream` is enabled the output markdown will have proper syntax highlighting, when streaming is enabled the output will be plain text because the terminal have trouble clearing the screen when the output is too long

### Reusable AI Commands

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
