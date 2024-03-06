document.addEventListener("DOMContentLoaded", function () {
  // AutoThanks Toggle
  chrome.storage.sync.get("autoThanksEnabled", function (data) {
    const toggleAutoThanks = document.getElementById("toggleAutoThanks");

    toggleAutoThanks.checked = data.autoThanksEnabled || false;

    toggleAutoThanks.addEventListener("change", function () {
      chrome.storage.sync.set({ autoThanksEnabled: toggleAutoThanks.checked });
    });
  });

  // Screenshot toggle
  chrome.storage.sync.get("screenshotEnabled", function (data) {
    const toggleScreenshot = document.getElementById("toggleScreenshot");

    toggleScreenshot.checked = data.screenshotEnabled || false;

    toggleScreenshot.addEventListener("change", function () {
      chrome.storage.sync.set({ screenshotEnabled: toggleScreenshot.checked });
    });
  });
});
