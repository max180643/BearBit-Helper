import { enableAutoThanks } from './modules/thanks';
import { enableScreenshot, disableScreenshot } from './modules/screenshot';
import { enableBlurNsfw, disableBlurNsfw } from './modules/nsfw';
import {
  disableDownloadButton,
  enableDownloadButton
} from './modules/download';

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

function downloadButtonHandler() {
  chrome.storage.sync.get(
    'downloadButtonEnable',
    ({ downloadButtonEnable }) => {
      const enabled = downloadButtonEnable || false;
      enabled ? enableDownloadButton() : disableDownloadButton();
    }
  );
}

function storageChangedListener() {
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

    if (changes.downloadButtonEnable) {
      downloadButtonHandler();
    }
  });
}

function defaultStorage() {
  chrome.storage.sync.get(
    [
      'autoThanksEnabled',
      'screenshotEnabled',
      'blurNsfwEnabled',
      'downloadButtonEnable'
    ],
    ({
      autoThanksEnabled,
      screenshotEnabled,
      blurNsfwEnabled,
      downloadButtonEnable
    }) => {
      if (autoThanksEnabled === null || autoThanksEnabled === undefined) {
        chrome.storage.sync.set({ autoThanksEnabled: true });
      }

      if (screenshotEnabled === null || screenshotEnabled === undefined) {
        chrome.storage.sync.set({ screenshotEnabled: true });
      }

      if (blurNsfwEnabled === null || blurNsfwEnabled === undefined) {
        chrome.storage.sync.set({ blurNsfwEnabled: true });
      }

      if (downloadButtonEnable === null || downloadButtonEnable === undefined) {
        chrome.storage.sync.set({ downloadButtonEnable: true });
      }
    }
  );
}

function main() {
  // set default storage when storage undefined
  defaultStorage();
  // method handler
  autoThanksHandler();
  screenshotHandler();
  blurNsfwHandler();
  downloadButtonHandler();
  // listener
  storageChangedListener();
}

main();
