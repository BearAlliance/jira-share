(() => {
  "use strict";

  const contentEl = document.getElementById("content");
  const messageEl = document.getElementById("message");

  function showMessage(text) {
    contentEl.style.display = "none";
    messageEl.style.display = "block";
    messageEl.textContent = text;
  }

  function getIssueDataFromTab(tab) {
    if (!tab || !tab.url) return null;

    let url;
    try { url = new URL(tab.url); } catch { return null; }

    if (!url.hostname.endsWith(".atlassian.net")) return null;

    // Try /browse/PROJ-123
    const browseMatch = url.pathname.match(/\/browse\/([A-Z][A-Z0-9_]+-\d+)/);
    let issueKey = browseMatch ? browseMatch[1] : null;

    // Fallback: selectedIssue query param
    if (!issueKey) {
      const selected = url.searchParams.get("selectedIssue");
      if (selected && /^[A-Z][A-Z0-9_]+-\d+$/.test(selected)) {
        issueKey = selected;
      }
    }

    if (!issueKey) return null;

    // Parse title from tab title (typically "PROJ-123 - Title - Jira" or "[PROJ-123] Title - Jira")
    const tabTitle = tab.title || "";
    const titleMatch = tabTitle.match(/^\[?[A-Z][A-Z0-9_]+-\d+\]?\s*[-–]\s*(.+?)(?:\s*[-–]\s*Jira)?$/i);
    const title = titleMatch ? titleMatch[1].trim() : tabTitle;

    const canonicalUrl = `${url.origin}/browse/${issueKey}`;
    return { issueKey, title, url: canonicalUrl };
  }

  function copyAndClose(format, data) {
    let text;
    if (format === "slack") {
      text = `<${data.url}|${data.issueKey}: ${data.title}>`;
    } else {
      text = `[${data.issueKey}: ${data.title}](${data.url})`;
    }

    navigator.clipboard.writeText(text).then(() => {
      showMessage("Copied!");
      setTimeout(() => window.close(), 600);
    });
  }

  // Get the active tab and set up buttons
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const data = getIssueDataFromTab(tabs[0]);
    if (!data) {
      showMessage("Not on a Jira issue page.");
      return;
    }

    document.getElementById("issue-key").textContent = data.issueKey;
    document.getElementById("issue-title").textContent = data.title;
    document.getElementById("slack-btn").addEventListener("click", () => copyAndClose("slack", data));
    document.getElementById("markdown-btn").addEventListener("click", () => copyAndClose("markdown", data));
  });
})();
