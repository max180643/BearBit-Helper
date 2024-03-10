import "./popup.css";

document.addEventListener("DOMContentLoaded", () => {
  // Function to handle toggle settings
  function toggleSetting(settingKey: string, toggleElement: string): void {
    chrome.storage.sync.get({ [settingKey]: false }, (data) => {
      const toggle = document.getElementById(toggleElement) as HTMLInputElement;
      toggle.checked = data[settingKey];

      toggle.addEventListener("change", () => {
        const updatedSettings = { [settingKey]: toggle.checked };
        chrome.storage.sync.set(updatedSettings);
      });
    });
  }

  // AutoThanks toggle
  toggleSetting("autoThanksEnabled", "toggleAutoThanks");

  // Screenshot toggle
  toggleSetting("screenshotEnabled", "toggleScreenshot");

  // Blur NSFW toggle
  toggleSetting("blurNsfwEnabled", "toggleBlurNsfw");
});
