import {
  CACHE_DEFAULT_EXPIRE,
  DB_TORRENT_OBJECT_NAME,
  TorrentDetails,
  addCacheData,
  updateCacheData
} from '../utils/cache';
import { fetchData, responseTextDecode } from '../utils/http';
import { downloadFile, fixDownloadFilename } from './download';

async function enableAutoThanks(): Promise<void> {
  const path = window.location.pathname;
  if (path === '/details.php') {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const torrentId = urlSearchParams.get('id') ?? '';

    const thanksRequest = document.getElementById('saythanks');
    if (thanksRequest && torrentId) {
      try {
        const response = await sendThanksRequest(torrentId);
        const body = await responseTextDecode(response, 'TIS-620');

        if (body.includes('กดขอบคุณ')) {
          const thanksGuideElement = document.querySelector(
            'body > table.mainouter > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td.rowhead > font'
          ) as HTMLElement;
          thanksGuideElement.style.color = '#D91BEA';
          thanksGuideElement.innerHTML = 'Download';
          const thanksRequestParentElement =
            thanksRequest.parentNode as HTMLElement;
          thanksRequestParentElement.remove();
        }

        if (body.includes('ผิดพลาด')) {
          throw new Error('fail to thanks / already thanks');
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  if (path === '/downloadnew.php') {
    const thanks = document.querySelector('[title="กดขอบคุณที่นี่"]');
    if (thanks) {
      const thanksElement = thanks.parentNode;
      if (thanksElement) {
        const thanksOnclick = (thanksElement as HTMLLinkElement).getAttribute(
          'onclick'
        );
        const pattern = /id=(\d+)/;
        const match = thanksOnclick?.match(pattern);
        if (match) {
          const torrentId = match[1];
          const downloadUrl = window.location.href;
          const urlSearchParams = new URLSearchParams(window.location.search);
          const filename = decodeURIComponent(
            urlSearchParams.get('filename') ?? 'download'
          );
          const downloadFilename = fixDownloadFilename(filename);
          const referrer = document.referrer;

          // set cache
          const cacheData: TorrentDetails = {
            id: torrentId,
            downloadUrl: downloadUrl,
            downloadFilename: downloadFilename,
            isThanks: 0
          };
          addCacheData(cacheData, CACHE_DEFAULT_EXPIRE, DB_TORRENT_OBJECT_NAME);

          const response = await sendThanksRequest(torrentId);
          if (response.ok) {
            // update cache
            const cacheData: TorrentDetails = {
              id: torrentId,
              downloadUrl: downloadUrl,
              downloadFilename: downloadFilename,
              isThanks: 1
            };
            updateCacheData(
              cacheData,
              CACHE_DEFAULT_EXPIRE,
              DB_TORRENT_OBJECT_NAME
            );

            await downloadFile(downloadUrl, downloadFilename);
            if (referrer) {
              window.location.href = referrer;
            } else {
              window.location.href = window.location.origin;
            }
          }
        }
      }
    }
  }
}

async function sendThanksRequest(torrentId: string): Promise<Response> {
  try {
    const url = `${window.location.origin}/ajax.php?action=say_thanks&id=${torrentId}`;
    const bodyResponse = await fetchData(url);
    return bodyResponse;
  } catch (error) {
    throw new Error('fail to thanks / already thanks');
  }
}

export { enableAutoThanks, sendThanksRequest };
