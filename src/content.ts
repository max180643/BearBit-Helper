import { enableAutoThanks } from "./modules/thanks";
import { enableScreenshot, disableScreenshot } from "./modules/screenshot";

function autoThanksHandler() {
  chrome.storage.sync.get("autoThanksEnabled", ({ autoThanksEnabled }) => {
    const enabled = autoThanksEnabled || false;
    if (enabled) {
      enableAutoThanks();
    }
  });
}

function screenshotHandler() {
  chrome.storage.sync.get("screenshotEnabled", ({ screenshotEnabled }) => {
    const enabled = screenshotEnabled || false;
    enabled ? enableScreenshot() : disableScreenshot();
  });
}

// Listen for changes in the storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.autoThanksEnabled) {
    autoThanksHandler();
  }

  if (changes.screenshotEnabled) {
    screenshotHandler();
  }
});

function main() {
  autoThanksHandler();
  screenshotHandler();
}

main();
