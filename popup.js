(() => {
  "use strict";

  const contentEl = document.getElementById("content");
  const messageEl = document.getElementById("message");

  function showMessage(text) {
    contentEl.style.display = "none";
    messageEl.style.display = "block";
    messageEl.textContent = text;
  }

  function isValidJiraHost(tabUrl, storedUrl) {
    if (tabUrl.hostname.endsWith(".atlassian.net")) return true;
    if (storedUrl && storedUrl.trim()) {
      try {
        const base = new URL(storedUrl).href.replace(/\/$/, "");
        return tabUrl.href.startsWith(base + "/");
      } catch {
        return false;
      }
    }
    return false;
  }

  function getIssueDataFromTab(tab, storedUrl) {
    if (!tab || !tab.url) return null;

    let url;
    try { url = new URL(tab.url); } catch { return null; }

    if (!isValidJiraHost(url, storedUrl)) return null;

    // Try /browse/PROJ-123
    const browseMatch = url.pathname.match(/\/browse\/([A-Z][A-Z0-9_]+-\d+)/);
    let issueKey = browseMatch ? browseMatch[1] : null;

    // Fallback: selectedIssue query param (board/modal view)
    if (!issueKey) {
      const selected = url.searchParams.get("selectedIssue");
      if (selected && /^[A-Z][A-Z0-9_]+-\d+$/.test(selected)) {
        issueKey = selected;
      }
    }

    if (!issueKey) return null;

    // Parse title from tab title — handles "PROJ-123 - Title - Jira" and "[PROJ-123] Title - Jira"
    const tabTitle = tab.title || "";
    const titleMatch = tabTitle.match(/^\[?[A-Z][A-Z0-9_]+-\d+\]?\s*[-–]?\s*(.+?)(?:\s*[-–]\s*Jira)?$/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : tabTitle;
    const title = rawTitle.replace(/^\[?[A-Z][A-Z0-9_]+-\d+\]?\s*[-–:]?\s*/i, "").trim();

    // Canonical URL: Cloud uses origin; Server uses stored base
    let canonicalBase;
    if (url.hostname.endsWith(".atlassian.net")) {
      canonicalBase = url.origin;
    } else {
      try {
        canonicalBase = new URL(storedUrl).href.replace(/\/$/, "");
      } catch {
        canonicalBase = url.origin;
      }
    }

    return { issueKey, title, url: `${canonicalBase}/browse/${issueKey}` };
  }

  function copyAndClose(format, data) {
    let text;
    if (format === "slack") {
      text = `${data.issueKey}: ${data.url}`;
    } else if (format === "confluence") {
      text = `[${data.issueKey}: ${data.title}|${data.url}]`;
    } else {
      text = `[${data.issueKey}: ${data.title}](${data.url})`;
    }

    navigator.clipboard.writeText(text).then(() => {
      showMessage("Copied!");
      setTimeout(() => window.close(), 600);
    }).catch(() => {
      showMessage("Could not copy to clipboard.");
    });
  }

  document.getElementById("settings-btn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  (async () => {
    const [tabs, { jiraServerUrl }] = await Promise.all([
      chrome.tabs.query({ active: true, currentWindow: true }),
      chrome.storage.sync.get({ jiraServerUrl: "" })
    ]);

    const data = getIssueDataFromTab(tabs[0], jiraServerUrl);
    if (!data) {
      showMessage("Not on a Jira issue page.");
      return;
    }

    document.getElementById("issue-key").textContent = data.issueKey;
    document.getElementById("issue-title").textContent = data.title;
    document.getElementById("slack-btn").addEventListener("click", () => copyAndClose("slack", data));
    document.getElementById("markdown-btn").addEventListener("click", () => copyAndClose("markdown", data));
    document.getElementById("confluence-btn").addEventListener("click", () => copyAndClose("confluence", data));
  })();
})();
