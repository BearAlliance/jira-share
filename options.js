(() => {
  "use strict";

  const urlInput = document.getElementById("server-url");
  const saveBtn  = document.getElementById("save-btn");
  const statusEl = document.getElementById("status");

  function showStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.className = "status" + (isError ? " status-error" : " status-ok");
    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "status";
    }, 2500);
  }

  // Pre-populate with saved value
  chrome.storage.sync.get({ jiraServerUrl: "" }, ({ jiraServerUrl }) => {
    urlInput.value = jiraServerUrl;
  });

  saveBtn.addEventListener("click", () => {
    const raw = urlInput.value.trim();

    // Empty input → delete the stored key
    if (!raw) {
      chrome.storage.sync.remove("jiraServerUrl", () => showStatus("Saved."));
      return;
    }

    // Validate
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      showStatus("Invalid URL.", true);
      return;
    }

    if (parsed.protocol !== "https:") {
      showStatus("Only https:// URLs are supported.", true);
      return;
    }

    // Strip trailing slash before storing
    const normalised = parsed.href.replace(/\/$/, "");
    chrome.storage.sync.set({ jiraServerUrl: normalised }, () => showStatus("Saved."));
  });
})();
