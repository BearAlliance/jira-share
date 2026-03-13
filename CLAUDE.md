# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quickshare is a cross-browser (Chrome + Firefox) Manifest V3 extension with a toolbar popup that copies the current page's link in Slack, Markdown, or Confluence format.

## Architecture

No build tooling, no background script, no content scripts — the entire extension is a toolbar popup.

- `manifest.json` — Manifest V3 config
- `popup.html` / `popup.js` — Toolbar popup: reads the active tab's URL and title, copies formatted links
- `icons/` — Placeholder extension icons (16/48/128px)

## Development

- **Chrome**: `chrome://extensions` → Developer Mode → Load unpacked → select project dir
- **Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json`
- No build step; edit files and reload the extension
- No test suite configured yet (`npm test` is a placeholder)

### Commit Message Format

Use conventional commits.