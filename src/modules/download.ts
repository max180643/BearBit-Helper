import {
  CACHE_DEFAULT_EXPIRE,
  DB_TORRENT_OBJECT_NAME,
  TorrentDetails,
  addCacheData,
  getCacheData,
  updateCacheData
} from '../utils/cache';
import { fetchData, parseDocument, responseTextDecode } from '../utils/http';
import { extractDetailsUrlParameter } from '../utils/url';
import { sendThanksRequest } from './thanks';

async function enableDownloadButton(): Promise<void> {
  const path = window.location.pathname;
  if (
    path === '/viewno18sb.php' ||
    path === '/viewno18sbx.php' ||
    path === '/viewbrsb.php'
  ) {
    const details = document.querySelectorAll("td > a[href^='details.php']");
    details.forEach(detail => {
      const torrentDetailUrl = (detail as HTMLLinkElement).href;
      if (torrentDetailUrl.includes('/details.php')) {
        const torrentDetails = extractDetailsUrlParameter(torrentDetailUrl);
        if (torrentDetailUrl && torrentDetails.torrentId) {
          (detail.parentNode as HTMLElement).appendChild(
            generateDownloadButton(torrentDetailUrl, torrentDetails.torrentId)
          );
        }
      }
    });
  }
}

function disableDownloadButton() {
  const path = window.location.pathname;

  if (
    path === '/viewno18sb.php' ||
    path === '/viewno18sbx.php' ||
    path === '/viewbrsb.php'
  ) {
    const downloadButtons = document.querySelectorAll(
      '[bearbit-helper="download-btn"]'
    );

    if (downloadButtons) {
      downloadButtons.forEach(elem => elem.remove());
    }
  }
}

function generateDownloadButton(
  torrentDetailUrl: string,
  torrentId: string
): HTMLButtonElement {
  const button = document.createElement('button');
  button.setAttribute('bearbit-helper', 'download-btn');
  button.style.display = 'block';
  button.style.borderRadius = '4px';
  button.style.backgroundColor = '#fcd34c';
  button.style.marginTop = '5px';
  button.style.cursor = 'pointer';
  button.style.border = '0';
  button.style.padding = '4px';
  button.style.boxShadow =
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)';
  button.addEventListener('mouseover', function () {
    button.style.backgroundColor = '#fde68a';
  });
  button.addEventListener('mouseout', function () {
    button.style.backgroundColor = '#fcd34c';
  });

  const span = document.createElement('span');
  span.textContent = 'Download+';
  span.style.margin = '4px';
  span.style.fontWeight = 'bold';
  span.style.color = '#2664ff';

  button.addEventListener('click', () =>
    thanksAndDownload(torrentDetailUrl, torrentId)
  );

  button.appendChild(span);

  return button;
}

async function thanksAndDownload(
  torrentDetailUrl: string,
  torrentId: string
): Promise<void> {
  const cache: TorrentDetails = await getCacheData(
    torrentId,
    DB_TORRENT_OBJECT_NAME
  );
  if (cache) {
    // check thank
    if (cache?.isThanks === 0) {
      // send thanks request
      const response = await sendThanksRequest(torrentId);
      if (response.ok) {
        // update cache
        const cacheData: TorrentDetails = {
          id: torrentId,
          downloadUrl: cache?.downloadUrl,
          downloadFilename: cache?.downloadFilename,
          isThanks: 1
        };
        updateCacheData(
          cacheData,
          CACHE_DEFAULT_EXPIRE,
          DB_TORRENT_OBJECT_NAME
        );

        // download torrent
        await downloadFile(cache?.downloadUrl, cache?.downloadFilename);
      }
    } else {
      // download torrent
      await downloadFile(cache?.downloadUrl, cache?.downloadFilename);
    }
  } else {
    // get torrent detail
    const bodyResponse = await fetchData(torrentDetailUrl);
    const htmlContent = await responseTextDecode(bodyResponse, 'TIS-620');
    const detailDocument = parseDocument(htmlContent);

    // get download url
    const download = detailDocument.querySelector(
      '[title="Download this file"]'
    ) as HTMLLinkElement;
    const downloadUrl = download.href;
    const downloadFilename = fixDownloadFilename(download.innerText);

    // set cache
    const cacheData: TorrentDetails = {
      id: torrentId,
      downloadUrl: downloadUrl,
      downloadFilename: downloadFilename,
      isThanks: 0
    };
    addCacheData(cacheData, CACHE_DEFAULT_EXPIRE, DB_TORRENT_OBJECT_NAME);

    // send thanks request
    const response = await sendThanksRequest(torrentId);
    if (response.ok) {
      // update cache
      const cacheData: TorrentDetails = {
        id: torrentId,
        downloadUrl: downloadUrl,
        downloadFilename: downloadFilename,
        isThanks: 1
      };
      updateCacheData(cacheData, CACHE_DEFAULT_EXPIRE, DB_TORRENT_OBJECT_NAME);

      // download torrent
      await downloadFile(downloadUrl, downloadFilename);
    }
  }
}

async function downloadFile(fileUrl: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    // Remove the anchor element after download
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

function fixDownloadFilename(filename: string) {
  let name = filename;
  name = name.replace('[email protected]', '');
  name = name.replace(/ /g, '_').replace('@', '_');
  if (!name.includes('.torrent')) {
    name = `${name}.torrent`;
  }
  return name;
}

export {
  enableDownloadButton,
  disableDownloadButton,
  downloadFile,
  fixDownloadFilename
};
