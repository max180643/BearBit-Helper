import { enableAutoThanks } from './modules/thanks';
import { enableScreenshot, disableScreenshot } from './modules/screenshot';
import { enableBlurNsfw, disableBlurNsfw } from './modules/nsfw';

function autoThanksHandler() {
  chrome.storage.sync.get('autoThanksEnabled', ({ autoThanksEnabled }) => {
    const enabled = autoThanksEnabled || false;
    if (enabled) {
      enableAutoThanks();
    }
  });
}

function screenshotHandler() {
  chrome.storage.sync.get(
    ['screenshotEnabled', 'blurNsfwEnabled'],
    ({ screenshotEnabled, blurNsfwEnabled }) => {
      const enabled = screenshotEnabled || false;
      const enabledBlur = blurNsfwEnabled || false;
      enabled ? enableScreenshot(enabledBlur) : disableScreenshot();
    }
  );
}

function blurNsfwHandler() {
  chrome.storage.sync.get('blurNsfwEnabled', ({ blurNsfwEnabled }) => {
    const enabled = blurNsfwEnabled || false;
    enabled ? enableBlurNsfw() : disableBlurNsfw();
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

  if (changes.blurNsfwEnabled) {
    blurNsfwHandler();
  }
});

function main() {
  autoThanksHandler();
  screenshotHandler();
  blurNsfwHandler();
}

main();
