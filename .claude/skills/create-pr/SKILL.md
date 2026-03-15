---
name: create-pr
description: Create a GitHub pull request from the current branch into main
disable-model-invocation: true
allowed-tools: Bash(git *), mcp__plugin_github_github__create_pull_request
---

Create a pull request for the current branch into main.

1. Run `git log main..HEAD --oneline` to see the commits on this branch
2. Run `git diff main..HEAD --stat` to understand the scope of changes
3. Use the mcp__plugin_github_github__create_pull_request tool with:
   - owner: CodeBrew-Devs
   - repo: pebble
   - base: main
   - head: current branch name (from `git branch --show-current`)
   - title: concise, under 70 characters, derived from the commits
   - body: a `## Summary` section with 2–4 bullet points describing what changed and why — no test plan

Return the PR URL when done.
