# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quickshare is a cross-browser (Chrome + Firefox) Manifest V3 extension that injects a "Share" button into Jira Cloud issue pages. The button shows a dropdown with Slack and Markdown options, each copying a formatted issue link to the clipboard.

## Architecture

No build tooling, no background script — the entire extension is a content script + CSS injected into Jira pages.

- `manifest.json` — Manifest V3 config; matches `*.atlassian.net`
- `content.js` — Content script: extracts issue data, builds UI, copies formatted links
- `content.css` — Styles for the share button/dropdown (all selectors prefixed `.quickshare-`)
- `icons/` — Placeholder extension icons (16/48/128px)

## Development

- **Chrome**: `chrome://extensions` → Developer Mode → Load unpacked → select project dir
- **Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json`
- No build step; edit files and reload the extension
- No test suite configured yet (`npm test` is a placeholder)

### Commit Message Format

Use conventional commits.