# Jira Share

Browser extension that copies Jira issue links in multiple formats from any Jira Cloud issue page.

## Features

- Adds a **Share** button to the issue action toolbar
- Also accessible via the **browser toolbar icon**
- Three copy formats:
  - **Slack** — `KAN-1: https://tenant.atlassian.net/browse/KAN-1`
  - **Markdown** — `[KAN-1: Issue Title](https://tenant.atlassian.net/browse/KAN-1)`
  - **Confluence** — `[KAN-1: Issue Title|https://tenant.atlassian.net/browse/KAN-1]`
- Works on full issue views (`/browse/KAN-1`) and board modal views
- Handles SPA navigation automatically — button re-injects when switching issues

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

**From the issue page:**
1. Navigate to any Jira Cloud issue
2. Click the **Share** button in the issue action toolbar (top of the issue, near Attach / Link issue)
3. The dropdown shows the issue key and title, then choose a format to copy

**From the browser toolbar:**
1. Click the Jira Share extension icon in your browser toolbar
2. The popup shows the issue key and title for the current tab
3. Choose a format to copy — the popup closes automatically after copying

If the current tab is not a Jira issue page, the popup will say so.

## Development

```sh
npm install   # install dev dependencies (ESLint)
npm run lint  # lint content.js and popup.js
```

After editing any file, reload the extension in your browser to pick up changes.
