# AGENTS.md

Project instructions for DeepSeek TUI and other coding agents in this Windows workspace.

## Operating Mode

- Work end-to-end: inspect, edit, verify, commit, and push.
- Do not stop at a plan when the change is clear and low risk.
- Ask before risky or ambiguous work, destructive git operations, migrations, or broad rewrites.
- Do not create schedulers, background services, or recurring automations without an explicit request.

## Git

- Main branch: `master`, unless the user names another branch.
- If `.git` or `origin` is missing, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\user\.codex\scripts\ensure-git-publish.ps1
```

- Commit every completed logical task:

```powershell
git add -A
git commit -m "type: concise message"
git push
```

- Use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Do not use `git reset --hard`, `git checkout --`, force-push, or destructive cleanup unless explicitly requested.
- Do not overwrite unrelated user changes.

## Cost-First Hybrid LLM Policy

DeepSeek cloud remains the final model for complex reasoning and final decisions. Local Ollama is used first for simple tasks it can handle.

Use local Ollama automatically for:

- simple code drafts and small templates;
- quick refactor suggestions;
- first-pass review of local diffs;
- short documentation/text drafts;
- screenshot/UI analysis through the existing `vision` skill once the vision model is available.

Default local routing:

- `qwen2.5-coder:7b` for fast code drafts, up to about 30 seconds;
- `qwen2.5-coder:7b-instruct-q6_K` for stronger local code pass if the first pass is not good enough;
- `deepseek-r1:8b` for short review output, up to 8 actionable points;
- `qwen3:8b` for text/spec/explanation drafts;
- `bge-m3` for local RAG/embedding tasks when available.

Escalate to DeepSeek cloud when:

- local output is invalid or incomplete after one retry;
- local output does not apply cleanly, contradicts project files, omits requested behavior, or cannot pass the relevant check;
- the task touches architecture, security, migrations, or 6+ files;
- tests fail after local changes;
- the user explicitly asks for cloud-only work.

Do not claim local work was unnecessary. If local tools fail, state the reason briefly and continue with cloud.

## Local Tools

Available DeepSeek tools:

- `C:\Users\user\.deepseek\tools\deepseek-local-draft.ps1` for local draft generation.
- `C:\Users\user\.deepseek\tools\deepseek-local-review.ps1` for local diff review.
- `C:\Users\user\.deepseek\tools\deepseek-vision.ps1` for screenshot analysis through Ollama vision. Do not modify the vision model setup unless asked.

## Quality

- Keep changes minimal, readable, and consistent with the current project.
- For small edits, use patch-style changes or exact search/replace instead of rewriting the whole file.
- Before editing an existing file, read the surrounding function/section and preserve unrelated content.
- Do not regenerate a complete file unless it is tiny, newly created, or the requested change affects most of it.
- Prefer `apply_patch`, unified diff, or targeted edit tools when available.
- Prefer stable fixes over hacks.
- Remove unused imports and dead code when touching a file.
- Add tests for new logic when the project has a test setup.
- Before commit, run relevant checks. If no automated checks exist, run the smallest meaningful manual/static verification and report it.

## Python

- Target Python 3.10+.
- Use clear names, small functions, early returns, and useful error messages.
- Isolate Windows-specific behavior (`winsound`, `ctypes`, `schtasks`, PowerShell paths) so it does not break other platforms.

## Encoding and Language

- Use UTF-8 for text files.
- Code identifiers, file names, modules, and classes must be ASCII.
- Cyrillic is allowed in docs, user-facing UI strings, and test data where Russian cases matter.
- Before commit, check changed files for broken Cyrillic text.

## Security

- Do not hardcode or commit secrets.
- Prefer environment variables, OS keyring, or local ignored config files for keys.
- If a token is exposed, recommend rotation and avoid repeating the token in chat.

## Reporting

Final report should include:

- what changed;
- what was checked;
- commit hash and push status;
- any remaining risk or manual follow-up.
