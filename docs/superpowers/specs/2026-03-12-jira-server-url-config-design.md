# Jira Server URL Configuration — Design Spec

**Date:** 2026-03-12
**Status:** Approved

## Problem

The Quickshare extension's popup only recognises Jira Cloud (`*.atlassian.net`) pages. Users on self-hosted Jira Server / Data Center instances see "Not on a Jira issue page." because `popup.js` hardcodes the hostname check to `.atlassian.net`.

## Goal

Let users configure a single Jira Server base URL so the popup works on self-hosted instances, while preserving existing Jira Cloud behaviour with no configuration required.

## Scope

- Popup functionality only (the injected Share button in `content.js` is out of scope).
- Single URL (not multiple).
- Chrome and Firefox MV3.

## Design

### Storage

`chrome.storage.sync` stores one optional key:

```json
{ "jiraServerUrl": "https://jira.company.com" }
```

"Set" means a non-empty string after `.trim()`. Absent, empty, or whitespace-only means Server support is disabled. Jira Cloud continues to work with no stored value.

### Options Page (`options.html` + `options.js`)

A minimal page registered as the extension's options UI:

- A labelled text input pre-populated with the stored URL (if any). The value is set via `input.value` (not `innerHTML`) to avoid XSS.
- A Save button that validates and persists the URL.
- A brief inline confirmation ("Saved.") on success, inline error on invalid input.

**Validation on save:**
- Must be a valid `https://` URL (parseable by `new URL()`).
- Subpath installs are supported (e.g., `https://jira.company.com/jira`). The value is stored as-is with trailing slash stripped.
- If the field is empty (or whitespace-only) when saved, call `chrome.storage.sync.remove("jiraServerUrl")` to delete the key.

**Error handling on read:** If the stored value is present but fails `new URL()` parsing at read time, treat it as absent.

### Gear Icon in Popup (`popup.html` + `popup.js`)

A small gear button (⚙) added to the popup header area with `aria-label="Open settings"`. Clicking it calls `chrome.runtime.openOptionsPage()`. With `open_in_tab: true` in the manifest, this opens `options.html` in a new tab in both Chrome and Firefox. The popup closes naturally when a new tab is opened.

### Popup Host Check (`popup.js`)

`popup.js` will be refactored from callback-style to `async/await`. The active tab and stored URL are fetched in parallel using `chrome.storage.sync.get` with a default value to ensure a consistent result type:

```js
const [tabs, { jiraServerUrl }] = await Promise.all([
  chrome.tabs.query({ active: true, currentWindow: true }),
  chrome.storage.sync.get({ jiraServerUrl: "" })
]);
```

`getIssueDataFromTab(tab, jiraServerUrl)` receives the raw `tab` object. Inside, `tab.url` is parsed with `new URL(tab.url)`. The resulting `URL` object (`tabUrl`) is used in `isValidJiraHost`:

```
isValidJiraHost(tabUrl, storedUrl):
  // tabUrl is a URL object (from new URL(tab.url))
  if tabUrl.hostname.endsWith(".atlassian.net") → true
  if storedUrl.trim() is non-empty:
    try:
      base = new URL(storedUrl).href stripped of trailing slash
      // base + "/" covers both root and subpath cases since browsers
      // always include the trailing slash on root hrefs
      return tabUrl.href.startsWith(base + "/")
    catch: return false
  return false
```

Path comparison is case-sensitive (Jira Server on Linux is case-sensitive). The URL API normalises scheme and hostname to lowercase automatically.

**Canonical URL construction:**
- Jira Cloud: `url.origin + "/browse/" + issueKey` (unchanged)
- Jira Server: `base + "/browse/" + issueKey` where `base` is derived from `storedUrl` as above

Jira Server uses the same URL structure as Jira Cloud (`/browse/PROJ-123`), so the existing issue key parsing logic (`/browse/([A-Z][A-Z0-9_]+-\d+)` and `selectedIssue` query param) applies unchanged.

### Manifest Changes (`manifest.json`)

- Add `"storage"` to `"permissions"`.
- Add `"options_ui": { "page": "options.html", "open_in_tab": true }`.

`open_in_tab: true` is required for Chrome to open the options page in a new tab rather than an embedded panel; Firefox MV3 ignores the flag and always opens options in a new tab regardless. The net result is consistent: both browsers open the page in a tab. A single shared `manifest.json` works for both browsers. No `host_permissions` change is needed — when the user clicks the extension action to open the popup (a qualifying gesture that activates `activeTab`), `chrome.tabs.query` returns `tab.url` for the active tab. The existing `try { url = new URL(tab.url) } catch { return null }` guard in `getIssueDataFromTab` handles any edge case where `tab.url` is unavailable.

## Files Changed

- `manifest.json` — Add `storage` permission; add `options_ui`
- `popup.html` — Add gear icon button with `aria-label`
- `popup.js` — Refactor to async/await; parallel storage+tab fetch; extract `isValidJiraHost`; support Jira Server canonical URL
- `options.html` — New: URL input form
- `options.js` — New: load/save/delete logic with validation

## Out of Scope

- Injecting the Share button (`content.js`) into Jira Server pages.
- Multiple Server URLs.
- HTTP (non-TLS) Jira instances.
