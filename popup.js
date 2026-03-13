(() => {
  "use strict";

  const contentEl = document.getElementById("content");
  const messageEl = document.getElementById("message");

  function showMessage(text) {
    contentEl.style.display = "none";
    messageEl.style.display = "block";
    messageEl.textContent = text;
  }

  function copyAndClose(text) {
    navigator.clipboard.writeText(text).then(() => {
      showMessage("Copied!");
      setTimeout(() => window.close(), 600);
    }).catch(() => {
      showMessage("Could not copy to clipboard.");
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url || !tab.title) {
      showMessage("No page info available.");
      return;
    }

    const url = tab.url;
    const title = tab.title;

    document.getElementById("issue-title").textContent = title;

    document.getElementById("slack-btn").addEventListener("click", () =>
      copyAndClose(`<${url}|${title}>`)
    );
    document.getElementById("markdown-btn").addEventListener("click", () =>
      copyAndClose(`[${title}](${url})`)
    );
    document.getElementById("confluence-btn").addEventListener("click", () =>
      copyAndClose(`[${title}|${url}]`)
    );
  });
})();
