(() => {
  "use strict";

  // --- Data extraction ---

  function getIssueData() {
    // Try URL path first: /browse/PROJ-123
    const browseMatch = window.location.pathname.match(/\/browse\/([A-Z][A-Z0-9_]+-\d+)/);
    let issueKey = browseMatch ? browseMatch[1] : null;

    // Fallback: selectedIssue query param (board/modal view)
    if (!issueKey) {
      const params = new URLSearchParams(window.location.search);
      const selected = params.get("selectedIssue");
      if (selected && /^[A-Z][A-Z0-9_]+-\d+$/.test(selected)) {
        issueKey = selected;
      }
    }

    if (!issueKey) return null;

    // Get issue title
    const summaryEl = document.querySelector(
      '[data-testid="issue.views.issue-base.foundation.summary.heading"]'
    );
    let title = summaryEl ? summaryEl.textContent.trim() : "";
    if (!title) {
      // Fallback: parse document title — handles formats like:
      //   "KAN-1 - Title - Jira", "[KAN-1] Title - Jira", "[KAN-1] Title"
      const docTitle = document.title;
      const titleMatch = docTitle.match(/^\[?[A-Z][A-Z0-9_]+-\d+\]?\s*[-–]?\s*(.+?)(?:\s*[-–]\s*Jira)?$/i);
      title = titleMatch ? titleMatch[1].trim() : docTitle;
    }
    // Strip any leading "[KEY]" or "KEY: " or "KEY - " the title may still contain
    title = title.replace(/^\[?[A-Z][A-Z0-9_]+-\d+\]?\s*[-–:]?\s*/i, "").trim();

    const url = `${window.location.origin}/browse/${issueKey}`;
    return { issueKey, title, url };
  }

  // --- Clipboard ---

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for Firefox edge cases
    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  // --- Format + copy ---

  function copyIssueLink(format) {
    const data = getIssueData();
    if (!data) return;

    let text;
    if (format === "slack") {
      text = `${data.issueKey}: ${data.url}`;
    } else if (format === "confluence") {
      text = `[${data.issueKey}: ${data.title}|${data.url}]`;
    } else {
      text = `[${data.issueKey}: ${data.title}](${data.url})`;
    }

    const btn = document.querySelector(".quickshare-btn");
    copyToClipboard(text).then(() => {
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = original; }, 1500);
      }
    });

    // Close dropdown
    const dropdown = document.querySelector(".quickshare-dropdown");
    if (dropdown) dropdown.classList.remove("quickshare-open");
  }

  // --- UI ---

  function createShareButton() {
    const container = document.createElement("div");
    container.id = "quickshare-btn";
    container.className = "quickshare-container";

    const btn = document.createElement("button");
    btn.className = "quickshare-btn";
    btn.textContent = "Share";
    btn.type = "button";

    const dropdown = document.createElement("div");
    dropdown.className = "quickshare-dropdown";

    // Issue preview header
    const header = document.createElement("div");
    header.className = "quickshare-dropdown-header";
    const headerKey = document.createElement("span");
    headerKey.className = "quickshare-dropdown-key";
    const headerTitle = document.createElement("span");
    headerTitle.className = "quickshare-dropdown-title";
    header.appendChild(headerKey);
    header.appendChild(headerTitle);
    dropdown.appendChild(header);

    const divider = document.createElement("div");
    divider.className = "quickshare-dropdown-divider";
    dropdown.appendChild(divider);

    const slackBtn = document.createElement("button");
    slackBtn.className = "quickshare-dropdown-item";
    slackBtn.textContent = "Copy as Slack";
    slackBtn.type = "button";
    slackBtn.addEventListener("click", () => copyIssueLink("slack"));

    const mdBtn = document.createElement("button");
    mdBtn.className = "quickshare-dropdown-item";
    mdBtn.textContent = "Copy as Markdown";
    mdBtn.type = "button";
    mdBtn.addEventListener("click", () => copyIssueLink("markdown"));

    const confluenceBtn = document.createElement("button");
    confluenceBtn.className = "quickshare-dropdown-item";
    confluenceBtn.textContent = "Copy as Confluence";
    confluenceBtn.type = "button";
    confluenceBtn.addEventListener("click", () => copyIssueLink("confluence"));

    dropdown.appendChild(slackBtn);
    dropdown.appendChild(mdBtn);
    dropdown.appendChild(confluenceBtn);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Refresh issue data each time dropdown opens
      const data = getIssueData();
      if (data) {
        headerKey.textContent = data.issueKey;
        headerTitle.textContent = data.title;
      }
      dropdown.classList.toggle("quickshare-open");
    });

    container.appendChild(btn);
    container.appendChild(dropdown);

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove("quickshare-open");
      }
    });

    return container;
  }

  // --- Injection ---

  function tryInjectButton() {
    if (document.getElementById("quickshare-btn")) return;
    if (!getIssueData()) return;

    const toolbar =
      document.querySelector('[data-testid="issue.views.issue-base.foundation.quick-add.quick-add-item.all-items"]') ||
      document.querySelector('[data-testid="issue-view-layout.header.actions"]');

    if (!toolbar) return;

    const shareButton = createShareButton();
    toolbar.appendChild(shareButton);
  }

  // --- Observer ---

  let lastUrl = window.location.href;
  let debounceTimer = null;

  const observer = new MutationObserver(() => {
    // Detect SPA navigation
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      const existing = document.getElementById("quickshare-btn");
      if (existing) existing.remove();
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(tryInjectButton, 300);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial injection attempt
  tryInjectButton();
})();
