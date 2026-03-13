# Quickshare

Browser extension that copies the current page's link in multiple formats — ready to paste into Slack, Markdown documents, or Confluence.

## Features

- Click the **toolbar icon** on any page to copy a formatted link
- Three copy formats:
  - **Slack** — `<https://example.com|Page Title>`
  - **Markdown** — `[Page Title](https://example.com)`
  - **Confluence** — `[Page Title|https://example.com]`
- Popup shows the full page title and closes automatically after copying

## Installation

### Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this project directory

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file in this project directory

## Usage

1. Navigate to any webpage
2. Click the Quickshare icon in your browser toolbar
3. Choose a format — the link is copied to your clipboard and the popup closes

## Development

```sh
npm install   # install dev dependencies (ESLint)
npm run lint  # lint popup.js
```

After editing any file, reload the extension in your browser to pick up changes.
