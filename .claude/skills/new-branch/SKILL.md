---
name: new-branch
description: Create and switch to a new git branch following project naming conventions
argument-hint: <branch-name or description>
disable-model-invocation: true
allowed-tools: Bash(git *)
---

Create a new git branch and switch to it.

The desired branch name or description is: $ARGUMENTS

If $ARGUMENTS is empty, ask the user what the branch should be called before proceeding.

Follow these rules:
- Use lowercase kebab-case
- Prefix with the appropriate type: `feat/` for new features, `fix/` for bug fixes, `chore/` for maintenance, `docs/` for documentation
- If the argument already includes a prefix, use it as-is
- If the argument is a plain description (e.g. "user profile page"), infer the correct prefix from context

Run `git checkout -b <branch-name>` and confirm the branch was created successfully.
